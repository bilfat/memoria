# Laporan Penghapusan Fisik Dummy & Hardcode (DUMMY-REMOVAL-REPORT V3)

**Tanggal:** 2026-11-04  
**Status Eksekusi:** SELESAI (`PURGED_AND_VERIFIED`)  
**Metode:** `git rm` fisik + Refactor Zero Fake-Success & Clean State Architecture

---

## 1. Berkas Khusus Dummy yang Dihapus Fisik (git rm)

| Path Berkas Asli | Status Git | Alasan Penghapusan | Pengganti Nyata di Produksi |
|---|---|---|---|
| `src/data/mock/seeds.ts` | `D` (Deleted) | Data fiktif 20 peserta demo, 6 kandidat voting demo, 5 dosen fiktif, 3 tiket hardcoded, riwayat presensi buatan. | Skema Supabase PostgreSQL nyata (`participants`, `ticket_types`, `lecturer_invitations`, `event_settings`, `checkins`). |
| `src/data/mock/mockStore.ts` | `D` (Deleted) | Mock store in-memory & localStorage reaktif yang mensimulasikan database palsu. | Supabase SSR Client, Server Actions (`src/app/actions/`), SQL RPC atomik (`register_participant`, `confirm_checkin`), dan RLS. |
| `src/data/adapters/index.ts` | `D` (Deleted) | Lapisan adapter mock/dummy yang menghubungkan UI frontend ke `mockStore`. | Route Handlers resmi (`/api/...`) dan Server Actions berjenis kuat (*strongly-typed*). |

*Catatan: Direktori `src/data` telah sepenuhnya dipangkas dari pohon repositori Git.*

---

## 2. Pembersihan Hardcode Bisnis, Fake-Success, & Secret Fallback (Audit V3)

1. **Brevo Email Service (`src/lib/brevo.ts`):**
   - Menghapus 100% simulasi mock key (`isMockKey`), mock message ID `<mock-...@memoria.local>`, dan fake-success return.
   - Menghapus jalur penandaan `sent` fiktif pada undangan dosen (`<lecturer-mock-...>`). Sekarang wajib merender email HTML surat undangan dan mengirim via Brevo REST API resmi.
   - Jika `BREVO_API_KEY` tidak tersedia di environment, fungsi secara jujur mengembalikan `{ success: false, error: 'BREVO_API_KEY belum dikonfigurasi...' }`.

2. **Sistem Tanggal & Countdown (`src/lib/date.ts`):**
   - Menghapus tanggal server statis `2026-10-28T00:00:00Z` pada `calculateCountdown()`.
   - Menggunakan waktu saat ini yang sesungguhnya (`Date.now()`), mengeliminasi hydration mismatch, serta membedakan status `UPCOMING`, `HAPPENING`, dan `ENDED`.
   - Menambahkan utilitas 24 jam eksplisit WIB (`parseWibToIso`, `formatIsoToWibParts`, `getWibDayName`).

3. **Fallback CMS & Ticket Data (`src/app/actions/cms.ts`, `src/lib/ticketData.ts`):**
   - Mengubah `getPublicEventSettings()` agar menggunakan server-only `createAdminClient()` dengan whitelist kolom aman (tidak mengekspos template undangan panitia).
   - Menghapus fallback objek hardcoded jika DB gagal. DB error sekarang dilaporkan secara eksplisit ke pemanggil tanpa masking demo.
   - Menghapus fallback hardcoded tanggal dan lokasi acara pada `src/lib/ticketData.ts`.

4. **Keamanan Check-in & Internal Worker (`src/lib/checkinCrypto.ts`, `src/app/api/internal/email-worker/route.ts`):**
   - Menghapus secret fallback `'memoria-checkin-secret-fallback-key-2026'`. Mewajibkan `CHECKIN_RESOLUTION_SECRET` atau `SUPABASE_SERVICE_ROLE_KEY`.
   - Menghubungkan resolusi token ke `staffId` petugas check-in yang sedang aktif (anti session hijacking).
   - Menghapus parameter URL `?secret=` dan menghapus izin bypass tanpa secret pada localhost. Worker hanya dapat dieksekusi via header `Authorization: Bearer <CRON_SECRET>` atau `x-cron-secret: <CRON_SECRET>`.

5. **Foto Panggung & Runway Dinamis (`BandShowcase.tsx`, `FashionShowcase.tsx`, `page.tsx`):**
   - Mengganti path statis `/images/band-silhouette.png` dengan `band.photo` dari Supabase Storage.
   - Mengganti path statis `/images/fashion-model-clean.png` dengan `event.fashionTeaser.image` dari Supabase Storage.
   - Seluruh animasi GSAP, podium konser HD, spotlight beams, dan runway catwalk tetap dipertahankan 100%.

6. **Dashboard Zero-State & Error Resilience (`src/app/actions/dashboard.ts`, `/panitia/page.tsx`):**
   - Menghapus perlakuan nol diam-diam saat query database gagal. Jika database error, sistem memunculkan banner notifikasi error dengan tombol *Coba Lagi*.
   - Filter kehadiran mahasiswa dan dosen aktif secara ketat menggunakan relasi inner join status aktif (`participants!inner(status = 'active')` dan `lecturer_invitations!inner(is_active = true)`).
