import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './components/MovieCard';
import { Search, Heart, Play, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';


const BASE_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined')
  ? import.meta.env.VITE_API_URL
  : 'https://raiflix.duckdns.org';

const ML_BASE_URL = (import.meta.env.VITE_ML_API_URL && import.meta.env.VITE_ML_API_URL !== 'undefined')
  ? import.meta.env.VITE_ML_API_URL
  : 'https://raiflix.duckdns.org/ml';

const API_BASE = `${BASE_URL}/movies`;    
const GENRES = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Drama', 'Horror', 'Mystery', 'Sci-Fi'];
const YEARS = Array.from({ length: 105 }, (_, i) => (2024 - i).toString()); // Membuat array ['2024', '2023', ..., '1920']

export default function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_movies');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Efek Navbar Transparan saat Di-scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('favorite_movies', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!showFavoritesOnly) {
      fetchMovies();
    }
  }, [search, selectedGenre, selectedYear, sortBy, page, showFavoritesOnly]);

  const fetchMovies = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}?search=${search}&genre=${selectedGenre}&year=${selectedYear}&sort=${sortBy}&page=${page}`
      );
      setMovies(res.data.movies || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectMovie = async (movieOrId) => {
    try {
      let movieData = null;

      if (typeof movieOrId === 'object' && movieOrId !== null) {
        movieData = movieOrId;
      } else if (typeof movieOrId === 'string') {
        try {
          const res = await axios.get(`${API_BASE}/${movieOrId}`);
          movieData = res.data.movie || res.data;
        } catch (expressErr) {
          console.error("❌ ERROR Express Backend:", expressErr);
          return;
        }
      }

      if (!movieData) return;
      setSelectedMovie(movieData);

      if (movieData.Series_Title) {
        try {
          const recRes = await axios.get(
            `${ML_BASE_URL}/recommendations?title=${encodeURIComponent(movieData.Series_Title)}&num=10`
          );
          setRecommendations(recRes.data.recommendations || recRes.data || []);
        } catch (fastApiErr) {
          setRecommendations([]);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data film/rekomendasi:", err);
    }
  };

  const toggleFavorite = (movie) => {
    const exists = favorites.some((fav) => 
      (movie._id && fav._id === movie._id) || fav.Series_Title === movie.Series_Title
    );
    if (exists) {
      setFavorites(favorites.filter((fav) => 
        (movie._id && fav._id !== movie._id) || fav.Series_Title !== movie.Series_Title
      ));
    } else {
      setFavorites([...favorites, movie]);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('');
    setSelectedYear('');
    setSortBy('rating_desc');
    setShowFavoritesOnly(false);
    setPage(1);
  };

  const heroMovie = movies.length > 0 ? movies[0] : null;
  const displayedMovies = showFavoritesOnly ? favorites : movies;

  return (
    <div className="bg-[#F9F9F9] min-h-screen text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3 flex items-center justify-between border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
            RAIFLIX
          </h1>
          <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-slate-600">
            <button 
              onClick={handleResetFilters} 
              className={`px-3 py-1.5 rounded-full transition ${!showFavoritesOnly ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => setShowFavoritesOnly(true)} 
              className={`px-3 py-1.5 rounded-full transition ${showFavoritesOnly ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Daftar Saya ({favorites.length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex items-center bg-slate-100 border border-slate-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-4 py-1.5 transition">
            <Search size={18} className="text-slate-400 mr-2 flex-shrink-0" />
            <input 
              type="text"
              placeholder="Cari film..."
              value={search}
              disabled={showFavoritesOnly}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-24 sm:w-36 md:w-60 disabled:opacity-50"
            />
          </div>

          {/* FILTER TAHUN */}
          <select 
            value={selectedYear} 
            disabled={showFavoritesOnly}
            onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
            className="bg-slate-100 text-sm text-slate-700 rounded-full border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-50 font-medium"
          >
            <option value="">Tahun</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* FILTER GENRE */}
          <select 
            value={selectedGenre} 
            disabled={showFavoritesOnly}
            onChange={(e) => { setSelectedGenre(e.target.value); setPage(1); }}
            className="bg-slate-100 text-sm text-slate-700 rounded-full border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-50 font-medium" 
          >
            <option value="">Genre</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* FILTER SORT BY */}
          <select 
            value={sortBy}
            disabled={showFavoritesOnly}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-slate-100 text-sm text-slate-700 rounded-full border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-50 hidden sm:block font-medium"
          >
            <option value="rating_desc">Top Rating</option>
            <option value="year_desc">Terbaru</option>
            <option value="year_asc">Terlama</option>
          </select>
        </div>
      </nav>

      {/* HERO BANNER */}
      {!showFavoritesOnly && heroMovie && (
        <div className="relative h-[65vh] md:h-[75vh] w-full bg-cover bg-center flex items-end pb-12 px-4 md:px-12 mt-16" style={{
          backgroundImage: `linear-gradient(to top, #F9F9F9 5%, transparent 20%), linear-gradient(to right, rgba(255,255,255,0.95) 10%, rgba(255,255,255,0.4) 40%, transparent 80%), url(${heroMovie.Poster_Link})`
        }}>
          <div className="max-w-2xl z-10">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm tracking-wide">
              IMDb Top Film
            </span>
            <h1 className="text-3xl md:text-5xl font-black mt-3 mb-3 text-slate-900 leading-tight drop-shadow-sm">
              {heroMovie.Series_Title}
            </h1>
            <p className="text-slate-600 text-sm md:text-base line-clamp-3 mb-6 leading-relaxed font-normal">
              {heroMovie.Overview}
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleSelectMovie(heroMovie)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition active:scale-95"
              >
                <Play size={18} className="fill-white" /> Putar
              </button>
              <button 
                onClick={() => handleSelectMovie(heroMovie)}
                className="flex items-center gap-2 bg-slate-200/80 text-slate-800 font-semibold px-6 py-2.5 rounded-full hover:bg-slate-300/80 transition backdrop-blur-sm"
              >
                <Info size={18} /> Selengkapnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KATALOG FILM (GRID & ROW) */}
      <main className={`px-4 md:px-12 ${showFavoritesOnly ? 'pt-24' : 'pt-6'} relative z-20 pb-16`}>
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {showFavoritesOnly ? 'Daftar Favorit Saya' : 'Sedang Tren Sekarang'}
          </h2>
          {(search || selectedGenre || selectedYear) && (
            <button onClick={handleResetFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
              Reset Filter
            </button>
          )}
        </div>

        {displayedMovies.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-base font-medium">Tidak ada film yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedMovies.map((movie, index) => {
              if (!movie) return null;
              const currentMovieId = movie._id || movie.id || movie.Series_Title || index;

              return (
                <MovieCard 
                  key={currentMovieId} 
                  movie={movie} 
                  onClick={handleSelectMovie}
                  isFavorite={favorites.some((fav) => 
                    (fav._id && movie._id && fav._id === movie._id) || 
                    (fav.id && movie.id && fav.id === movie.id) ||
                    (fav.Series_Title === movie.Series_Title)
                  )}
                  onToggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}

        {/* Paginasi */}
        {!showFavoritesOnly && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="px-4 py-2 bg-slate-300 text-slate-900 disabled:opacity-40 rounded-full text-xl font-semibold hover:bg-slate-300 transition flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Sebelum
            </button>
            <span className="text-xl font-bold text-slate-500">{page} / {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-4 py-2 bg-slate-300 text-slate-900 disabled:opacity-40 rounded-full text-xl font-semibold hover:bg-slate-300 transition flex items-center gap-1"
            >
              Lanjut <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
      
      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-400 text-slate-700 text-xl py-10 px-4 md:px-12 mt-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Brand & Deskripsi */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RAIFLIX
              </h2>
              <p className="text-slate-700 text-xl mt-1">
                Katalog 1000 film IMDb terbaik. Interaktif dengan rekomendasi berbasis AI. Mengadopsi UI/UX Netflix sebagai benchmark.
              </p>
            </div>
          </div>

          {/* Link Navigasi Cepat */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <ul className="space-y-2">
              <li className="hover:text-blue-600 cursor-pointer transition">Tanya Jawab (FAQ)</li>     
              <li className="hover:text-blue-600 cursor-pointer transition">Syarat & Ketentuan</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Privasi</li>
            </ul>
            <ul className="space-y-2">
              <li className="hover:text-blue-600 cursor-pointer transition">Akun</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Pusat Bantuan</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Hubungi Kami</li>
            </ul>
          </div>

          {/* Hak Cipta */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-300 text-slate-700 gap-2">
            <p>© {new Date().getFullYear()} Raiflix by Sentot Ali Basah.</p>
          </div>
        </div>
      </footer>

      {/* RAIFLIX DETAIL MODAL OVERLAY */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden relative shadow-2xl border border-slate-200 my-8">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-20 bg-slate-100/80 hover:bg-slate-200 p-2 rounded-full text-slate-700 transition"
            >
              <X size={18} />
            </button>

            {/* Header Modal Detail Film */}
            <div className="relative h-64 md:h-80 bg-cover bg-center flex items-end p-6" style={{
              backgroundImage: `linear-gradient(to top, #FFFFFF 5%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 70%), url(${selectedMovie.Poster_Link})`
            }}>
              <div className="z-10">
                <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{selectedMovie.Series_Title}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-blue-600 bg-blue-50 font-bold text-xs px-2 py-0.5 rounded-full border border-blue-200">
                    IMDb {selectedMovie.IMDB_Rating}
                  </span>
                  <span className="text-xs border border-slate-300 px-2 py-0.5 rounded-full text-slate-600 font-medium bg-white/80">
                    {selectedMovie.Released_Year}
                  </span>
                  <span className="text-xs text-slate-200 font-medium">{selectedMovie.Runtime}</span>
                  <button 
                    onClick={() => toggleFavorite(selectedMovie)}
                    className="ml-auto p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Heart size={18} className={favorites.some((fav) => fav._id === selectedMovie._id) ? 'fill-blue-600 text-blue-600' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* Informasi Detail */}
            <div className="p-6 space-y-4 text-xs md:text-sm text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <p className="text-slate-700 leading-relaxed text-sm font-normal">{selectedMovie.Overview}</p>
                </div>
                <div className="space-y-2 text-xs text-slate-500 border-l border-slate-200 pl-4">
                  <p><span className="text-slate-400 font-medium">Sutradara:</span> {selectedMovie.Director}</p>
                  <p><span className="text-slate-400 font-medium">Pemeran:</span> {selectedMovie.Star1}, {selectedMovie.Star2}</p>
                  <p><span className="text-slate-400 font-medium">Genre:</span> {selectedMovie.Genre}</p>
                </div>
              </div>

              {/* Rekomendasi Similar Movies */}
              {recommendations.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Rekomendasi film yang serupa :</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {recommendations.map(rec => (
                      <div 
                        key={rec._id || rec.Series_Title} 
                        onClick={() => handleSelectMovie(rec)} 
                        className="cursor-pointer group relative rounded-lg overflow-hidden bg-slate-50 hover:shadow-md transition border border-slate-100"
                      >
                        <img src={rec.Poster_Link} alt={rec.Series_Title} className="h-32 w-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="p-2 text-xs truncate font-medium text-slate-700">{rec.Series_Title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
)};