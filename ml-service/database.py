import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# Memuat variabel dari file .env di root
load_dotenv()

# Ambil konfigurasi dari Environment Variables
DATABASE = os.getenv("DATABASE")
DB_NAME = os.getenv("DB_NAME", "movie_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "movies")

# Validasi jika URI tidak ditemukan
if not DATABASE:
    raise ValueError("DATABASE tidak ditemukan di file .env")

client = MongoClient(DATABASE)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def get_movies_dataframe():
    movies_cursor = collection.find({}, {"_id": 0})
    return pd.DataFrame(list(movies_cursor))