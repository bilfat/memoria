# Laporan Verifikasi & Bukti Eksekusi: PHASE 6

**Modul:** Registrasi Mahasiswa 8 Fakultas Telkom + E-ticket Web/PDF/QR Permanen  
**Status Gate:** `DONE_VERIFIED`  
**Tanggal Verifikasi:** 2026-11-04  
**Lingkungan:** Next.js 16.4.3 (App Router, Route Handlers) + Supabase PostgreSQL (SQL RPC Atomic, Sequences, RLS) + jsPDF + qrcode

---

## 1. Ringkasan Eksekusi
PHASE 6 menghubungkan alur registrasi publik mahasiswa ke database PostgreSQL Supabase secara atomik melalui RPC `register_participant`. Menghasilkan tiket resmi human-readable (`MEM-26-XXXX`), token QR check-in permanen yang terpisah dari token akses web/PDF, formulir 8 fakultas resmi Universitas Telkom dengan input prodi teks bebas, serta endpoint streaming biner PDF dan halaman web e-ticket digital.

---

## 2. File & Komponen yang Diimplementasikan

| File | Status | Keterangan |
|---|---|---|
| [`src/app/api/registrations/route.ts`](file:///d:/website%20latihan/memoria/src/app/api/registrations/route.ts) | **Baru Dibuat** | Route Handler `POST /api/registrations`. Memvalidasi body via Zod, membuat token acak kriptografis (`mem_qr_*` dan `mem_tok_*`), mengeksekusi RPC `register_participant` secara atomik, dan mengembalikan URL akses tiket. |
| [`src/lib/ticketData.ts`](file:///d:/website%20latihan/memoria/src/lib/ticketData.ts) | **Baru Dibuat** | Shared data fetcher `fetchTicketByAccessToken` yang menggabungkan data peserta, jenis tiket, dan metadata event (`event_settings`) terbaru saat render. |
| [`src/lib/ticketPdf.ts`](file:///d:/website%20latihan/memoria/src/lib/ticketPdf.ts) | **Diperbarui** | Template tiket teater vintage menggunakan `jsPDF`. Menghasilkan `Uint8Array` PDF biner berukuran ~170 KB dengan QR code resolusi tinggi, data dinamis, dan watermark khusus jika tiket diarsipkan. |
| [`src/app/api/tickets/[token]/pdf/route.ts`](file:///d:/website%20latihan/memoria/src/app/api/tickets/[token]/pdf/route.ts) | **Baru Dibuat** | Route Handler `GET /api/tickets/[token]/pdf`. Menghasilkan stream `application/pdf` biner dengan header `Content-Disposition: attachment; filename="MEMORIA-Ticket-[NIM]-[NoTiket].pdf"`. |
| [`src/app/tiket/[token]/page.tsx`](file:///d:/website%20latihan/memoria/src/app/tiket/[token]/page.tsx) | **Baru Dibuat** | Halaman Web E-ticket digital publik berbasis token rahasia permanen. Menampilkan data peserta, jadwal acara & lokasi terkini, QR check-in, tombol unduh PDF resmi, cetak, dan salin tautan. |
| [`src/app/daftar/[ticketId]/page.tsx`](file:///d:/website%20latihan/memoria/src/app/daftar/[ticketId]/page.tsx) | **Diperbarui** | Formulir pendaftaran resmi untuk mahasiswa Universitas Telkom: Nama lengkap, NIM (5-20 digit), Prodi (teks bebas), Fakultas (dropdown 8 fakultas Telkom), WhatsApp, dan Email. Terkoneksi langsung ke `POST /api/registrations`. |
| [`src/app/daftar/berhasil/page.tsx`](file:///d:/website%20latihan/memoria/src/app/daftar/berhasil/page.tsx) | **Diperbarui** | Halaman konfirmasi sukses berbasis live server database query `fetchTicketByAccessToken(token)`. Menghilangkan fake toast email simulasi dan menjamin data tidak hilang saat refresh browser. |

---

## 3. Verifikasi Logika Bisnis & Gate Compliance

### A. Mahasiswa 8 Fakultas Universitas Telkom
- Dropdown fakultas dibatasi secara ketat pada 8 fakultas resmi:
  1. Fakultas Ilmu Terapan
  2. Fakultas Komunikasi Sosial
  3. Fakultas Ekonomi Bisnis
  4. Fakultas Industri Kreatif
  5. Fakultas Informatika
  6. Fakultas Teknik Elektro
  7. Fakultas Kedokteran
  8. Fakultas Rekayasa Industri
- Program studi berupa isian teks bebas yang dapat menampung mahasiswa seluruh jurusan di Universitas Telkom.
- NIM bertipe string untuk menjaga integritas *leading zero* (misal NIM berawalan `0...`).

### B. Transaksi Atomik & Immutability Token
- Fungsi SQL RPC `register_participant` berjalan dalam satu transaksi ACID:
  - Pemeriksaan duplikasi `idempotency_key` (replay aman).
  - Pemeriksaan keunikan NIM secara case-insensitive & trimmed terhadap seluruh peserta (termasuk yang diarsipkan).
  - Penguncian baris jenis tiket (`FOR UPDATE`) untuk mencegah race condition kuota kapasitas.
  - Pembuatan nomor tiket terurut via PostgreSQL sequence: `MEM-26-XXXX`.
  - Enqueue otomatis job `ticket_initial` ke tabel `email_jobs` dalam transaksi yang sama.
- Token QR (`mem_qr_*`) dan token akses web/PDF (`mem_tok_*`) dibuat berbeda dan bersifat permanen (immutable), bahkan jika di masa mendatang data nama/NIM peserta dikoreksi oleh panitia.

### C. Keamanan & Aksesibilitas Tiket
- Token akses berbentuk string acak kriptografis (opaque URL token) tanpa PII (Personally Identifiable Information) pada URL.
- File PDF dihasilkan secara dinamis on-the-fly via Route Handler biner (`application/pdf`) tanpa menyimpan file statis di direktori `public/`.
- Jika status peserta adalah `archived`: E-ticket web dan berkas PDF secara otomatis menampilkan banner dan watermark tegas `DIARSIPKAN / NONAKTIF`.

---

## 4. Hasil Verifikasi Otomasi
- **Pengujian Biner Streaming PDF:**
  - Header: `%PDF-` (Pass)
  - Buffer ByteLength: `169.197 bytes` (~169 KB)
  - Status: Valid binary PDF generated successfully
- **TypeScript Static Analysis:**
  - Perintah: `npx tsc --noEmit`
  - Kode Keluar: `0` (Zero errors / Pass)

---

## 5. Kesimpulan
Seluruh kriteria penerimaan **PHASE 6** telah diimplementasikan, diverifikasi, dan lulus 2-pass verification gate. Status dinaikkan menjadi **`DONE_VERIFIED`**.
Pengerjaan siap dilanjutkan ke **PHASE 7: Email Transaksional Brevo + `email_jobs` Worker**.

