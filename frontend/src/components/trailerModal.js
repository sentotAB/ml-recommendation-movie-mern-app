import React, { useState } from 'react';
import { getMovieTrailerKey } from './tmdbService';

export const MovieCard = ({ movie }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenTrailer = async () => {
    setLoading(true);
    setIsOpen(true);
    
    // Panggil fungsi pencarian trailer TMDB
    const key = await getMovieTrailerKey(movie.Series_Title);
    setTrailerKey(key);
    setLoading(false);
  };

  return (
    <div className="movie-card">
      <img src={movie.Poster_Link} alt={movie.Series_Title} className="w-full h-auto rounded" />
      <h3 className="font-bold text-lg mt-2">{movie.Series_Title}</h3>
      
        // Tombol Play
        <button 
          onClick={handleOpenTrailer}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
        >
          ▶ Putar Trailer
        </button>

          // Modal Video Player
          {isOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 rounded-lg max-w-3xl w-full p-4 relative">
                /* Tombol Close */
                <button 
                  onClick={() => { setIsOpen(false); setTrailerKey(null); }}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 font-bold"
                >
                  ✕
                </button>

                // Content Video Player
                {loading ? (
                  <div className="h-64 flex items-center justify-center text-white">Memuat Trailer...</div>
                ) : trailerKey ? (
                  <div className="aspect-video w-full">
                    <iframe
                      className="w-full h-full rounded"
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                      title={`${movie.Series_Title} Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Maaf, trailer tidak ditemukan untuk film ini.
                  </div>
                )}
              </div>
            </div>
        ) }
    </div>
  );
};