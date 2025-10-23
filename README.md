# 🚀 Quick Setup Guide

## Fitur Utama

- 🎥 **Streaming Kamera Real-time**: Tampilan kamera langsung di browser
- 🧠 **Deteksi AI**: Menggunakan model YOLO untuk mendeteksi huruf isyarat
- 📊 **Statistik Real-time**: Menampilkan confidence, FPS, dan riwayat prediksi
- 🎛️ **Kontrol Lengkap**: Pemilihan kamera, start/stop deteksi, reload model
- 📱 **Responsive Design**: Bekerja di desktop dan mobile
- 🔔 **Notifikasi**: Toast notifications untuk feedback user

## Struktur Project

```
sign-language-app/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   └── best.pt            # Model YOLO (copy dari project Anda)
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styling
│   └── script.js          # JavaScript logic
└── README.md
```
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

## Instalasi Manual (Jika skrip tidak berjalan)

### Backend (Python)

1. **Setup Environment**:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

3. **Copy Model**:
Copy file `best.pt` dari project Anda ke folder `backend/`

4. **Run Server**:
```bash
python app.py
```

Backend akan berjalan di `http://localhost:5000`

### Frontend

Frontend berjalan sebagai static files, bisa menggunakan Python HTTP server:

```bash
cd frontend
python -m http.server 8000
```

Atau langsung buka `index.html` di browser.




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

## Penggunaan

1. **Menjalankan Aplikasi**:
   - Pastikan backend berjalan di port 5000
   - Buka frontend di browser
   - Pastikan kamera tersedia

2. **Kontrol Utama**:
   - **Pilih Kamera**: Dropdown untuk memilih kamera yang tersedia
     - **Mulai Deteksi**: Tombol untuk memulai prediksi bahasa isyarat
   - **Hentikan Deteksi**: Tombol untuk menghentikan prediksi
   - **Reload Model**: Memuat ulang model YOLO

3. **Tampilan Informasi**:
   - **Huruf Terdeteksi**: Huruf yang terdeteksi saat ini
     - **Confidence**: Persentase kepercayaan prediksi
   - **FPS**: Frame rate kamera
   - **Riwayat Prediksi**: 10 prediksi terakhir

## API Endpoints

### Backend API (Flask)

- `GET /` - Status server
- `GET /api/camera/status` - Status kamera dan model
- `POST /api/camera/set_index` - Mengatur index kamera
- `GET /api/prediction` - Mendapatkan prediksi saat ini
- `GET /api/cameras/list` - Daftar kamera yang tersedia
- `GET /video_feed` - Streaming video MJPEG
- `GET /api/model/reload` - Memuat ulang model

## Konfigurasi

### Backend Configuration (app.py)

```python
# Model configuration
WEIGHTS_PATH = "best.pt"           # Path ke model YOLO
CONFIDENCE_THRESHOLD = 0.25        # Threshold confidence
IMG_SIZE = 640                     # Ukuran input model
```

### Frontend Configuration (script.js)

```javascript
this.backendUrl = 'http://localhost:5000';  // URL backend
```

## Troubleshooting

### Kamera Tidak Terdeteksi
1. Pastikan kamera tidak digunakan aplikasi lain
2. Cek permission kamera di browser
3. Coba ganti index kamera (0, 1, 2, dst)

### Model Tidak Terload
1. Pastikan file `best.pt` ada di folder backend
2. Cek path model di `app.py`
3. Restart server setelah copy model

### Video Feed Error
1. Pastikan backend berjalan
2. Cek firewall/antivirus
3. Pastikan port 5000 tidak digunakan

### Performance Issues
1. Kurangi resolusi kamera
2. Pastikan GPU tersedia untuk YOLO
3. Tutup aplikasi lain yang menggunakan kamera

## Pengembangan Lebih Lanjut

### Fitur yang Bisa Ditambahkan
1. **Recording**: Simpan video hasil deteksi
2. **Dataset Training**: Tambah data untuk huruf baru
3. **Multi-hand Detection**: Deteksi dua tangan
4. **Mobile App**: Versi mobile dengan React Native
5. **Cloud Deployment**: Deploy ke cloud service

### Optimasi Performa
1. **Model Quantization**: Kecilkan model untuk mobile
2. **Batch Processing**: Proses multiple frame
3. **GPU Acceleration**: Optimasi untuk GPU
4. **Caching**: Cache prediksi serupa

## Teknologi yang Digunakan

- **Backend**: Python, Flask, OpenCV, YOLO
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Model**: YOLOv8 untuk object detection
- **Communication**: REST API, MJPEG streaming
- **Styling**: Tailwind CSS inspired design

## Lisensi

Project ini untuk keperluan edukasi dan riset.

## Kontribusi

1. Fork project
2. Buat branch fitur
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

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

- hub : ahmadal2404@gmail.com
