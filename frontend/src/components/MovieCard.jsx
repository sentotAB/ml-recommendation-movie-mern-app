import React from 'react';

const DEFAULT_POSTER = '/no-poster.svg';

const getValidPosterUrl = (url) => {
  if (!url || url === 'undefined' || url === 'null' || url.trim() === '') {
    return DEFAULT_POSTER;
  }
  return url;
};

export default function MovieCard({ movie, onClick, isFavorite, onToggleFavorite }) {
  if (!movie) return null;

  return (
    <div
      onClick={() => onClick(movie)}
      className="bg-white rounded-xl shadow cursor-pointer p-2 relative"
    >
      <img
        src={getValidPosterUrl(movie.Poster_Link)}
        alt={movie.Series_Title}
        className="w-full h-72 object-cover rounded"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_POSTER;
        }}
      />
      <h3 className="font-bold text-sm mt-2 truncate">{movie.Series_Title}</h3>

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie);
          }}
          className="absolute top-3 right-3 bg-white/80 rounded-full p-1"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
    </div>
  );
}

