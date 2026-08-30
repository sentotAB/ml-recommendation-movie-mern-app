import React, { useState } from 'react';
import { Heart, Play, X, Loader2 } from 'lucide-react';

export default function MovieCard({ movie, onClick, isFavorite, onToggleFavorite }) {

  const [showModal, setShowModal] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const movieId = movie?._id || movie?.id;
  const movieTitle = movie?.Series_Title || movie?.title || 'Untitled Movie';

  // 2. Pembacaan API Key yang aman untuk Vite (tanpa process.env)
  const API_KEY = import.meta?.env?.VITE_TMDB_API_KEY || '';
  console.log("Cek API Key:", import.meta.env.VITE_TMDB_API_KEY);
  
  
  const handlePlayTrailer = async (e) => {
    e.stopPropagation();
    setShowModal(true);
    setLoading(true);
    setErrorMsg('');

    if (!API_KEY) {
      setLoading(false);
      setErrorMsg('API Key TMDB belum diset di file .env (VITE_TMDB_API_KEY)');
      return;
    }

    try {

      // Step 1: Cari Film di TMDB
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieTitle)}`
      );
      const searchData = await searchRes.json();

     

      if (!searchData?.results || searchData.results.length === 0) {
        throw new Error('Film tidak ditemukan di TMDB');
      }

      const tmdbMovieId = searchData.results[0].id;

      // Step 2: Ambil Trailer dari TMDB
      const videoRes = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbMovieId}/videos?api_key=${API_KEY}`
      );
      const videoData = await videoRes.json();

      const trailer = videoData.results?.find(
        (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
      ) || videoData.results?.[0];

      if (trailer && trailer.key) {
        setEmbedUrl(`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`);
      } else {
        throw new Error('Trailer tidak ditemukan');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Trailer tidak tersedia.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = (e) => {
    e.stopPropagation();
    setShowModal(false);
    setEmbedUrl('');
    setErrorMsg('');
  };

  return (
    <>
      <div className="relative bg-zinc-900 rounded overflow-hidden group transition-all duration-300 hover:scale-105 hover:z-30 shadow-lg">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(movie);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white z-30 opacity-0 group-hover:opacity-100 transition duration-200"
          >
            <Heart 
              size={16} 
              className={isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-300'} 
            />
          </button>
        )}

        <div className="aspect-[2/3] w-full overflow-hidden relative">
          <img 
              src={
                (movie.Poster_Link && movie.Poster_Link !== 'undefined')
                  ? movie.Poster_Link 
                  : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1280&auto=format&fit=crop'
              } 
            alt={movieTitle} 
            onClick={() => onClick && onClick(movieId)}
            className="w-full h-full object-cover group-hover:brightness-50 transition duration-300 cursor-pointer"
            onError={(e) => { 
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1280&auto=format&fit=crop'; 
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <button 
              type="button"
              title="Putar Trailer"
              onClick={handlePlayTrailer}
              className="pointer-events-auto p-3.5 bg-white text-black hover:bg-red-600 hover:text-white rounded-full shadow-2xl transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <Play size={22} className="fill-current translate-x-0.5" />
            </button>
          </div>
        </div>
        
        <div 
          onClick={() => onClick && onClick(movieId)} 
          className="p-2.5 bg-zinc-900 cursor-pointer"
        >
          <h3 className="text-white font-bold text-xs truncate">{movieTitle}</h3>
          <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
            <span className="text-green-400 font-bold">★ {movie.IMDB_Rating || 0.0}</span>
            <span>{movie.Released_Year || 'N/A'}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full max-w-4xl bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-white font-bold text-sm md:text-base truncate">
                Trailer: {movieTitle}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {loading ? (
                <div className="flex items-center gap-2 text-white text-sm">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Mencari trailer resmi...</span>
                </div>
              ) : errorMsg ? (
                <div className="text-gray-400 text-sm p-4 text-center">{errorMsg}</div>
              ) : (
                <iframe
                  className="w-full h-full"
                  src={embedUrl}
                  title={`Trailer ${movieTitle}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}