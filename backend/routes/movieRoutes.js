const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// Fetch semua movies dengan opsil search, genre, year filter, dan sorting
router.get('/', async (req, res) => {
  try {
    const { search, genre, year, sort, page = 1, limit = 20 } = req.query;
    let query = {};

    // Validasi input search
    if (search && search.trim() !== '') {
      query.Series_Title = { $regex: search.trim(), $options: 'i' };
    }
    
    // Validasi input genre
    if (genre && genre.trim() !== '') {
      query.Genre = { $regex: genre.trim(), $options: 'i' };
    }
    
    // Validasi input year (Di DB tersimpan sebagai String "1994")
    if (year && year.trim() !== '') {
      query.Released_Year = String(year).trim();
    }

    // Opsi Sorting
    let sortOptions = {};
    if (sort === 'rating_desc') sortOptions.IMDB_Rating = -1;
    if (sort === 'rating_asc') sortOptions.IMDB_Rating = 1;
    if (sort === 'year_desc') sortOptions.Released_Year = -1;
    if (sort === 'year_asc') sortOptions.Released_Year = 1;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);

    const movies = await Movie.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean(); // Menggunakan .lean() agar query jauh lebih cepat & tidak tertahan Mongoose Hydration

    const count = await Movie.countDocuments(query);

    res.json({
      movies,
      totalPages: Math.ceil(count / limitNum) || 0,
      currentPage: pageNum
    });
  } catch (err) {
    console.error("Error pada GET /movies ->", err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
});

// Get movie details & 10 cluster recommendations
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validasi Format ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Format ID film tidak valid' });
    }

    // 2. Ambil detail film utama
    const movie = await Movie.findById(id).lean();
    if (!movie) {
      return res.status(404).json({ message: 'Film tidak ditemukan' });
    }

    // 3. Ambil nilai cluster (Cek kapitalisasi 'Cluster' vs 'cluster')
    const clusterVal = movie.Cluster !== undefined ? movie.Cluster : movie.cluster;

    let recommendations = [];

    // Jika nilai cluster ada dan valid
    if (clusterVal !== undefined && clusterVal !== null && clusterVal !== '') {
      const numCluster = Number(clusterVal);

      // Hanya gunakan query tipe Number untuk menghindari Mongoose CastError
      if (!isNaN(numCluster)) {
        recommendations = await Movie.find({
          _id: { $ne: movie._id },
          $or: [
            { Cluster: numCluster },
            { cluster: numCluster }
          ]
        })
        .limit(10)
        .lean();
      }
    }

    res.json({ movie, recommendations });
  } catch (err) {
    console.error("Error pada GET /movies/:id ->", err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
});

module.exports = router;