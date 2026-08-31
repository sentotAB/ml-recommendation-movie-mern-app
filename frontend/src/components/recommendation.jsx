import React, { useState } from 'react';
import axios from 'axios';

function MovieRecommender() {
  const [title, setTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ML_API_URL}?title=${encodeURIComponent(title)}`
      );
      
      // Struktur response dari FastAPI melalui Express adalah res.data.recommendations
      setRecommendations(res.data?.recommendations || []);
    } catch (err) {
      // FastAPI biasanya kirim detail, bukan message
      const msg =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.message ||
        err.message ||
        'Gagal mengambil rekomendasi';
      setError(msg);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Cari Rekomendasi Film</h2>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Masukkan judul film..."
            />
            <button onClick={handleSearch}>Cari</button>

            {loading && <p>Memuat rekomendasi...</p>}

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                {recommendations.map((movie, idx) => (
                    <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', width: '150px' }}>
                        <img src={movie.Poster_Link} alt={movie.Series_Title} style={{ width: '100%' }} />
                        <h4>{movie.Series_Title}</h4>
                        <p>⭐ {movie.IMDB_Rating}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieRecommender;