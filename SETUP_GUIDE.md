# 🚀 Quick Setup Guide

## Cara Cepat Menjalankan Aplikasi

### Untuk Windows (Mudah)
1. **Copy model Anda**:
   - Copy file `best.pt` dari project Anda ke folder `backend/`

2. **Jalankan aplikasi**:
   - Double-click `run.bat`
   - Aplikasi akan otomatis terbuka di browser

### Untuk Linux/Mac (Mudah)
1. **Copy model Anda**:
   ```bash
   cp /path/to/your/best.pt backend/
   ```

2. **Jalankan aplikasi**:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

## Cara Manual (Jika Script Tidak Berjalan)

### 1. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python app.py
```

### 2. Setup Frontend (Terminal Baru)
```bash
cd frontend
python -m http.server 8000
```

### 3. Buka Browser
```
http://localhost:8000
```

## File yang Perlu Anda Siapkan

✅ **WAJIB**: Copy `best.pt` (model YOLO Anda) ke folder `backend/`

📁 **Struktur yang benar**:
```
sign-language-app/
├── backend/
│   ├── app.py
│   ├── best.pt  ← Model Anda
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Fitur Utama

- 📹 **Streaming Kamera Real-time**
- 🤖 **AI Prediksi Bahasa Isyarat**
- 📊 **Statistik Live (Confidence, FPS)**
- 🎛️ **Kontrol Kamera & Model**
- 📱 **Responsive Design**

## Troubleshooting Cepat

| Masalah | Solusi |
|---------|---------|
| Kamera tidak terdeteksi | Coba ganti index kamera (0,1,2,3) |
| Model tidak terload | Pastikan `best.pt` di folder backend |
| Video tidak muncul | Cek firewall, pastikan port 5000 terbuka |
| Error Python | Install Python 3.8+ dan pip |

## Testing API
Jalankan `python test_api.py` di folder backend untuk test koneksi.

## Butuh Bantuan?
- Check file `README.md` untuk dokumentasi lengkap
- Check tab "Network" di browser developer tools
- Pastikan tidak ada aplikasi lain yang menggunakan kamera

---

**Selamat mencoba! 🎉**