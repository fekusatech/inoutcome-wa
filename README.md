# InOutCome - WhatsApp Keuangan Bot

Aplikasi WhatsApp bot untuk mengelola transaksi keuangan dalam grup WhatsApp.

## 🚀 Fitur

- ✅ Auto refresh QR code
- 🔒 Keamanan grup (hanya grup yang diizinkan)
- 💰 Pencatatan transaksi keuangan
- 📊 Riwayat transaksi
- 🗄️ Database MySQL
- 🔄 Konfirmasi/revisi transaksi

## 📋 Prerequisites

- Node.js (v14 atau lebih baru)
- MySQL Server
- WhatsApp Web

## 🛠️ Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd inoutcome
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
# Import database schema
mysql -u root -p < database.sql
```

4. **Configure environment**
```bash
# Edit file .env sesuai konfigurasi database Anda
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inoutcome_db
DB_PORT=3306
ALLOWED_GROUP_IDS=120363418918054891@g.us
BOT_NAME=InOutCome Bot
```

5. **Run application**
```bash
npm start
# atau untuk development
npm run dev
```

## 📱 Cara Penggunaan

### 1. Scan QR Code
- Jalankan aplikasi
- Scan QR code yang muncul di terminal dengan WhatsApp di HP
- Bot akan otomatis terhubung

### 2. Input Transaksi
Format: `[dompet] [beli/buy/tumbas] [nama_item] [jumlah] [harga]` atau `[dompet] [beli/buy/tumbas] [nama_item] [harga]` (jumlah=1)

**Contoh Pengeluaran (Outcome):**
```
cash beli eskopi 1 30000
mandiri tumbas rinso 2 5000
gopay buy susu 15000  # jumlah otomatis 1
```

**Contoh Pemasukan (Income):**
```
cash transfer dari wachid 50000
mandiri terima dari budi 25000
gopay dari joko 100000
```

**Dompet yang Tersedia:**
- 💵 Cash (cash)
- 🏦 Mandiri (bank)
- 📱 GoPay (ewallet)
- 📱 OVO (ewallet)
- 📱 DANA (ewallet)

### 3. Konfirmasi Transaksi
Bot akan memberikan ringkasan transaksi:
```
📋 Transaksi Anda:

💸 Pengeluaran:
1. 1 eskopi (cash) - Rp 30,000
2. 2 rinso (mandiri) - Rp 10,000

💰 Pemasukan:
3. Transfer dari wachid (gopay) - Rp 50,000

📊 Ringkasan:
💸 Total Pengeluaran: Rp 40,000
💰 Total Pemasukan: Rp 50,000
💵 Saldo: Rp 10,000

💼 Saldo Dompet:
💵 Cash: Rp 20,000
🏦 Mandiri: Rp 40,000
📱 GoPay: Rp 30,000

Balas ya jika ini sesuai, balas tidak jika ingin revisi
```

### 4. Balas Konfirmasi
- Balas `ya` atau `yes` untuk mengkonfirmasi
- Balas `tidak` atau `no` untuk membatalkan

### 5. Lihat Riwayat
Ketik `!transactions` untuk melihat riwayat transaksi terakhir.

### 6. Kelola Dompet
- `!wallets` - Lihat daftar dompet dan saldo
- `!balance` - Lihat total saldo semua dompet
- `!addwallet [nama] [tipe]` - Tambah dompet baru (tipe: cash, bank, ewallet, other)

## 🗄️ Database Schema

### Tabel `wallets`
- `id` - Primary key
- `group_id` - ID grup WhatsApp
- `wallet_name` - Nama dompet
- `wallet_type` - Tipe dompet (cash, bank, ewallet, other)
- `balance` - Saldo dompet
- `is_active` - Status aktif
- `created_at` - Waktu dibuat
- `updated_at` - Waktu diupdate

### Tabel `transactions`
- `id` - Primary key
- `group_id` - ID grup WhatsApp
- `user_id` - ID user WhatsApp
- `user_name` - Nama user
- `item_name` - Nama item
- `quantity` - Jumlah
- `price` - Harga per item
- `total_amount` - Total harga
- `transaction_category` - Kategori (income/outcome)
- `transaction_type` - Status (pending/confirmed/rejected)
- `wallet_id` - ID dompet (foreign key)
- `sender` - Nama pengirim (untuk income)
- `created_at` - Waktu dibuat
- `updated_at` - Waktu diupdate

## 🔧 Konfigurasi

### Environment Variables
- `DB_HOST` - Host database MySQL
- `DB_USER` - Username database
- `DB_PASSWORD` - Password database
- `DB_NAME` - Nama database
- `DB_PORT` - Port database
- `ALLOWED_GROUP_IDS` - ID grup yang diizinkan (pisahkan dengan koma jika lebih dari satu)
- `BOT_NAME` - Nama bot

### Menambah Grup Baru
1. Dapatkan Group ID dari grup WhatsApp
2. Tambahkan ke `ALLOWED_GROUP_IDS` di file `.env`
3. Restart aplikasi

## 🚨 Troubleshooting

### QR Code tidak muncul
- Pastikan WhatsApp Web tidak sedang digunakan di browser lain
- Restart aplikasi

### Database connection error
- Pastikan MySQL server berjalan
- Periksa konfigurasi database di file `.env`
- Pastikan database `inoutcome_db` sudah dibuat

### Bot tidak merespon
- Pastikan bot sudah terhubung (status READY)
- Periksa apakah grup sudah terdaftar di `ALLOWED_GROUP_IDS`
- Periksa log error di console

## 📝 License

ISC License

## 🤝 Contributing

Silakan buat pull request untuk kontribusi atau laporkan bug melalui issues.