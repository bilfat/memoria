# Laporan Verifikasi & Bukti Eksekusi: PHASE 5

**Modul:** Tiket Gratis, Kuota, Publikasi, dan Status Otomatis  
**Status Gate:** `DONE_VERIFIED`  
**Tanggal Verifikasi:** 2026-11-04  
**Lingkungan:** Next.js 16.4.3 (App Router, Server Actions) + Supabase PostgreSQL (RLS & Schema) + TypeScript 5

---

## 1. Ringkasan Eksekusi
PHASE 5 berfokus pada menghubungkan seluruh manajemen jenis tiket (tiket gratis) ke database Supabase nyata, menghitung kuota terpakai secara real-time dari data peserta aktif, serta menghitung status publik (*derived status*) secara dinamis di sisi server tanpa cron job dan tanpa menyimpan status komputasi ganda di kolom database.

---

## 2. File & Komponen yang Diimplementasikan

| File | Status | Keterangan |
|---|---|---|
| [`src/app/actions/tickets.ts`](file:///d:/website%20latihan/memoria/src/app/actions/tickets.ts) | **Baru Dibuat** | Server Actions: `getPublicTicketsAction`, `listAdminTicketsAction`, `getAdminTicketAction`, `saveTicketAction`, `toggleTicketPublishAction`, `archiveTicketAction`, serta fungsi deterministik `computeDerivedStatus` dan `normalizeWibToUtcIso`. |
| [`src/lib/validations.ts`](file:///d:/website%20latihan/memoria/src/lib/validations.ts) | **Diperbarui** | Ditambahkan Zod schema `ticketTypeInputSchema` untuk validasi nama, kapasitas (>0 atau null/unlimited), periode pendaftaran, dan status admin (`draft`, `published`, `archived`). |
| [`src/lib/date.ts`](file:///d:/website%20latihan/memoria/src/lib/date.ts) | **Diperbarui** | Ditambahkan fungsi `toWibInputString` untuk format konsisten `YYYY-MM-DDTHH:mm` zona waktu `Asia/Jakarta` pada input form tanpa distorsi timezone browser. |
| [`src/app/panitia/tiket/page.tsx`](file:///d:/website%20latihan/memoria/src/app/panitia/tiket/page.tsx) | **Diperbarui** | Migrasi total dari mockStore ke live database Supabase via `listAdminTicketsAction`. Menampilkan status admin vs status publik, kuota/sisa kursi dinamis, toggle publikasi, pengarsipan tiket dengan konfirmasi, dan tautan ke peserta. |
| [`src/app/panitia/tiket/baru/page.tsx`](file:///d:/website%20latihan/memoria/src/app/panitia/tiket/baru/page.tsx) | **Diperbarui** | Form pembuatan tiket baru via `saveTicketAction`. Mendukung kuota tak terbatas / terbatas, validasi periode WIB, harga locked gratis, dan pencatatan ke `audit_logs`. |
| [`src/app/panitia/tiket/[id]/edit/page.tsx`](file:///d:/website%20latihan/memoria/src/app/panitia/tiket/[id]/edit/page.tsx) | **Diperbarui** | Form edit tiket via `getAdminTicketAction` & `saveTicketAction`. Dilengkapi proteksi kuota: melarang menurunkan kapasitas di bawah jumlah peserta aktif saat ini. |
| [`src/app/daftar/page.tsx`](file:///d:/website%20latihan/memoria/src/app/daftar/page.tsx) | **Diperbarui** | Halaman pemilihan tiket publik menggunakan `getPublicTicketsAction`. Hanya menampilkan tiket berstatus `published`. Tiket berstatus `upcoming`, `sold_out`, atau `closed` menampilkan badge status yang tepat dan tombol pemilihannya otomatis dinonaktifkan. |

---

## 3. Verifikasi Logika Bisnis & Gate Compliance

### A. Tiket Gratis Permanen
- Tidak ada kolom harga mutable atau gateway pembayaran. Harga dikunci permanen pada UI dan database sebagai Gratis / Rp0.

### B. Kuota Dinamis & Real-time
- `capacity = NULL` diperlakukan sebagai "Tanpa Batas" (unlimited).
- Bila kapasitas ditetapkan (`capacity > 0`), sisa kuota dihitung dari `capacity - COUNT(participants WHERE status = 'active')`.
- Pengurangan kuota di bawah peserta aktif dicegah di server action dengan pesan ramah:
  > *"Kapasitas baru (X) tidak boleh lebih kecil dari jumlah peserta aktif saat ini (Y peserta)."*

### C. Pemisahan Status Admin vs Status Publik (*Derived Status*)
- **Status Admin:** `draft`, `published`, `archived`.
- **Status Publik (Dihitung Dinamis):**
  1. `upcoming` ("Belum Dibuka") — jika `now < registration_open_at`.
  2. `closed` ("Pendaftaran Ditutup") — jika `now > registration_close_at`.
  3. `sold_out` ("Kuota Penuh") — jika `capacity !== null && active_count >= capacity`.
  4. `open` ("Tersedia") — jika berada dalam periode dan kuota tersedia.
- Tiket `draft` atau `archived` tidak pernah muncul di halaman publik `/daftar`.
- Mengarsipkan jenis tiket (`archived`) tidak membatalkan tiket peserta yang sudah terbit sebelumnya.

### D. Timezone Asia/Jakarta (WIB)
- Form input `datetime-local` dinormalisasi melalui `normalizeWibToUtcIso` dengan offset `+07:00` dan disimpan ke PostgreSQL sebagai UTC `timestamptz`.

---

## 4. Hasil Verifikasi Otomasi
- **Unit Test Matriks Derived Status & Timezone:**
  ```
  --- TEST 1: normalizeWibToUtcIso ---
  WIB input: 2026-11-20T18:30
  UTC ISO output: 2026-11-20T11:30:00.000Z
  UTC Hours: 11 UTC Minutes: 30
  PASS: Timezone WIB -> UTC conversion is exact!

  --- TEST 2: computeDerivedStatus Transitions ---
  Before open: { status: 'upcoming', label: 'Belum Dibuka', isAvailable: false }
  At open: { status: 'open', label: 'Tersedia', isAvailable: true }
  Sold out: { status: 'sold_out', label: 'Kuota Penuh', isAvailable: false }
  Unlimited with 9999 participants: { status: 'open', label: 'Tersedia', isAvailable: true }
  After close: { status: 'closed', label: 'Pendaftaran Ditutup', isAvailable: false }
  Draft status: { status: 'closed', label: 'Draft', isAvailable: false }
  Archived status: { status: 'closed', label: 'Diarsipkan', isAvailable: false }

  ALL TICKET PHASE 5 UNIT TESTS PASSED!
  ```
- **TypeScript Static Analysis:**
  - Perintah: `npx tsc --noEmit`
  - Kode Keluar: `0` (Zero errors / Pass)

---

## 5. Kesimpulan
Seluruh kriteria penerimaan **PHASE 5** telah diimplementasikan, diverifikasi, dan lulus 2-pass verification gate. Status dinaikkan menjadi **`DONE_VERIFIED`**.
Pengerjaan siap dilanjutkan ke **PHASE 6: Registrasi Mahasiswa 8 Fakultas Telkom + e-ticket Web/PDF/QR**.

