const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const movieRoutes = require('./routes/movieRoutes');

const app = express();


// 1. Konfigurasi CORS
app.use(cors({
  origin: '*', // Izinkan semua origin selama masa development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test  Endpoint (Bisa diakses di browser http://localhost:5000/ untuk tes server)
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server Express berjalan dengan lancar' });
});

// Routes Express
app.use('/api/movies', movieRoutes);

// Endpoint Tambahan: Meneruskan request rekomendasi ke FastAPI ML Service
app.get('/api/recommendations', async (req, res) => {
  try {
    const { title, num } = req.query;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Parameter title wajib diisi' });
    }

    // Panggil FastAPI Service (Default: http://127.0.0.1:8000)
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    
    const response = await axios.get(`${FASTAPI_URL}/recommend`, {
      params: { 
        title: title.trim(), 
        num: num ? parseInt(num) : 10 
      },
      timeout: 5000 // Batas waktu tunggu FastAPI 5 detik agar Express tidak hanging
    });

    // Kirim hasil dari FastAPI ke React
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Menangkap response error dari FastAPI (misal: 404 jika film tidak ada)
      return res.status(error.response.status).json(error.response.data);
    }
    
    console.error(' Gagal menghubungi FastAPI:', error.message);
    res.status(500).json({ 
      message: 'Gagal menghubungi ML Recommendation Service', 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DATABASE || process.env.DATABASE;

// 2. Jalankan Server Express DULU, baru hubungkan MongoDB (Mencegah Network Error di React)
app.listen(PORT, () => {
  console.log(` Server Express berjalan di http://localhost:${PORT}`);
  
  if (!MONGO_URI) {
    console.error(' WARN: Variabel DATABASE / MONGO_URI belum diatur di file .env!');
    return;
  }

  mongoose.connect(MONGO_URI)
    .then(() => console.log(' MongoDB Terhubung'))
    .catch(err => console.error(' Gagal koneksi MongoDB:', err.message));
});