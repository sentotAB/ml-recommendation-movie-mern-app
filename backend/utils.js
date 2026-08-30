// tmdbService.js
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const getMovieTrailerKey = async (movieTitle) => {
  try {
    // Tahap 1: Cari movie_id berdasarkan judul film
    const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: movieTitle,
      },
    });

    const results = searchResponse.data.results;
    if (results.length === 0) return null; // Film tidak ditemukan

    const movieId = results[0].id; // Ambil ID film pertama yang cocok

    // Tahap 2: Ambil daftar video berdasarkan movie_id
    const videoResponse = await axios.get(`${BASE_URL}/movie/${movieId}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    const videos = videoResponse.data.results;

    // Filter video yang bertipe "Trailer" dan dipublikasikan di "YouTube"
    const trailer = videos.find(
      (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
    );

    // Kembalikan key YouTube (jika tidak ada trailer, ambil video pertama apa saja)
    return trailer ? trailer.key : (videos[0]?.key || null);
  } catch (error) {
    console.error("Gagal mengambil trailer dari TMDB:", error);
    return null;
  }
};