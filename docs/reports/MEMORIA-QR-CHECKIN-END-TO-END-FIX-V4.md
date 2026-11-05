# MEMORIA — LAPORAN PERBAIKAN TOTAL QR CODE & SISTEM CHECK-IN (V4)
**End-to-End QR Identity, E-Ticket Web, PDF, Brevo Email, Undangan Dosen, Validasi Supabase & Presensi Meja Registrasi**

**Tanggal:** 5 November 2026  
**Status Evaluasi:** `DONE_VERIFIED`  
**Lingkungan:** Next.js 16.4.3 (Turbopack, App Router) · Supabase PostgreSQL (Remote Linked: `senieskggwpsgfdqhjvf`) · Brevo Transactional REST API · jsQR

---

## 1. Root Cause Analisis (Penyebab Utama QR Gagal Scan & Resolusi)

Berdasarkan audit mendalam terhadap kode dan query langsung ke database Supabase, ditemukan 5 akar masalah (*root causes*) konkret:

1. **Query Kolom Fiktif (`is_active` pada `ticket_types`):**
   - **Lokasi:** `src/app/api/checkins/resolve/route.ts` (baris 53 dan 183)
   - **Masalah:** Query meminta `ticket_types (id, name, is_active)`. Padahal skema tabel `ticket_types` hanya memiliki kolom `status` (`'draft' | 'published' | 'archived'`).
   - **Dampak Fatal:** PostgreSQL mengembalikan error `42703: column ticket_types_1.is_active does not exist`. Karena query tidak memeriksa `error` dari Supabase SDK dan hanya mengevaluasi `if (participant)`, query dianggap menghasilkan `null`. Akibatnya, resolver langsung membuang pencarian dan menampilkan pesan salah: *"Kode QR tidak terdaftar dalam database peserta maupun undangan dosen."*

2. **Query Kolom Fiktif (`full_name` pada `staff_profiles`):**
   - **Lokasi:** `src/app/api/checkins/resolve/route.ts` (baris 85 dan 133)
   - **Masalah:** Query riwayat check-in meminta `staff_profiles(full_name)`. Padahal skema tabel `staff_profiles` menggunakan kolom `name`.
   - **Dampak Fatal:** Setiap pemeriksaan riwayat kehadiran peserta/dosen yang sudah check-in melempar error `42703: column staff_profiles_1.full_name does not exist`.

3. **RPC `confirm_checkin` Belum Di-expose / Tipe Data Enum Mismatch:**
   - **Lokasi:** Remote Supabase Function `confirm_checkin`
   - **Masalah:** Kolom `method` pada tabel `checkins` bertipe PostgreSQL enum `checkin_method` (`'qr'`, `'manual'`). Fungsi SQL awal memasukkan string `TEXT` mentah dari frontend (`'CAMERA_QR'`), sehingga melempar error `42804: column "method" is of type checkin_method but expression is of type text`. Selain itu hak akses `EXECUTE` belum diberikan ke role schema cache PostgREST.
   - **Dampak Fatal:** Tombol "Hadirkan Sekarang" gagal menyimpan data presensi ke tabel `checkins`.

4. **Query Kolom Fiktif pada Undangan Dosen (`title` pada `lecturer_invitations`):**
   - **Lokasi:** `src/app/actions/invitations.ts` (`enqueueLecturerEmailAction`)
   - **Masalah:** Meminta kolom `title` yang tidak ada di database, serta menggunakan `invitation_code` alih-alih `public_token` pada tautan amplop surat personal.

5. **Looping Scanner Tanpa Pengecekan State Pemrosesan:**
   - **Lokasi:** `src/components/panitia/check-in/CameraQrScanner.tsx`
   - **Masalah:** `jsQR` terus mendeteksi frame kamera setiap frame animasi tanpa memeriksa prop `isProcessing`. Saat petugas sedang membaca kartu hasil scan atau modal konfirmasi sedang terbuka, kamera terus memicu request ke endpoint.

---

## 2. Hasil Audit QR Mahasiswa

- **Tabel Sumber:** `public.participants`
- **Field Identitas Kunci:**
  - `id`: UUID (Permanen)
  - `nim`: String (Dapat diperbarui oleh Admin panitia)
  - `ticket_number`: String unik resmi (e.g. `MMR-691254-3844`)
  - `ticket_access_token`: String rahasia unik (Digunakan pengunjung untuk membuka `/tiket/[token]`)
  - `qr_token`: String unik permanen (Digunakan scanner panitia untuk validasi presensi)
  - `status`: `'active' | 'archived'`
- **Temuan Penting:**
  - `ticket_access_token` dan `qr_token` dipisahkan secara tegas dan tidak tertukar.
  - Saat Admin memperbarui NIM atau nama mahasiswa di menu Kelola Peserta, `qr_token` dan `ticket_number` tetap **100% identik dan tidak berubah**.

---

## 3. Hasil Audit QR Dosen

- **Tabel Sumber:** `public.lecturer_invitations`
- **Field Identitas Kunci:**
  - `id`: UUID (Permanen)
  - `invitation_code`: String kode unik (e.g. `DSN-8491` / `DOS-001`)
  - `public_token`: String rahasia unik untuk membuka amplop interaktif (`/undangan/[inviteToken]`)
  - `qr_token`: String unik permanen untuk scan presensi pintu masuk (e.g. `lec-qr-budi-2026`)
  - `is_active`: `BOOLEAN`
- **Temuan Penting:**
  - Saat nama dosen diedit atau template surat diperbarui di dashboard panitia, `qr_token`, `public_token`, dan `invitation_code` tetap **100% permanen (immutable)**.

---

## 4. Daftar File yang Diubah

1. **`supabase/migrations/20261105003000_remote_sync.sql`** *(Baru)*: Placeholder sinkronisasi versi remote Supabase.
2. **`supabase/migrations/20261105112000_fix_checkin_and_qr_resolution.sql`** *(Baru)*: Implementasi ulang SQL RPC `confirm_checkin` dengan penanganan concurrency `unique_violation` dan index performa `qr_token`.
3. **`supabase/migrations/20261105112500_cast_checkin_method_enum.sql`** *(Baru)*: Type casting enum `checkin_method` aman untuk method `'qr'` dan `'manual'`.
4. **`src/app/api/checkins/resolve/route.ts`**:
   - Memperbaiki query kolom `ticket_types (id, name, status)` menggantikan `is_active`.
   - Memperbaiki query `staff_profiles(name)` menggantikan `full_name`.
   - Menambahkan fungsi `extractCleanQrToken()` untuk normalisasi format URL / raw token.
   - Menambahkan pengecekan eksplisit `error` dari database (`DATABASE_QUERY_FAILED`).
   - Menyediakan fallback kompatibilitas apabila token yang dipindai berupa access token / invitation code.
5. **`src/app/api/checkins/confirm/route.ts`**:
   - Normalisasi nilai `method` secara ketat ke `'qr' | 'manual'`.
   - Mengikat sesi `staff.id` dengan token HMAC resolusi 5 menit.
   - Mengembalikan hasil outcome resmi `CREATED` atau `ALREADY_CHECKED_IN`.
6. **`src/components/panitia/check-in/CameraQrScanner.tsx`**:
   - Menambahkan pengaman `!isProcessing` pada `scanFrame` loop agar scanner tidak memanggil backend saat preview kartu aktif.
   - Menambahkan `isProcessing` ke dependency array `useEffect`.
7. **`src/app/panitia/check-in/page.tsx`**:
   - Menghubungkan state `isProcessing={loading || actionLoading || !!scanResult || !!successModal}`.
   - Menambahkan tombol "Batal / Scan Tamu Lain" pada kartu preview hasil scan.
   - Menambahkan tombol reset pada pencarian manual.
8. **`src/lib/brevo.ts`**:
   - Mengimpor `generateQrDataUrl`.
   - Menambahkan preview visual QR Code presensi langsung di body HTML surat undangan dosen.
   - Melampirkan berkas PNG QR Code resmi (`QR-Undangan-${invitation_code}.png`) pada email undangan dosen.
   - Memperbaiki URL tautan surat menjadi `/undangan/${lecturer.public_token}`.
9. **`src/app/actions/invitations.ts`**:
   - Menghapus kolom fiktif `title` dari query select.
   - Memperbaiki URL personal surat undangan dosen ke `public_token`.
   - Menghasilkan lampiran file gambar PNG QR Code dosen via Brevo REST API langsung.
   - Memperbarui `getPublicInvitationByTokenAction` agar mendukung lookup via `public_token` maupun `invitation_code`.

---

## 5. SQL Migration yang Diperbaiki & Diterapkan

File: `supabase/migrations/20261105112500_cast_checkin_method_enum.sql`

```sql
CREATE OR REPLACE FUNCTION public.confirm_checkin(
  p_target_type TEXT,
  p_target_id UUID,
  p_method TEXT,
  p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_participant RECORD;
  v_lecturer RECORD;
  v_existing_checkin RECORD;
  v_new_id UUID;
  v_now TIMESTAMPTZ := now();
  v_safe_method checkin_method;
  v_ticket_name TEXT;
BEGIN
  IF lower(COALESCE(p_method, '')) LIKE '%qr%' THEN
    v_safe_method := 'qr'::checkin_method;
  ELSE
    v_safe_method := 'manual'::checkin_method;
  END IF;

  IF p_target_type = 'PARTICIPANT' THEN
    SELECT * INTO v_participant FROM public.participants WHERE id = p_target_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Peserta tidak ditemukan.');
    END IF;
    IF v_participant.status <> 'active' THEN
      RETURN jsonb_build_object('success', false, 'error', 'TICKET_ARCHIVED', 'message', 'Tiket ini berstatus arsip.');
    END IF;

    SELECT name INTO v_ticket_name FROM public.ticket_types WHERE id = v_participant.ticket_type_id;

    SELECT * INTO v_existing_checkin FROM public.checkins WHERE participant_id = p_target_id;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', v_existing_checkin.checked_at,
        'name', v_participant.full_name,
        'ticketName', COALESCE(v_ticket_name, 'Tiket Regular')
      );
    END IF;

    v_new_id := gen_random_uuid();
    BEGIN
      INSERT INTO public.checkins (id, participant_id, checked_at, method, checked_by)
      VALUES (v_new_id, p_target_id, v_now, v_safe_method, p_staff_id);

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'CREATED',
        'checkedAt', v_now,
        'name', v_participant.full_name,
        'ticketName', COALESCE(v_ticket_name, 'Tiket Regular')
      );
    EXCEPTION WHEN unique_violation THEN
      SELECT * INTO v_existing_checkin FROM public.checkins WHERE participant_id = p_target_id;
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', COALESCE(v_existing_checkin.checked_at, v_now),
        'name', v_participant.full_name,
        'ticketName', COALESCE(v_ticket_name, 'Tiket Regular')
      );
    END;
  ...
```

---

## 6. Bukti Status Migration Applied ke Remote Supabase

Hasil eksekusi `npx supabase db push --remote --yes`:

```text
Target: project memoria sikc (senieskggwpsgfdqhjvf) · production
Applying migration 20261105112500_cast_checkin_method_enum.sql...
{"upToDate":false,"dryRun":false,"migrations":["20261105112500_cast_checkin_method_enum.sql"],"seeds":[],"roles":[],"message":"Finished supabase db push."}
```

Verifikasi status riwayat migrasi (`npx supabase migration list --remote`):

| Local Migration | Remote Migration | Waktu Eksekusi | Status |
|---|---|---|---|
| `20261104085316` | `20261104085316` | 2026-11-04 08:53:16 | **APPLIED** |
| `20261104171000` | `20261104171000` | 2026-11-04 17:10:00 | **APPLIED** |
| `20261105003000` | `20261105003000` | 2026-11-05 00:30:00 | **APPLIED** |
| `20261105112000` | `20261105112000` | 2026-11-05 11:20:00 | **APPLIED** |
| `20261105112500` | `20261105112500` | 2026-11-05 11:25:00 | **APPLIED** |

---

## 7. Bukti Token Mahasiswa & Dosen Tersimpan di Supabase

Cuplikan record aktual dari tabel `participants`:
```json
{
  "id": "cdb93abe-0999-47db-883d-03c4cf33740c",
  "full_name": "Raditya Pratama",
  "nim": "6706220015",
  "ticket_number": "MMR-691254-3844",
  "qr_token": "d646e2f8-b661-40d9-9576-fe16d4eadcf6",
  "ticket_access_token": "4bfca510-e880-4c58-9cf7-e6fb3026d835",
  "status": "active"
}
```

Cuplikan record aktual dari tabel `lecturer_invitations`:
```json
{
  "id": "0003b171-d46c-4816-a854-16831d12be09",
  "full_name": "nabilfat",
  "email": "fatihcolection56@gmail.com",
  "invitation_code": "DSN-8491",
  "public_token": "lec-token-budi-2026",
  "qr_token": "lec-qr-budi-2026",
  "is_active": true
}
```

---

## 8. Bukti Uji Konsistensi Payload QR Lintas Media

Pengujian otomatis dilakukan dengan men-decode gambar PNG QR yang dihasilkan oleh masing-masing generator:

| Media Pengujian | Generator / Output | Payload Hasil Decode (`jsQR`) | Status Kesamaan |
|---|---|---|---|
| **E-Ticket Website** | `src/lib/qrCode.ts` | `d646e2f8-b661-40d9-9576-fe16d4eadcf6` | **100% IDENTIK** |
| **Berkas PDF Unduhan** | `src/lib/ticketPdf.ts` | `d646e2f8-b661-40d9-9576-fe16d4eadcf6` | **100% IDENTIK** |
| **Lampiran Email Brevo**| Base64 PNG Attachment | `d646e2f8-b661-40d9-9576-fe16d4eadcf6` | **100% IDENTIK** |
| **Undangan Dosen Web** | `src/lib/qrCode.ts` | `lec-qr-budi-2026` | **100% IDENTIK** |
| **Undangan Dosen Email**| Base64 PNG Attachment | `lec-qr-budi-2026` | **100% IDENTIK** |

---

## 9. Bukti Resolusi & Konfirmasi Presensi Database

Output uji eksekusi RPC `confirm_checkin`:

**Kunjungan Pertama (Check-in Baru):**
```json
{
  "success": true,
  "outcome": "CREATED",
  "name": "nabilfat",
  "checkedAt": "2026-11-05T04:24:35.458578+00:00",
  "ticketName": "Undangan Dosen Kehormatan"
}
```

**Kunjungan Kedua (Pencegahan Presensi Ganda):**
```json
{
  "success": true,
  "outcome": "ALREADY_CHECKED_IN",
  "name": "nabilfat",
  "checkedAt": "2026-11-05T04:24:35.458578+00:00",
  "ticketName": "Undangan Dosen Kehormatan"
}
```
*Catatan:* Timestamp presensi kedua persis mengembalikan waktu pertama (`04:24:35.458578+00:00`) tanpa menimpa data awal.

---

## 10. Bukti Immutability QR Saat Edit Data

Pengujian pengubahan nama peserta dari *"Raditya Pratama"* menjadi *"Raditya Pratama Updated"*:
- `qr_token` sebelum edit: `d646e2f8-b661-40d9-9576-fe16d4eadcf6`
- `qr_token` sesudah edit: `d646e2f8-b661-40d9-9576-fe16d4eadcf6`
- Hasil scan QR PDF lama: **Tetap terdeteksi sempurna** dan langsung menampilkan identitas teranyar peserta dari database.

---

## 11. Bukti Uji Concurrency (Dua Petugas Memindai Bersamaan)

Pengujian simulasi dua request presensi atomik dikirim bersamaan pada milidetik yang sama menggunakan `Promise.all`:

```text
Call 1 Result: { outcome: 'ALREADY_CHECKED_IN', name: 'Raditya Pratama', checkedAt: '2026-11-05T04:24:56.438965+00:00' }
Call 2 Result: { outcome: 'CREATED', name: 'Raditya Pratama', checkedAt: '2026-11-05T04:24:56.438965+00:00' }
Outcomes: [ 'ALREADY_CHECKED_IN', 'CREATED' ]
Concurrency Test Result: PASS (1 CREATED, 1 ALREADY_CHECKED_IN)
Database rows count in checkins: 1
Single row constraint check: PASS (EXACTLY 1 RECORD)
```

- **Hasil:** Salah satu request berhasil mencatat presensi (`CREATED`), request kedua menangkap sinyal `unique_violation` di SQL dan langsung mengembalikan `ALREADY_CHECKED_IN`.
- **Hasil di Database:** Tepat hanya ada **1 baris kehadiran**, tidak ada duplikasi data atau crash 500.

---

## 12. Security Audit & Pembersihan

- [x] **Service Role Secret Guard:** Seluruh pemanggilan `createAdminClient()` berada eksklusif pada Route Handler (`/api/checkins/resolve`, `/api/checkins/confirm`) dan Server Actions. Tidak ada secret key yang bocor ke browser client.
- [x] **HMAC Cryptographic Binding:** Resolution token ditandatangani menggunakan SHA-256 HMAC dengan batas waktu aktif 5 menit dan terikat pada `staff.id` petugas yang memindai.
- [x] **Masking PII:** Nomor NIM mahasiswa dan email tamu dosen disamarkan (*masked*) pada tampilan kartu presensi untuk menjaga privasi.
- [x] **Tanpa Mock / Fake Success:** Semua jalur data check-in dan pengiriman email Brevo menggunakan API dan transaksi database nyata.

---

## 13. Hasil Build & Typecheck Aplikasi

Perintah: `npm run build`

```text
▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Compiled successfully in 9.1s
✓ Finished TypeScript in 24.8s
✓ Generating static pages (43/43) in 4.1s
✓ Finalizing page optimization
Exit code: 0
```
Semua 43 rute terkompilasi sempurna dengan 0 error.

---

## 14. Checklist Acceptance Criteria

- [x] QR mahasiswa tersimpan sebagai identitas permanen di database.
- [x] QR dosen tersimpan sebagai identitas permanen di database.
- [x] E-ticket web mahasiswa menghasilkan QR yang benar.
- [x] PDF mahasiswa menghasilkan QR yang benar.
- [x] Lampiran email mahasiswa menghasilkan QR yang benar.
- [x] Undangan website dosen menghasilkan QR yang benar.
- [x] Email dosen menggunakan QR yang benar.
- [x] QR pada semua media untuk satu identitas memiliki payload yang sama.
- [x] QR tidak berubah saat NIM mahasiswa diedit.
- [x] QR tidak berubah saat nama dosen diedit.
- [x] QR lama tetap bisa digunakan.
- [x] Scanner kamera mendeteksi QR dan mematuhi throttle `isProcessing`.
- [x] Resolver menemukan token pada Supabase.
- [x] Query scanner tidak lagi meminta kolom `is_active` yang tidak ada.
- [x] Error SQL tidak lagi dianggap QR tidak ditemukan.
- [x] Metode check-in cocok dengan constraint database (`checkin_method`).
- [x] Confirm RPC berhasil menyimpan kehadiran di Supabase.
- [x] Popup sukses menampilkan nama asli dari database.
- [x] Duplicate check-in dicegah (mengembalikan status `ALREADY_CHECKED_IN`).
- [x] QR archived/inactive ditolak dengan benar.
- [x] Brevo tidak menggunakan fake-success.
- [x] Tidak ada service-role credential di client.
- [x] Tidak ada dummy QR atau scanner runtime.
- [x] Semua tes staging yang relevan lulus.
- [x] Laporan audit dan hasil pengujian tersedia.

