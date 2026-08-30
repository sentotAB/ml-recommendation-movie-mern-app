from contextlib import asynccontextmanager
import os
import urllib.parse
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, model_validator
import uvicorn

from recommender import MovieRecommender

recommender = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global recommender
    print("Memuat data & model dari MongoDB Atlas...")
    try:
        recommender = MovieRecommender()
    except Exception as e:
        print(f"Gagal memuat MovieRecommender: {e}")
    yield


app = FastAPI(
    title="Movie Recommendation Engine API", version="1.0.0", lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Gunakan Optional agar field yang hilang/null di DB tidak memicu Error 500
class MovieRecommendation(BaseModel):
    Series_Title: Optional[str] = "Unknown Title"
    Overview: Optional[str] = ""
    IMDB_Rating: Optional[float] = 0.0
    Poster_Link: Optional[str] = "https://via.placeholder.com/300x450?text=No+Poster"
    Trailer_Url: Optional[str] = "" # Field baru untuk player
    
    model_config = ConfigDict(from_attributes=True)

# Membuat link pencarian trailer otomatis di YouTube
    @model_validator(mode="after")
    def generate_trailer_url(self) -> "MovieRecommendation":
        if not self.Trailer_Url or self.Trailer_Url == "":
            title = self.Series_Title or "Unknown Title"
            query = urllib.parse.quote(f"{title} official trailer")
            self.Trailer_Url = f"https://www.youtube.com/results?search_query={query}"
        return self

class RecommendationResponse(BaseModel):
    selected_movie: str
    total_recommendations: int
    recommendations: List[MovieRecommendation]

# 1. ROOT ENDPOINT (HEALTH CHECK UNTUK RENDER)
@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Movie Recommendation API is running!",
        "docs": "/docs",
    }


# 2. CATALOG ENDPOINT (UNTUK SEARCH )
@app.get("/movies")
def get_all_movies():
    if not recommender or recommender.df is None:
        raise HTTPException(
            status_code=503, detail="Model belum siap/sedang memuat data."
        )

    titles = sorted(recommender.df["Series_Title"].dropna().unique().tolist())
    return {"total_movies": len(titles), "movies": titles}


# 3. RECOMMENDATION ENDPOINT
@app.get("/recommend", response_model=RecommendationResponse)
def get_recommendations(
    title: str = Query(
        ..., description="Judul film yang ingin dicari rekomendasinya"
    ),
    num: int = Query(6, ge=1, le=20, description="Jumlah rekomendasi (1-20)"),
):
    if not recommender:
        raise HTTPException(
            status_code=503, detail="Model belum siap/sedang memuat data."
        )

    results = recommender.recommend(title=title, num_recommendations=num)
    if results is None:
        raise HTTPException(
            status_code=404, detail=f"Film '{title}' tidak ditemukan."
        )

    return {
        "selected_movie": title,
        "total_recommendations": len(results),
        "recommendations": results,
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)



