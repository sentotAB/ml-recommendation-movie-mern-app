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
      className="rounded-xl cursor-pointer relative overflow-hidden"
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

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie);
          }}
          className="absolute top-3 right-3"
        >
          <span style={{ color: isFavorite ? 'red' : 'rgba(0,0,0,0.3)' }}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

      )}
    </div>
  );
}