import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from database import get_movies_dataframe

class MovieRecommender:
    def __init__(self, tfidf_path="overview_tfidf.pkl"):
        self.df = get_movies_dataframe()
        with open(tfidf_path, "rb") as f:
            self.overview_tfidf = pickle.load(f)

    def recommend(self, title: str, num_recommendations: int = 6):
        if title not in self.df['Series_Title'].values:
            return None

        movie_idx = self.df[self.df['Series_Title'] == title].index[0]
        cluster_label = self.df.loc[movie_idx, 'Cluster']
        cluster_movies = self.df[self.df['Cluster'] == cluster_label]

        movie_vector = self.overview_tfidf[movie_idx]
        similarities = cosine_similarity(movie_vector, self.overview_tfidf[cluster_movies.index]).flatten()
        similar_indices = similarities.argsort()[-(num_recommendations + 1):-1][::-1]

        recommendations = cluster_movies.iloc[similar_indices][
            ['Series_Title', 'Overview', 'IMDB_Rating', 'Poster_Link']
        ]
        return recommendations.to_dict(orient='records')

    def get_all_titles(self):
        return sorted(self.df['Series_Title'].unique().tolist())