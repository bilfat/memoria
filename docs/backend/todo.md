TODO.md — MEMORIA Backend Phase 1 + Integrasi Frontend | Roadmap Phase 0–14
Versi: 2.0 — Phased, Evidence-Gated · Tanggal penyusunan: 4 November 2026
Status keseluruhan: NOT STARTED / BELUM DIVERIFIKASI
Dokumen acuan tertinggi: docs/MEMORIA-PRD-BACKEND-PHASE-1-V1-FINAL-BASELINE.md; kemudian PRD Frontend, Design System, keputusan terbaru pengguna.
Cara pakai: letakkan file ini di root repository sebagai todo.md. Kerjakan Phase berurutan. Semua checkbox dimulai [ ] (termasuk task yang pernah diberi [x] pada dokumen sumber) karena tidak ada bukti verifikasi yang diserahkan untuk repo aktual.
Ruang lingkup: backend Phase 1 dan integrasi UI existing seluruh fitur Phase 1; hapus fisik UI/file dummy yang tidak dipakai; lindungi karya desain/komponen nyata dan modul Phase 2 dari penghapusan keliru.

PROTOKOL WAJIB — Jangan tandai selesai tanpa cross-check ketat
A. Aturan checkbox dan status
- [ ] berarti belum memenuhi definisi selesai, termasuk ketika implementasi sudah ditulis tetapi belum dibuktikan benar.
- Task baru boleh diubah menjadi centang setelah (1) implementasi lengkap, (2) pengujian otomatis relevan PASS, (3) uji manual alur UI→server→DB→UI PASS dengan data nyata di staging, (4) pengecekan ulang secara terpisah terhadap edge case, otorisasi, error, refresh/browser kedua, (5) perubahan kode dan laporan bukti direview.
- Cross-check kedua wajib membaca diff/source sesudah implementasi, mengulang uji kritis dari sesi/browser atau test fixture yang baru, serta membandingkan hasil DB aktual. Tidak cukup menekan tombol dan melihat toast, tidak cukup build hijau, tidak cukup screenshot, tidak cukup "sudah saya coding".
- Setiap gate Phase harus mempunyai bukti: tanggal, commit/hash/diff, fitur & halaman, test command + hasil, skenario browser, query/DB check (tanpa PII), reviewer/verifikator, isu tersisa. Jika sama engineer, ulangi verifikasi sebagai pass kedua terpisah dan catat.
- Status operasional yang diperbolehkan: NOT_STARTED, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, DONE_VERIFIED, REGRESSION_FAILED. Ubah menjadi DONE_VERIFIED hanya setelah gate dan semua checkbox fase lulus. Jangan tulis DONE hanya karena kode ada.
- Jika ada task yang memang tidak berlaku pada repo, jangan centang asal: beri status N/A — APPROVED, alasannya, dan rujukan PRD/persetujuan. Jika kredensial/akses/env/device belum ada, tandai BLOCKED dan lanjutkan pekerjaan lain yang tidak menuntut klaim keberhasilan palsu.
- Jika setelah suatu fase selesai ditemukan regresi, buka kembali checkbox terkait; tandai REGRESSION_FAILED hingga lolos ulang.
- Jangan memodifikasi checkbox otomatis massal menjadi checked. Perubahan status harus mengikuti bukti per item dan disertai laporan pengujian.
B. Aturan penghapusan dummy / hardcode — wajib dan terukur
- HAPUS UI dummy secara nyata: halaman/tampilan demo yang hanya mensimulasikan pengguna, fake login/role switch, tombol pura-pura berhasil, statistik palsu, sample peserta/tiket/dosen, winner/card fiktif, dummy scanner, fake mail notification, mock route, dan data fiktif di semua UI produksi.
- HAPUS hardcode data bisnis dari komponen nyata: tanggal/jam/tempat/nama band/teaser, data pendaftar/dosen, angka dashboard, kuota tiket, QR, email, status, profile staff, dan contoh foto orang yang disamarkan sebagai konten resmi. UI tersebut harus membaca Supabase, bukan constant/JSON/localStorage. Jika DB kosong, tampilkan empty/setup/error state yang jujur.
- HAPUS FILE khusus dummy secara fisik (git rm <file-yang-dikonfirmasi>), bukan sekadar menghapus import, mengganti namanya ke .bak, atau membuat kondisi production flag. Audit semua import/test/build sebelum penghapusan. Folder yang kosong karena penghapusan file dummy juga dibersihkan.
- PRESERVE ilustrasi/aset asli panggung, foto dekoratif original, animasi GSAP, icon, font, komponen kerja, template PDF/QR nyata, dokumentasi di docs/, migration, konfigurasi valid, data pengguna riil, dan komponen Phase 2 yang bukan dummy. Teks statis UI seperti label/placeholder/empty-state dan konstanta pilihan fakultas yang valid bukan dummy bisnis.
- Route Phase 2 Voting/Kelola Pemenang tidak dibangun backend-nya sekarang. Jika route saat ini dipenuhi dummy, hapus runtime data dan UI demo-nya; tampilkan halaman status belum tersedia/Coming Soon sesuai scope, tetapi jangan memusnahkan komponen desain asli yang bisa dipakai kemudian.
- Cleanup dilakukan setelah alternatif real siap dan dites per modul, bukan ditunda seluruhnya sampai akhir. Fase khusus final cleanup memastikan tidak ada sisa. Jangan pernah menjalankan penghapusan massal directory, reset repo, atau menghapus data remote tanpa audit/backup/persetujuan.
C. Aturan API, performa dan keselamatan data
- Jangan membuat CRUD endpoint berulang untuk setiap form; utamakan Server Components (baca) + Server Actions (mutasi dashboard) + 7 Route Handlers yang disepakati PRD untuk keperluan khusus.
- Semua mutasi server wajib auth/role check, validasi server, transaksi/constraint database sesuai risiko, dan error response yang benar. Jangan simpan service role/Brevo secret di browser.
- Konten Beranda ambil sekali dengan projection/cache dan invalidasi sesudah Admin Simpan; countdown client-side tanpa API polling tiap detik. Registrasi, QR, peserta, check-in, quota tidak boleh menggunakan cache stale.
- Upload foto sumber maksimum 10 MB, otomatis kompres dengan alpha preserve bila transparan, direct upload ke Supabase Storage; jangan melewatkan body 10 MB secara mentah ke serverless Next.js.
- Pendaftaran satu NIM/satu tiket; edit NIM tidak mengubah ID tiket, nomor tiket, kode/QR token; tiket tipe archived tetap sah untuk peserta existing; peserta archived menonaktifkan QR dan kuota kembali. Semua harus diuji ulang di DB dan scanner.
- Data dummy di staging hanya boleh dalam fixture test terisolasi; tidak boleh dijadikan fallback runtime atau terbawa menjadi data riil di production.
D. Template bukti wajib setiap Phase
Phase        : <nomor & nama>
Status       : NOT_STARTED | IN_PROGRESS | BLOCKED | READY_FOR_REVIEW | DONE_VERIFIED | REGRESSION_FAILED
Code changes : <commit/hash + daftar path changed/deleted>
DB proof     : <migration apply + SQL query/constraint result, tanpa PII/token>
API proof    : <contract tests + expected/actual outcomes>
UI proof     : <route, interaksi, browser A/B, refresh, screenshot/video bila relevan>
Security     : <unauthorized/role/RLS tests>
Performance  : <pengukuran jika relevan, bukan perkiraan>
Cross-check  : <tanggal pass kedua + siapa/verifikator + hasil>
Blockers     : <jelas, tidak ditutup-tutupi>
Gate         : PASS / FAIL — hanya PASS mengizinkan centang
Ringkasan urutan kerja — SEMUA STATUS AWAL NOT_STARTED
Phase	Fokus	Gerbang (ringkas)	Status awal
0	Audit docs/repo, baseline, inventaris dummy & mapping UI	Path nyata dan evidensi baseline	DONE_VERIFIED
1	Supabase migrations, RLS, auth foundation, kontrak & transaksi	DB staging fresh + SQL/security PASS	DONE_VERIFIED
2	Login nyata, role, Kelola Akun	Auth + role deny tests PASS	DONE_VERIFIED
3	Supabase Storage & kompres foto 10 MB	Upload nyata + alpha + permission PASS	DONE_VERIFIED
4	CMS Beranda, Band tunggal, teaser, page visibility	Simpan Admin → publik update PASS	NOT_STARTED
5	Tiket gratis, status otomatis & kuota	Time boundary + quota tests PASS	NOT_STARTED
6	Registrasi + e-ticket web/PDF/QR	Unik NIM + QR tetap + PDF scan PASS	NOT_STARTED
7	email_jobs, Brevo & worker	Retry+dedupe+email uji PASS	NOT_STARTED
8	Data peserta, edit/arsip/pulihkan, Excel	Two-step verify + quota + Excel PASS	NOT_STARTED
9	Undangan dosen, personal link, QR & WhatsApp	Template/link stabil + email PASS	NOT_STARTED
10	Check-in QR & manual, popup nama	Scanner + duplicate + concurrent PASS	NOT_STARTED
11	Dashboard nyata, API/Action contract, integrasi cross-page	Semua UI→DB, 7 routes PASS	NOT_STARTED
12	Penghapusan fisik UI/file dummy & audit ulang	git diff D + scan + no-fallback PASS	NOT_STARTED
13	Hardening, performance, security, regression & E2E	SQL/API/E2E/perf/visual PASS	NOT_STARTED
14	Staging, release checks, laporan, handoff, DoD	Cross-check final + signoff PASS	NOT_STARTED


PHASE 0 — Audit dokumentasi, repo, baseline & inventaris dummy
Status awal: DONE_VERIFIED
Prasyarat: Tidak ada; mulai di sini.
Checklist dari spesifikasi asal — Instruksi wajib sebelum mengerjakan apa pun
Dokumen sumber, prioritas keputusan, dan batas pekerjaan
- [x] Baca seluruh dokumentasi pada docs/; minimal:
  - docs/MEMORIA-PRD-BACKEND-PHASE-1-V1-FINAL-BASELINE.md — acuan utama scope, kontrak, schema, keamanan, API, dan acceptance.
  - docs/MEMORIA-PRD-FRONTEND-V1-FINAL-BASELINE.md — acuan halaman, UX, interaksi, dan kontrak fitur yang sudah ada.
  - docs/MEMORIA-DESIGN-SYSTEM-AND-FRONTEND-STRUCTURE-V1-FINAL.md — acuan komponen visual, ilustrasi, motion, folder, dan responsivitas.
- [x] Periksa dokumen relevan lainnya di docs/ untuk konteks tanpa menganggap prompt visual lama mengalahkan keputusan backend terbaru.
- [x] Jika file menggunakan nama/path berbeda di repository, temukan file yang benar; jangan mengarang file, route, tabel, atau API yang seolah sudah ada.
- [x] Gunakan ketentuan backend terbaru ketika bertentangan dengan PRD Frontend lama: prodi bebas, fakultas 8 pilihan, Band satu, Voting & Pemenang Phase 2, status tiket otomatis, foto max 10 MB + kompres.
- [x] Audit branch, git status, versi Next.js/React/TypeScript, package manager, scripts, dependensi, route groups, middleware/proxy, auth state, komponen, store, adapters, worker, dan test existing sebelum mengubah kode.
- [x] Buat inventaris file existing, diagram data flow aktual, serta mapping UI → data/service → API/Action → DB sebelum coding; semua path di TODO ini adalah target konseptual dan harus disesuaikan repo.
- [x] Jangan reset repository, jangan git clean -fd, jangan rm -rf massal, jangan re-init app, jangan overwrite file/folder asal-asalan, jangan mengubah/destruktif DB produksi.
- [x] Pengecualian eksplisit atas aturan lama “jangan hapus file”: pada pekerjaan ini WAJIB menghapus fisik file yang khusus dummy/mock/seed palsu/runtime fallback, setelah seluruh import dan pemakaian sudah diganti dan diverifikasi. File produksi nyata, komponen Phase 2 non-dummy, aset desain, dokumentasi, dan data nyata tidak boleh ikut dihapus.
- [x] Perubahan file existing yang dipertahankan harus minimal dan terarah. Kode/hardcode dummy di dalam file non-dummy WAJIB dihapus, bukan sekadar dikomentari, diberi flag, atau dibiarkan sebagai fallback.
- [x] Tidak membangun pembayaran, order, akun peserta/dosen, WhatsApp API berbayar, Voting, hasil Voting, kandidat Voting, sistem pemenang, atau backend kedua.
- [x] Semua klaim selesai harus berdasarkan bukti build, migration, API, UI lintas sesi, dan tes aktual—bukan screenshot mock atau komponen yang belum tersambung.
Definisi selesai dan aturan checkpoint
- [x] Untuk setiap tugas: implementasi → integrasi UI existing → validasi auth → DB nyata → error/empty/loading → tes → update checkbox jika lulus.
- [x] Buat status pekerjaan tiap batch (TODO/`IN PROGRESS`/`BLOCKED`/`DONE`) beserta bukti tes singkat, commit/diff, dan blocker nyata; jangan memberi tanda [x] tanpa verifikasi.
- [x] Jangan menunggu seluruh backend selesai baru menyambung frontend: integrasi per modul, lalu tes E2E setelah setiap batch.
- [x] Jangan memanggil fetch ke REST internal sendiri dari Server Component jika service/server query langsung lebih efisien; tetap ikuti kontrak PRD.
- [x] Jangan mengklaim layanan email sungguhan berhasil hanya dari enqueue: UI menyatakan “Email dijadwalkan/diproses”; job sent berarti provider menerima request, bukan jaminan diterima inbox.
- [x] Pastikan seluruh implementasi bekerja pada fresh session, browser lain, reload, dan deployment staging dengan data nyata Supabase, bukan state in-memory/browser.
Checklist dari spesifikasi asal — Audit existing repository + inventaris penghapusan dummy (WAJIB SEBELUM REFACTOR)
Inventaris produk dan routes
- [x] Catat seluruh route publik: /, /fashion-show, /awarding, /daftar, /daftar/[ticketId], /daftar/berhasil, /tiket/[token] (jika ada/perlu), /undangan/[inviteToken].
- [x] Catat seluruh route internal: /panitia/login, /panitia, /panitia/website/beranda, /panitia/website/band, /panitia/tiket, /panitia/peserta, /panitia/undangan/dosen, /panitia/undangan/template, /panitia/check-in, /panitia/akun.
- [x] Catat route sidebar baru /panitia/fashion-show dan /panitia/awarding atau alias ke route existing; tentukan redirect tanpa membuat navigasi lama rusak.
- [x] Tandai route/komponen Voting serta pengelolaan pemenang sebagai FUTURE_MODULE, bukan komponen yang harus dihapus, kecuali yang semata-mata file dummy.
- [x] Inventaris seluruh sumber CMS tanggal, tempat, band, judul/deskripsi teaser, preview undangan, tiket, peserta, statistik, pengaturan role, QR dan e-ticket; cari apakah data memakai constant, JSON, seed, localStorage, sessionStorage, React context, mock repo atau API palsu.
- [x] Inventaris seluruh image URL statis untuk konten yang seharusnya diupload Admin, bedakan dari aset dekorasi asli (tirai, panggung, light rig, spotlight, piala ilustrasi, ornamen) yang tetap boleh statis sebagai bagian design system.
- [x] Buat matriks Existing UI → Current Mock Source → Real Supabase Source → Mutation/Read → Test → Cleanup Target.
Pencarian lintas file (contoh adaptasi sesuai platform)
- [x] Jalankan audit kode dengan rg (atau git grep) tanpa otomatis menghapus hasilnya; contoh:
rg -n -i 'mock|dummy|fake|fixture|seed|sample|placeholder|fallback|demo|simulat' src app components lib data hooks services 2>/dev/null || true
rg -n 'localStorage|sessionStorage|Date\.now\(|Math\.random\(' src app components lib 2>/dev/null || true
rg -n -i 'hardcoded|hardcode|staticData|initialData|demoUser|demoTicket|demoNim|fakeAuth|switch.?role' src app components lib 2>/dev/null || true
rg -n -i 'fosca band|citra amelia|andi pratama|hendra saputra|greenIoT|general admission' src app components lib 2>/dev/null || true
rg -n 'NEXT_PUBLIC_.*(SECRET|SERVICE|KEY)|service_role|BREVO_API_KEY' . --glob '!node_modules/**' --glob '!.next/**' || true
- [x] Kelompokkan setiap temuan sebagai RUNTIME_DUMMY, DUMMY_ONLY_FILE, PRODUCTION_COMPONENT, PHASE2_REAL_COMPONENT, TEST_FIXTURE_ISOLATED, DESIGN_ASSET, DOC_EXAMPLE, atau REAL_CONFIG.
- [x] Jangan hapus DESIGN_ASSET, komentar dokumentasi, placeholder input UX, ikon, tanggal pada test terisolasi, library dependency, maupun teks instruksional PRD hanya karena mengandung kata “dummy”.
- [x] Identifikasi file khusus dummy: contoh hanya jika benar-benar ada mock-data.ts, mockRepository.ts, dummyTickets.ts, fakeAuth.ts, mockStore.ts, seed-demo.json, dan file sejenis. Ini contoh pola, bukan klaim nama file actual.
- [x] Catat seluruh import, re-export, dynamic import, dan build reference ke file dummy tersebut; siapkan pengganti atau buang dependency.
- [x] Catat dataset fiktif yang sekarang terlihat di staging/produksi (akun switch role, contoh peserta, dosen, NIM, tiket, judul band hardcoded, tanggal acara palsu, data pemenang dummy).
- [x] Inventaris seeded/mock DB rows terpisah dari data nyata; jangan langsung truncate tabel remote. Bersihkan data fiktif hanya setelah sumbernya terverifikasi, aman, dan melalui prosedur migration/data cleanup yang dapat diaudit.
- [x] Catat route/fitur UI yang berstatus belum terintegrasi; jangan “menyelesaikan” backend dengan menyembunyikan seluruh tombol.
Matriks klasifikasi integrasi
Klasifikasi	Arti	Tindakan
SUPPORTED	Sudah memakai layanan nyata & diuji	Jaga dan tes regresi
PENDING_INTEGRATION	UI asli ada, sumber masih dummy/mock	Sambungkan layanan nyata, lalu hapus mock
FUTURE_MODULE	Fitur valid tetapi di luar Phase 1	Pertahankan komponen/aset non-dummy, tutup akses produksi, hapus data palsunya
DUMMY_ONLY_FILE	File hanya untuk mensimulasikan runtime	Hapus fisik dari repo setelah semua import diganti
OUT_OF_SCOPE	Pembayaran, API WhatsApp, modul di luar produk	Jangan bangun


Tambahan wajib untuk meningkatkan kualitas
- [x] Verifikasi working tree/branch dan buat backup atau commit checkpoint sebelum modifikasi; catat status awal tes dan gap dari PRD.
- [x] Identifikasi file .md di docs/ yang benar-benar ada; catat beda kontrak URL dari repo agar tidak melakukan rename massal.
- [x] Buat baseline screenshot/rekaman dari UI yang ada (termasuk empty/error), bukan untuk klaim selesai tetapi pembanding visual regresi.
- [x] Inventaris tombol tidak berfungsi, onclick berisi toast palsu, query memakai localStorage, seed fallback, fixture dan aset gambar placeholder; kategorikan setiap path.
- [x] Bekukan keputusan fase 2: Voting, Hasil Voting, Kandidat Voting, dan Kelola Pemenang out of scope backend; jangan diam-diam membuat data atau menu palsu.
- [x] Buat docs/reports/PHASE-0-AUDIT.md berisi path aktual, daftar kandidat delete file, matriks UI→service→DB, baseline fail/pass dan blockers.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 0 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Daftar file & route nyata, matriks UI→source→DB, audit dummy & baseline QA diverifikasi ulang; tidak ada tebak path.
- [x] Signoff: docs/reports/PHASE-0-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 1 — Fondasi Supabase, migrations, RLS & atomic transactions
Status awal: DONE_VERIFIED
Prasyarat: PHASE 0 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Setup Supabase, environment, auth, dan migrations
- [x] Gunakan Supabase PostgreSQL + Auth + Storage, satu backend melalui aplikasi Next.js App Router existing; jangan menambah Express/NestJS/microservice.
- [x] Konfirmasi project Supabase development/staging vs production dan project reference; jangan pernah menjalankan migration destruktif pada proyek production tanpa review.
- [x] Tambahkan paket/CLI minimal seperlunya dengan package manager existing; jangan mengubah lockfile tanpa alasan.
- [x] Inisialisasi supabase/ hanya jika belum ada; gunakan migration timestamp melalui supabase migration new (hindari perubahan Dashboard manual tak tercatat).
- [x] Siapkan env.example tanpa secrets berisi publishable Supabase URL/key, server-only secret/service role, Brevo key, sender, site URL, CRON_SECRET, dan konfigurasi operasional yang diperlukan sesuai PRD.
- [x] Konfigurasikan Vercel/staging env; rahasia tidak pernah masuk NEXT_PUBLIC_*, browser bundle, logging, screenshot, ataupun Git.
- [x] Implementasikan SSR Supabase client/server/service yang terpisah; gunakan middleware.ts atau proxy.ts sesuai versi Next.js aktual, bukan dua implementasi bersamaan.
- [x] Gunakan Supabase Auth hanya untuk Admin Panitia dan Petugas Check-in; matikan self-signup internal dan tolak akses guest ke dashboard.
- [x] Tulis migration schema tepat 8 tabel total: staff_profiles, event_settings, ticket_types, participants, lecturer_invitations, checkins, audit_logs, email_jobs (jika existing schema setara, adaptasi tanpa duplikasi).
- [x] Tulis FK, unique, check constraints, default server timestamps, index pencarian/jadwal, dan RLS/grant/revoke; uji di environment non-production.
- [x] staff_profiles terhubung auth.users; role hanya admin/`checkin_staff`, is_active, admin terakhir terlindungi oleh pemeriksaan atomik.
- [x] event_settings satu event; menyimpan CMS Beranda, Band tunggal, Teaser, page visibility dan template surat JSONB terstruktur (tidak membuat tabel media/lineup/event multi-tenant baru).
- [x] ticket_types: jenis, deskripsi, kuota NULL/angka >0, jadwal dengan close > open, status draft/published/archived.
- [x] participants: identitas, NIM normalized unique termasuk arsip, jenis tiket FK, ticket_number, token QR unik, token akses web unik, status aktif/arsip, timestamp; nomor/token immutable setelah terbit.
- [x] lecturer_invitations: nama+gelar, email, phone, kode, token link personal & QR permanen, aktif/nonaktif, unique email case-insensitive hanya jika aktif.
- [x] checkins: tepat satu FK mahasiswa atau dosen (XOR), checked_at server, metode qr/manual, checked_by FK staff; unique per orang.
- [x] audit_logs: actor, action, entitas, timestamp, detail tersanitasi; tidak ada password/token/secret di log.
- [x] email_jobs: kind, target, tujuan email, dedupe key, pending/processing/retry/sent/failed/cancelled, attempts, run_after, lease, error teknis non-PII.
- [x] Terapkan constraints melalui migration, bukan hanya Zod di aplikasi; generate/update TypeScript DB types dari schema nyata.
- [x] Siapkan RLS: data publik hanya proyeksi CMS/tiket yang aman, data peserta/dosen/staff hanya melalui server terotorisasi; storage file publik bisa dibaca tetapi hanya Admin yang dapat upload.
- [x] Function privileged memakai explicit schema/search_path aman serta REVOKE EXECUTE untuk publik kecuali benar-benar diperlukan.
- [x] Bootstrap Admin awal menggunakan proses server yang aman dan terdokumentasi; tanpa password hardcoded/akun demo di produksi.
- [x] Uji migration dari database kosong di local/staging; simpan hasil db diff / migration status, lalu baru rencanakan db push remote setelah review.
- [x] Jangan menggunakan supabase db reset pada database produksi; backup sebelum migrasi produksi yang berpotensi mengubah data.
Checklist dari spesifikasi asal — Keamanan, validasi bersama, dan transaksi atomik
- [x] Buat service layer dan validasi schema server (mis. Zod sesuai dependency repo) untuk semua form, route, dan Server Actions.
- [x] Gunakan API error envelope dari PRD (success, data / error.code, message, fieldErrors, opsional requestId) secara konsisten.
- [x] Pastikan Admin/Petugas role dicek setiap request berdasarkan Supabase Auth + staff_profiles, bukan role dari localStorage maupun switch-role UI dummy.
- [x] Atur rate limiting/abuse protection pada registrasi, akses token PDF/web/undangan, login, dan endpoint check-in; respons tidak membocorkan keberadaan peserta lewat pesan publik.
- [x] Buat RPC/transaksi atomik register_participant: lock ticket type → cek jadwal, status, kuota, NIM → insert peserta/tiket identitas → enqueue email job → commit.
- [x] Uji dua registrasi bersamaan pada sisa 1 kursi; hanya satu commit, tidak pernah oversold.
- [x] Uji NIM duplicate termasuk peserta archived; status server DUPLICATE_NIM, tidak membuat tiket baru.
- [x] Idempotency key registrasi: retry request sama mendapat tiket sama, tidak membuat peserta/QR/email ganda; payload/key berbeda tidak boleh membuka data orang lain.
- [x] Buat operasi edit NIM dan perubahan jenis tiket dengan validasi uniqueness/kuota dan audit yang sesuai.
- [x] Buat RPC/transaksi atomik arsip/pulihkan: lock peserta + jenis tiket; arsip mengembalikan kuota berdasarkan active count; restore cek kuota; token tiket tetap.
- [x] Restore peserta lama ketika tipe tiket archived tetap mengikuti keputusan tiket issued tetap sah dan kuota tersedia (cek asumsi rinci PRD); jangan membuka registrasi baru.
- [x] Buat confirm_checkin atomik; unique constraint menolak duplikat walaupun scan dari dua petugas bersamaan.
- [x] Resolve token QR/manual menghasilkan resolution token pendek yang terikat ke sesi staff (PRD default 120 detik); confirm mengecek ulang status target, hak staff, dan expiry.
- [x] Gunakan check-in timestamp DB, bukan Date.now() dari browser; method dan checked_by berasal dari server/session yang tervalidasi.
- [x] Terapkan dua tahap verifikasi Edit/Arsip peserta dengan re-auth server-bound dan audit; jangan mengandalkan teks HAPUS saja untuk otorisasi.
- [x] Lindungi Admin terakhir terhadap dua request bersamaan yang menurunkan/menonaktifkan Admin.
- [x] Batasi penayangan NIM/email/HP pada halaman publik, log, analytics, atau error; QR hanya memuat token acak opaque, bukan PII.
Tambahan wajib untuk meningkatkan kualitas
- [x] Pastikan migration selalu memiliki nama timestamp dan urutan apply; lakukan dry-run/review sebelum staging apply; jangan reset production.
- [x] Audit foreign keys dan trigger agar default privileges tidak membocorkan tabel peserta/dosen/check-in ke role anonymous.
- [x] Verifikasi SECURITY DEFINER dan grant EXECUTE hanya ke role yang tepat; uji pemanggilan RPC langsung oleh anon.
- [x] Pastikan token pribadi hanya dipakai sebagai opaque random secret; simpan/validasi dengan mekanisme aman dan jangan dicatat dalam log publik.
- [x] Uji freeze harga = gratis (tidak ada payment object), integritas status tiket, dan semua constraint pada database fresh.
- [x] Siapkan test SQL positif-negatif termasuk concurrency kuota/checkin, data unicode, NIM dengan nol depan dan email case-insensitive.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 1 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Database fresh staging migration PASS, RLS anon/staff PASS, FK/unique/transactions tested, security reviewer PASS.
- [x] Signoff: docs/reports/PHASE-1-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 2 — Login panitia, authorization & Kelola Akun
Status awal: DONE_VERIFIED
Prasyarat: PHASE 1 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Integrasi autentikasi & Kelola Akun
- [x] Ganti login dummy menjadi Supabase Auth SSR, cookie/session management, logout, dan validasi staff aktif.
- [x] Hapus akses demo/switch role palsu sebagai jalan pintas izin; role hanya berasal dari database.
- [x] Pasang route guards untuk /panitia/**; Petugas Check-in dibatasi ke check-in/riwayat dan logout, Admin mendapat seluruh Phase 1.
- [x] Sambungkan menu Kelola Akun: daftar, tambah, edit nama/email/role, reset password, nonaktif/aktif, dan feedback server nyata.
- [x] Pembuatan/ubah user Auth administratif memakai server credentials aman, tidak ada Admin API di browser.
- [x] Jika password awal wajib diganti belum disepakati sebagai kebijakan, tandai sebagai keputusan tertunda di implementasi; jangan mengklaim fitur wajib ACC tanpa dasar.
- [x] Uji unauthorized akses Server Actions langsung dari petugas dan guest (bukan hanya saat menu disembunyikan).
- [x] Uji logout/new session/pencabutan akses akun yang dinonaktifkan.
- [x] Hapus file fakeAuth/mock role store secara fisik bila hanya berisi simulasi.
Tambahan wajib untuk meningkatkan kualitas
- [x] Hilangkan UI demo login (prefill akun palsu, switch-role, quick test account) sepenuhnya dari halaman produksi; bukan hanya hide via CSS.
- [x] Pastikan sesi staff nonaktif/role berubah diputus saat request berikutnya, dan must_change_password tidak dipaksakan tanpa kebijakan ACC.
- [x] Uji dua akun Admin menonaktifkan diri bersamaan; tetap tersisa minimal satu Admin aktif.
- [x] Uji login salah, logout, password reset, direct URL staff dan direct call Server Actions dari anonymous/check-in staff.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 2 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Login/logout/role/akun nyata PASS di dua browser; peran salah/guest ditolak via direct action; fake auth removed.
- [x] Signoff: docs/reports/PHASE-2-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 3 — Media Admin — Storage, upload 10 MB & kompres
Status awal: DONE_VERIFIED
Prasyarat: PHASE 2 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Supabase Storage & foto maksimum 10 MB dengan kompresi
- [x] Gunakan Supabase Storage untuk media acara; pilih bucket dan kebijakan akses paling sederhana yang aman (misal bucket memoria-media khusus media publik non-PII).
- [x] Maksimum file asli pilihan Admin 10 MB; tolak file asli lebih besar sebelum memulai upload.
- [x] Validasi tipe MIME, ekstensi, magic bytes/format jika mampu dan resolusi; jangan percaya ekstensi saja.
- [x] Kompresi/resize otomatis di browser sebelum upload untuk menghindari payload besar melewati Vercel Next.js function.
- [x] Pertahankan transparansi PNG/WebP untuk foto model; jangan konversi menjadi JPEG sehingga background menjadi putih.
- [x] Untuk hasil kompresi masih besar, pilih mekanisme direct/resumable upload Supabase yang sesuai; tampilkan progress dan retry UI.
- [x] Implementasi POST /api/uploads/authorize: verifikasi Admin, validasi purpose, buat path aman UUID + upload authorization pendek; jangan terima path arbitrary dari browser.
- [x] Setelah upload sukses, server verifikasi objek & simpan path lewat Action CMS; jangan menyimpan base64/data URL/localStorage sebagai sumber foto.
- [x] Ganti foto lama dengan path baru pada DB; hapus orphan media melalui prosedur terkontrol ketika aman, jangan membuang aset yang masih direferensikan.
- [x] URL foto publik tampil pada Beranda; asset caching/versioning cukup agar foto baru terlihat setelah Simpan.
- [x] Tidak membuat tabel media baru kalau tidak dibutuhkan; path foto cukup di event_settings.
- [x] Uji file 1 MB, 9–10 MB, >10 MB, PNG transparan, format tidak valid, upload batal, jaringan putus, dan access denied.
Tambahan wajib untuk meningkatkan kualitas
- [x] Audit frontend upload foto saat ini: hapus simulasi sukses atau preview yang pura-pura persistence; preview blob lokal sementara tetap diperbolehkan.
- [x] Validasi file sebelum dan sesudah kompres (MIME, size, dimensions), cek policy Storage, dan reject file palsu yang berganti ekstensi.
- [x] Uji foto baru tetap terlihat setelah full reload, browser kedua, dan perubahan cache; foto tidak hilang ketika user keluar.
- [x] Jika upload gagal, data CMS tidak mengarah ke objek Storage yang tidak ada; bersihkan orphan dengan kontrol.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 3 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): File 1 MB, 9–10 MB, >10 MB, alpha preserve dan upload failure PASS di Storage; berubah lintas browser.
- [x] Signoff: docs/reports/PHASE-3-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 4 — CMS Beranda, Band tunggal, teaser dan visibilitas halaman
Status awal: DONE_VERIFIED
Prasyarat: PHASE 3 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — CMS Beranda + Band tunggal + teaser + Coming Soon
Informasi acara, hero, dan countdown
- [x] Sambungkan editor Admin /panitia/website/beranda ke event_settings: nama acara, tagline, deskripsi, tanggal+jam/tahun, timezone Asia/Jakarta, tempat/alamat.
- [x] Simpan dengan server validation dan Server Action; mutasi nyata harus menginvalidasi cache Beranda agar langsung muncul setelah Simpan.
- [x] Beranda mengambil satu public data projection dari server (hindari 4 GET API terpisah); panggung, tirai, marquee, dan animasi GSAP tetap tidak berubah.
- [x] Countdown menghitung menuju event_start_at yang sama dengan teks Waktu dan e-ticket; browser memperbarui detik lokal tanpa API polling tiap detik.
- [x] Countdown tidak negatif ketika event berlangsung/lewat; timezone konsisten; cegah hydration mismatch.
- [x] Hapus tanggal/tempat/nama event hardcoded dari runtime. Nilai default untuk record event yang diisi panitia bukan fallback diam-diam di UI; jika DB kosong tampilkan empty/setup state yang jujur.
Artis Band hanya satu
- [x] Ganti tabel Kelola Lineup Band/tombol tambah banyak band menjadi satu form Foto, Nama Band, Keterangan (tanpa urutan).
- [x] Simpan satu band pada kolom event_settings.band_*; update mengganti konten entri yang sama, bukan insert lineup baru.
- [x] Foto band hasil upload Storage tampil pada panggung/ilustrasi existing; nama dan keterangan dibaca dari DB.
- [x] Hapus array daftar band hardcoded, urutan dummy, seeder grup lain dan fake fallback runtime.
- [x] Jika foto belum diupload, gunakan UI empty media state yang jelas, bukan foto orang palsu.
Teaser Fashion Show dan Awarding
- [x] Admin bisa edit judul, deskripsi, foto teaser Fashion Show; sambungkan semua field ke event_settings.
- [x] Admin bisa edit judul dan deskripsi teaser Awarding tanpa field foto; patung/piala dan circular lights adalah aset ilustrasi desain existing.
- [x] Hapus seluruh teks bisnis hardcoded (“Panggung Fashion Show”, deskripsi parade, judul/narasi Awarding) dari komponen runtime; gunakan DB sebagai sumber.
- [x] Jangan menghapus aset panggung, GSAP, model visual statis dekoratif, logo/font, ataupun ornamen (bukan dummy bisnis).
- [x] Uji Admin mengganti nama/foto/teks → hard refresh publik → isi berubah, animasi tetap hidup.
Sidebar Fashion Show & Awarding terpisah
- [x] Kelola Beranda tetap fokus event, Band, teaser; sidebar terpisah Fashion Show dan Awarding untuk kontrol visibilitas halaman.
- [x] Masing-masing memiliki toggle Tampilkan Halaman tersimpan sebagai fashion_page_visible/`awarding_page_visible`.
- [x] Jika toggle off, /fashion-show atau /awarding menampilkan Coming Soon, tidak 404, dan tidak menampilkan pemenang dummy.
- [x] Jika toggle on, tampilkan konten layout aman Phase 1/empty appropriate (bukan kartu pemenang yang berasal dari mock data). Jangan membangun tabel pemenang sekarang.
- [x] Pertahankan route lama /panitia/website/fashion-show dan /panitia/website/awarding sebagai redirect/alias bila sudah dipakai bookmark; jangan biarkan menjadi halaman editor pemenang dummy.
- [x] Sembunyikan/disable sidebar Voting & Hasil, Candidate Voting, dan aksi penentuan pemenang Phase 2 dari UI produksi; route lama yang diakses manual menampilkan Fitur belum tersedia dan tidak menjalankan mutation palsu.
Tambahan wajib untuk meningkatkan kualitas
- [x] UI Beranda harus bebas dari placeholder nilai bisnis yang tampak nyata saat DB kosong; tetap tampil desain panggung dengan empty/setup state yang sesuai.
- [x] Hapus UI manajemen multi-band (tombol tambah/urut/drag reorder jika hanya dummy) dan ganti satu form band, tanpa menghapus komponen panggung asli.
- [x] Teaser Fashion memakai foto admin; Awarding teaser tidak meminta foto; judul/deskripsi keduanya live DB.
- [x] Pastikan toggle Fashion/Awarding OFF → Coming Soon dan ON → konten aman tanpa winner dummy; route lama bookmark tetap benar.
- [x] Test konten disimpan pada dua browser dan perubahan langsung terpantau, animasi tirai/GASP tetap berfungsi (tidak perlu animasi saat setiap refresh CMS).
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 4 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Admin Simpan → publik terganti setelah reload browser lain, footer/nav/GSAP tetap valid, tidak ada konten dummy.
- [x] Signoff: docs/reports/PHASE-4-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 5 — Tiket gratis, kuota, publikasi dan status otomatis
Status awal: DONE_VERIFIED
Prasyarat: PHASE 4 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Kelola Tiket, status otomatis, dan pemilihan tiket publik
- [x] Hubungkan daftar Admin /panitia/tiket ke ticket_types asli; form tambah/edit, publish/unpublish bila didukung, archive, daftar status, kuota, periode.
- [x] Semua tiket gratis permanen; tidak ada kolom harga mutable atau payment/invoice backend.
- [x] Kuota opsional: capacity = NULL artinya tanpa batas; kalau ada >0; hitung kuota terpakai dari peserta active, bukan mengubah counter manual.
- [x] Pisahkan admin status draft/published/archived dari public derived status upcoming/open/sold_out/closed.
- [x] Public list hanya ticket type published, sementara draft/archived tidak ditawarkan; archive tipe tidak membatalkan issued ticket.
- [x] Derived status menghitung waktu server, periode buka/tutup, kuota, dan status; tidak menyimpan status computed sebagai kolom kedua dan tidak butuh cron status tiket.
- [x] Pastikan input tanggal-jam di Admin benar ditafsirkan sebagai Asia/Jakarta, lalu disimpan timestamptz UTC dalam DB.
- [x] Tampilkan di /daftar: nama, deskripsi, gratis, kuota/remaining jika relevan, status/CTA; nonaktifkan pemilihan jika upcoming/sold_out/closed.
- [x] Saat submit registrasi, periksa status/kuota ulang di transaksi server, jangan percaya status UI yang bisa sudah berubah.
- [x] Uji status berbatas detik, tepat sebelum/saat/setelah jadwal, kuota terakhir, unlimited, draft/archived, dan perubahan kapasitas dengan peserta aktif.
- [x] Hapus array tiket dummy, fake status countdown tiket, fake kapasitas, dan file tiket khusus dummy setelah service asli terpasang.
Tambahan wajib untuk meningkatkan kualitas
- [x] Tampilkan status Admin draft/published/archived berbeda dari status publik upcoming/open/sold_out/closed; tidak ada status publik palsu yang diset manual.
- [x] Uji cut-off persis detik buka/tutup pada timezone WIB dan transition jika kuota mencapai nol.
- [x] Uji menurunkan kuota di bawah peserta aktif ditolak/dibatasi dengan pesan yang benar; archived jenis tiket tidak membatalkan QR peserta existing.
- [x] Hapus UI harga, checkout, mock payment, order atau invoice bila ternyata tersisa dari template dan memang tidak dipakai MEMORIA.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 5 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Published/Upcoming/Open/Sold Out/Closed/Archived dan race capacity PASS; issued tickets aman.
- [x] Signoff: docs/reports/PHASE-5-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 6 — Registrasi mahasiswa + e-ticket web/PDF/QR permanen
Status awal: DONE_VERIFIED
Prasyarat: PHASE 5 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Registrasi peserta seluruh fakultas Telkom + tiket unik
- [x] Form registrasi publik memiliki Nama, NIM wajib, Program Studi teks bebas, Fakultas dropdown 8, WhatsApp, Email, dan Jenis tiket pilihan.
- [x] Delapan fakultas persis: Fakultas Ilmu Terapan; Fakultas Komunikasi Sosial; Fakultas Ekonomi Bisnis; Fakultas Industri Kreatif; Fakultas Informatika; Fakultas Teknik Elektro; Fakultas Kedokteran; Fakultas Rekayasa Industri.
- [x] Maksud terbuka “umum” = seluruh mahasiswa Universitas Telkom lintas prodi/fakultas dalam daftar; bukan pendaftar tanpa NIM.
- [x] Validasi server sama dengan UI: field wajib, length, email/nomor, NIM teks (leading zero aman), fakultas whitelist, ticket ID valid.
- [x] Implementasikan POST /api/registrations sesuai kontrak PRD; anti-spam/rate limit, idempotency, error typed; response hanya ticket access URL yang dibutuhkan.
- [x] Jalankan SQL RPC atomik registrasi; generate UUID peserta dan ticket_number human-readable, QR token opaque, access token personal acak, idempotency key.
- [x] Enqueue ticket_initial ke email_jobs dalam transaksi; respons keberhasilan tidak menunggu Brevo.
- [x] GET /tiket/[token]/success route memakai data server nyata, tidak hanya React state yang hilang saat refresh.
- [x] Sukses registrasi menampilkan ringkasan data asli, tombol unduh PDF, QR asli, tautan personal; jangan pernah menampilkan token dummy statis.
- [x] QR payload menunjuk token tiket permanen, bukan NIM, tidak memuat PII; kompatibel dengan scanner backend.
- [x] Duplikat NIM di semua jenis tiket termasuk arsip ditolak; retry request sama tidak membuat registrasi baru.
- [x] Perubahan NIM melalui Admin hanya mengubah NIM; participants.id, ticket_number, qr_token, ticket_access_token tetap identik.
- [x] Uji frontend, server dan DB terpisah untuk email duplicate (boleh sama), nomor HP sama (boleh), NIM duplicate (tidak), race quota, retry network, dan user reload.
Checklist dari spesifikasi asal — E-ticket web, QR, dan PDF (termasuk data event terbaru)
- [x] Buat satu shared ticket data mapper/template agar e-ticket web, PDF, dan lampiran Brevo menggunakan data yang konsisten.
- [x] Render nama acara, tanggal/hari, jam, lokasi, alamat jika tersedia, nama peserta, NIM, prodi, fakultas, jenis tiket, nomor tiket, kode dan QR.
- [x] Data peserta berasal Supabase; data event berasal event_settings terbaru saat render, bukan hardcode dari saat registrasi.
- [x] Gunakan GET /api/tickets/[token]/pdf yang memverifikasi akses token, generate PDF biner (application/pdf) dengan QR readable, filename aman, tanpa base64 JSON umum.
- [x] Token akses web dan token QR berbeda; keduanya immutable. Jangan expose QR token secara tak perlu dalam list publik.
- [x] PDF lama dengan NIM lama tetap bisa discan (QR sama); PDF baru menampilkan NIM terbaru tanpa mengubah QR. Uji ini secara nyata.
- [x] Tiket peserta archived: scan ditolak; halaman web/PDF harus menunjukkan status nonaktif/watermark atau pesan tegas, bukan tiket yang tampak valid.
- [x] PDF dapat diunduh di mobile/desktop; pastikan qr contrast/quiet zone dan pemindaian pada kertas/layar.
- [x] Hindari menyimpan PDF per peserta sebagai file hardcoded di public/; buat ketika dibutuhkan atau oleh worker dengan template sama.
- [x] Uji token invalid/expired? (token akses permanen, bukan session expiry), rate limiting, retry PDF, unicode nama panjang, dan update jadwal acara.
Tambahan wajib untuk meningkatkan kualitas
- [x] Pastikan form semua mahasiswa Telkom: prodi input teks; fakultas dropdown delapan; NIM tetap wajib dan tidak duplikat.
- [x] Verifikasi participant_id, ticket_number, qr_token, ticket_access_token immutable bahkan setelah Admin edit NIM; QR PDF lama berhasil di-scan terhadap record terbaru.
- [x] Jangan menampilkan halaman berhasil dengan data React/localStorage jika transaksi DB gagal; success hanya dari commit nyata.
- [x] Tetapkan mode akses GET /tiket/[token] aman (random opaque token, noindex, no-store, rate-limit, tidak mengungkap data via list public).
- [x] Uji PDF cetak dan scanner fisik, bukan hanya preview QR di browser; scan dari 2 device dan after NIM-edit.
- [x] Validasi failure path pendaftaran saat Supabase unavailable: tidak ada tiket palsu, QR dummy, atau fake success toast.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 6 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): NIM unique, reservasi kuota, QR PDF lama valid setelah edit NIM, cross-browser persistence & error paths PASS.
- [x] Signoff: docs/reports/PHASE-6-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 7 — Email transaksional Brevo + email_jobs worker
Status awal: DONE_VERIFIED
Prasyarat: PHASE 6 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Brevo + antrean email_jobs (ACC)
- [x] Siapkan BREVO_API_KEY, verified sender email/name dan site URL di ENV server saja.
- [x] Buat email_jobs migration + claim/lease/locking sederhana, dedupe dan retry dengan bounded attempts/backoff.
- [x] Registrasi commit hanya enqueue job; jangan menunggu Brevo di request registrasi.
- [x] Admin Kirim Ulang Tiket dan Kirim Email Dosen melakukan enqueue job, bukan direct send dari browser.
- [x] Worker internal GET /api/internal/email-worker hanya bisa dijalankan dengan CRON_SECRET/autentikasi scheduler; proses batch kecil, atur lease, retry transient vs failed permanent.
- [x] Email tiket: template HTML ringkas, identitas acara, tautan e-ticket personal, PDF/QR dari service yang sama jika layak; tidak ada link localhost atau dummy.
- [x] Email dosen: nama+gelar, isi template surat personal, jadwal/tempat, tautan undangan stabil, QR dan pesan sopan.
- [x] Jika alamat email diubah setelah job antre, cek snapshot/relevansi agar tidak mengirim detail personal ke alamat lama yang tidak diinginkan.
- [x] UI feedback queue = “Email dijadwalkan/diproses”, bukan “Email telah terkirim” sebelum hasil provider; tidak ada kolom status email pada daftar peserta/dosen.
- [x] Jika pengiriman gagal: ticket tetap sah, retry sesuai kebijakan, admin dapat request resend tanpa menduplikasi registration.
- [x] Uji Brevo staging/inbox pengujian (bukan blast ke dosen/mahasiswa sungguhan), email invalid, sender tidak verified, timeout, retry, concurrency worker, duplicate job.
- [x] Simpan error teknis pendek tanpa token/PII. Jangan masukkan credential Brevo ke client/browser.
Tambahan wajib untuk meningkatkan kualitas
- [x] Pastikan worker cron terkonfigurasi benar-benar dapat berjalan pada hosting target; jangan menganggap setTimeout/fire-and-forget pada request dapat diandalkan.
- [x] Email otomatis asynchronous: registrasi langsung sukses setelah DB commit, job queued; UI tidak boleh mengklaim inbox sudah menerima.
- [x] Uji job stuck/lease expired, idempotency saat retry/resend, dedupe per penerima/snapshot data, dan batas retry.
- [x] Gunakan sender terverifikasi serta domain website resmi; jangan kirim email real massal saat QA.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 7 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Queued/retry/deduped/worker clock tested ke inbox uji; registrasi tidak menunggu Brevo; tidak fake email toast.
- [x] Signoff: docs/reports/PHASE-7-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 8 — Data Peserta, koreksi, arsip/pulih dan ekspor Excel
Status awal: DONE_VERIFIED
Prasyarat: PHASE 7 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Data Peserta — UI, backend, edit, arsip, pemulihan, Excel
- [x] Sambungkan /panitia/peserta ke Supabase: Peserta Aktif dan Arsip Peserta, total counts, filter ticket type/kehadiran, search nama/NIM, pagination server 25–50 per halaman.
- [x] Hapus kolom dan status Vote / Voting dari tabel, detail, statistik, filter, dan XLSX Phase 1; jangan membuat schema voting.
- [x] Tabel minimal memuat nama, NIM, prodi/fakultas, jenis tiket, kontak, hadir/belum, waktu check-in dan aksi.
- [x] Detail peserta membaca record dan e-ticket live; Kirim Email ulang enqueue Brevo job.
- [x] Edit peserta dua tahap: preview perubahan dan verifikasi otorisasi Admin terbaru sebelum Server Action commit; NIM tidak boleh duplicate, tiket/QR permanen.
- [x] Arsip dua tahap: konfirmasi dampak + re-auth Admin; DB soft-delete (archived), token tetap tetapi tidak valid untuk check-in, kursi kembali tersedia.
- [x] Pemulihan Admin memakai konfirmasi dan transaksi cek kuota, tetap memakai identitas tiket lama; riwayat check-in tetap tersimpan.
- [x] Uji perubahan ticket type (jika fitur existing mendukung) dengan perhitungan kuota lama/baru atomik.
- [x] GET /api/admin/participants/export menghasilkan XLSX nyata, whitelist columns, filter sama dengan UI, tanpa vote/token/URL internal/password.
- [x] Excel NIM sebagai text (nol depan aman), tanggal WIB, escaped/sanitized formula injection =, +, -, @.
- [x] Tampilkan loading, error, empty, update cache/refresh hanya segmen relevan setelah mutasi.
- [x] Audit NIM change, arsip, restore, ticket type change dengan actor dan timestamp (tanpa membocorkan secret).
- [x] Uji refresh/browser kedua/role staff/no access, kuota, arsip, restore, XLSX export, dan edit setelah tiket terbit.
Tambahan wajib untuk meningkatkan kualitas
- [x] Hapus kolom, filter, stats, badge, dan detail Vote dari daftar peserta dan XLSX Phase 1; jangan hanya menyembunyikan via CSS.
- [x] Hapus tombol UI dummy atau dropdown aksi yang belum terhubung; setiap aksi tersisa harus punya handler server nyata dan feedback valid.
- [x] Uji dua langkah verifikasi edit dan arsip: preview/dampak + re-auth yang dicek server; bypass via direct POST harus ditolak.
- [x] Uji restore setelah kuota kembali habis, setelah jenis tiket archived, dan bila peserta pernah check-in; jangan kehilangan riwayat.
- [x] Uji file XLSX dibuka aplikasi spreadsheet dan NIM tetap teks; tidak ada =HYPERLINK/formula injection.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 8 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Semua aksi peserta, dua verifikasi, kuota restore, XLSX sanitization + data nyata & permissions PASS.
- [x] Signoff: docs/reports/PHASE-8-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 9 — Undangan Dosen + template, QR, email & WhatsApp
Status awal: DONE_VERIFIED
Prasyarat: PHASE 8 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Undangan Dosen — template, personal link, QR, email/WhatsApp
- [x] Sambungkan /panitia/undangan/template ke event_settings.invitation_template, isian subject, greeting, body, closing, sender; simpan dan pratinjau menggunakan data DB.
- [x] Placeholder seperti {{nama_dosen}} dirender dari data undangan; whitelist variables, sanitasi HTML/escape injection.
- [x] Sambungkan /panitia/undangan/dosen: list, search, filter hadir, detail, tambah, edit, active/inactive jika UI tersedia.
- [x] Form dosen: nama+gelar, email, WhatsApp; satu email satu undangan aktif, case-insensitive.
- [x] Saat create, generate invitation_code, public_token link, qr_token untuk check-in; ketiganya stabil saat nama/email/template diperbarui.
- [x] Route /undangan/[inviteToken] membaca data riil dan template terbaru; pertahankan animasi amplop tertutup → klik Buka Undangan → kertas terbuka + QR; tombol Lihat QR tetap bekerja.
- [x] Tombol Salin Link berisi URL domain resmi; tombol Kirim Email enqueue lecturer_invitation ke Brevo.
- [x] Tombol Kirim WhatsApp membuka chat dengan pesan dan link siap kirim (tanpa WhatsApp Business API); jangan klaim otomatis terkirim.
- [x] QR undangan dan lookup manual email/kode benar-benar valid pada scanner; token tidak berubah jika nama dikoreksi.
- [x] Uji dua email dosen identik dalam status aktif, edit email, reactivation, undangan inactive, refresh link, mobile animasi, dan perilaku QR.
- [x] Hapus contoh dosen/persona palsu dan dummy templating dari runtime; pertahankan template resmi yang disimpan di DB (bukan fallback fake).
Tambahan wajib untuk meningkatkan kualitas
- [x] Hapus UI surat undangan dummy, nama dosen statis, token contoh dan tautan lokal; empty-state saat belum ada data.
- [x] Pastikan satu email aktif hanya satu undangan, token/link tidak regenerasi saat edit nama atau surat.
- [x] Tombol WA hanya membuka draft link yang benar dan tidak mengklaim pesan sudah dikirim otomatis.
- [x] Uji surat personal dan animasi amplop click-to-open masih berfungsi setelah memakai data Supabase nyata.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 9 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Template, undangan unik, link QR stabil, email antrian, WA draft, animasi amplop, role tests PASS.
- [x] Signoff: docs/reports/PHASE-9-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 10 — Check-in QR kamera + manual + popup nama
Status awal: DONE_VERIFIED
Prasyarat: PHASE 9 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Check-in QR kamera & manual + popup keberhasilan
- [x] Pertahankan UI scanner existing; kamera melalui browser API yang benar (getUserMedia dengan izin di HTTPS), decoder QR nyata, opsi upload gambar QR hanya jika ada pada UI existing.
- [x] QR kamera dikirim ke POST /api/checkins/resolve; cek token mahasiswa/dosen, aktif, belum checkin, role, dan anti-abuse.
- [x] Manual mahasiswa: cari NIM; manual dosen: email atau invitation code; tampilkan satu hasil terverifikasi, bukan random/mock.
- [x] Tampilkan preview nama, NIM/email masked, tipe, jenis tiket jika mahasiswa, dan status hadir; tombol Hadirkan hanya bila eligible.
- [x] Klik Hadirkan → POST /api/checkins/confirm dengan resolutionToken dan method; checked_by dari auth sesi, jam dari DB.
- [x] outcome=CREATED → popup centang hijau/animasi ringan “Check-in Berhasil! — [Nama yang tepat]”, tanggal & jam WIB, tombol Scan Berikutnya.
- [x] ALREADY_CHECKED_IN → status duplikat + waktu check-in pertama, tanpa popup sukses baru dan tanpa menimpa checked_at.
- [x] Archived ticket, invitation inactive, QR invalid, token expired, staff inactive, network error → tampilkan pesan sesuai sebab; jangan menandai hadir secara optimistis.
- [x] Setelah sukses modal ditutup, scanner siap scan berikutnya; hindari scan loop melakukan konfirmasi berkali-kali.
- [x] Tidak ada open/close gate: check-in tetap bisa dilakukan kapan saja sesuai identitas aktif.
- [x] Tab riwayat mengambil data checkins nyata berpagination; statistik jumlah hadir mahasiswa/dosen/agregat dari DB.
- [x] Uji kamera desktop + mobile HTTPS (izin denied, device unavailable), QR PDF di layar/kertas, upload image, check-in manual, concurrency dua staff, duplicate scan, dan popup nama benar.
Tambahan wajib untuk meningkatkan kualitas
- [x] Hapus UI scanner palsu/fake detected QR; kamera nyata mengaktifkan izin dan decoder yang benar, serta fallback manual.
- [x] Popup centang hijau hanya setelah outcome CREATED di DB, menyebut nama sesuai record dan waktu WIB; ALREADY_CHECKED_IN bukan sukses ulang.
- [x] Uji scanner di browser mobile HTTPS + izin kamera ditolak + kamera tidak tersedia + QR tidak valid.
- [x] Uji dua petugas satu QR pada saat bersamaan, agar satu saja yang tercatat; first check-in timestamp tidak berubah.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 10 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Scan kamera dan manual nyata, concurrent/duplicate scan, popup nama & time dari DB, mobile HTTPS PASS.
- [x] Signoff: docs/reports/PHASE-10-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 11 — Dashboard nyata, seluruh UI↔service dan audit kontrak API
Status awal: DONE_VERIFIED
Prasyarat: PHASE 10 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Dashboard real metrics dan integrasi UI lintas halaman
- [x] Ganti dashboard dummy cards/statistik dengan agregat database: peserta aktif, tiket terpakai, checkin mahasiswa/dosen, tiket open/upcoming/sold-out sesuai PRD.
- [x] Server Components digunakan untuk read data CMS/list; hindari waterfall endpoint internal HTTP dari server dan SELECT * data sensitif.
- [x] Data peserta/undangan berpagination, query projected fields, indeks yang tepat; jangan fetch semua lalu memfilter di browser.
- [x] Setiap tombol Tambah, Simpan, Edit, Publish, Arsip, Pulihkan, Kirim, Unduh, Scan, Hadirkan memiliki backend nyata sesuai scope, bukan callback yang hanya menampilkan toast success.
- [x] Loading/saving/error/empty state pada seluruh form tetap berfungsi; Error server tidak dicetak mentah ke UI.
- [x] Update CMS menginvalidasi hanya cache terkait; data checkin/registrasi tidak boleh memakai cache yang stale.
- [x] Login/role tidak menampilkan tombol Ganti Role dummy; sidebar dan hak akses benar sesuai session.
- [x] Float tiket, navbar, countdown, GSAP panggung/curtain, animasi band, teaser runway/trophy, animasi undangan tetap berfungsi tanpa ketergantungan mock.
- [x] Halaman Fashion Show/Awarding hanya Coming Soon/toggle tanpa winner dummy; Voting/Hasil tidak tampil di dashboard Phase 1.
- [x] Semua nilai bisnis yang dulu “sementara” tidak diisi dari constants/seed contoh ketika DB kosong; gunakan empty/setup UI yang jujur.
Checklist dari spesifikasi asal — KONTRAK 7 Route Handlers + Server Actions (harus diuji nyata)
Route Handlers minimum (jangan membuat API CRUD berlebihan)
- [x] POST /api/registrations — publik, no-store, validasi dan RPC atomik, response 201/typed error.
- [x] GET /api/tickets/[token]/pdf — token personal, PDF binary terbaru + QR stabil, private/no-store.
- [x] POST /api/checkins/resolve — role staff, QR/manual, preview + resolutionToken, no-store.
- [x] POST /api/checkins/confirm — role staff, transaction DB, outcome CREATED/ALREADY_CHECKED_IN, no-store.
- [x] POST /api/uploads/authorize — role Admin, upload authorization foto terkompresi, no-store.
- [x] GET /api/admin/participants/export — role Admin, XLSX sesuai filter, no-store.
- [x] GET /api/internal/email-worker — cron-only auth, bounded batch + retry Brevo, no-store.
- [x] Unit/contract test payload sukses/gagal tiap endpoint dan redirect/URL; jangan mengasumsikan route path yang ada dari PRD bila repo sudah berbeda tanpa membuat adapter/redirect.
Server Actions & reads
- [x] CMS: save event, band, fashion teaser, awarding teaser, toggle page visibility.
- [x] Tickets: create/update/publish/archive, validate kuota dan jadwal.
- [x] Participants: edit, archive, restore, resend email; recent Admin verification dan audit.
- [x] Lecturers: template, create/update/deactivate, email queue, WhatsApp share link UI.
- [x] Accounts: create/update/role/reset/deactivate; Auth Admin API server.
- [x] Data read services: homepage summary, public ticket list/detail, e-ticket data, invitation data, dashboard metrics, paginated participants, paginated lecturers, checkin history.
- [x] Gunakan kontrak typed dari PRD; tidak ada panggilan browser ke service_role maupun pencarian peserta publik tanpa token.
Tambahan wajib untuk meningkatkan kualitas
- [x] Audit final semua tombol UI Phase 1: tidak ada tombol dummy, download palsu, placeholder click tanpa tindakan, atau statistik hardcode.
- [x] Petakan dan test 7 Route Handlers + setiap Server Action terhadap tabel, role dan UI tertentu. Jangan membuat API CRUD baru sekadar untuk mempermudah komponen.
- [x] Periksa server-rendered read tidak memanggil internal /api/... HTTP secara berantai; gunakan service query/projection yang efisien.
- [x] Uji perubahan data admin lintas sesi/role/refresh, realtime yang wajar atau invalidasi cache sesuai desain.
- [x] Tampilkan statistik dari DB, termasuk zero state yang benar saat kosong; tidak ada default 250/180/3 dari array demo.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 11 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): 7 handler contract + seluruh actions/UI→DB mapping, dashboard aggregates, no dummy buttons/screens PASS.
- [x] Signoff: docs/reports/PHASE-11-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 12 — PURGE FINAL — hapus fisik UI dummy, hardcode dan file mock
Status awal: DONE_VERIFIED
Prasyarat: PHASE 11 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Pembersihan FINAL semua dummy/hardcode (MUTLAK, bukan opsional)
Override eksplisit dari pengguna: setelah backend terintegrasi, HAPUS BENERAN seluruh runtime dummy, hardcoded business records, mock/fake API services, dan file khusus dummy. Jangan cukup menonaktifkan atau mengganti label. Jangan menghapus komponen real yang akan digunakan Phase 2, aset original, dokumentasi, atau migration nyata.

Cleanup per sumber
- [x] Hapus seluruh array/object peserta fiktif di runtime: nama, NIM, email, telepon, fakultas, tiket, status hadir, waktu check-in palsu.
- [x] Hapus seluruh array/object dosen fiktif di runtime: nama, kode undangan, email, WA, token, QR, dan riwayat hadir palsu.
- [x] Hapus seluruh tiket dummy dari daftar publik & admin, kuota/harga/status/jadwal palsu, local counter, fake registration success.
- [x] Hapus seluruh lineup band fiktif dan foto poster placeholder yang berpura-pura konten; band nyata hanya satu data dari CMS.
- [x] Hapus nilai tanggal acara, nama, tempat, narasi band/teaser yang hardcoded sebagai data bisnis; dekorasi statis/typography branding tetap boleh.
- [x] Hapus mock roles, akun Admin demo, Ganti Role simulasi, local auth bypass, fake password validation, mock sessions.
- [x] Hapus mock QR token, dummy PDF payload, e-ticket demo statis, browser fake download, fake scanner response, fake attendance timestamp.
- [x] Hapus fake email-success toast dan fake mail sender; ganti job queue server dan status UI yang akurat.
- [x] Hapus fake CMS save, fake photo upload, URL.createObjectURL/base64 yang dipakai sebagai penyimpanan permanen (preview lokal sementara boleh).
- [x] Hapus localStorage/sessionStorage yang menyimpan state bisnis otoritatif (peserta, tiket, undangan, checkin, CMS, role) dan logic fallback membacanya di produksi.
- [x] Hapus semua kolom/tampilan Vote pada daftar peserta dan ekspor, juga hasil voting dummy pada dashboard Phase 1.
- [x] Hapus data kandidat/pemenang palsu dari runtime produksi. File UI Future Module boleh tersimpan bila bukan dummy; semua contoh display dinonaktifkan dari jalur produksi.
- [x] Hapus mock API handler, fake delay, promise hardcoded success, Math.random() untuk data kemenangan/kehadiran/kuota, static fake JSON response, dan client-only persistence yang menggantikan DB.
- [x] Hapus sample/demo file yang digunakan runtime dari folder public//`src/data`/`src/mocks`/`fixtures` bila khusus dummy, tidak termasuk ilustrasi panggung original.
- [x] Hapus file khusus mock/dummy dengan git rm <path-yang-sudah-diverifikasi>; jangan gunakan wildcard rekursif membabi buta.
- [x] Jika folder khusus dummy menjadi kosong, hapus folder tersebut dari tree repo; jangan menyisakan mock file kosong untuk formalitas.
- [x] Perbarui semua import, exports, tests, paths, dependency graph; build tidak boleh merujuk file yang dihapus.
- [x] Hapus dead code dan dependency yang hanya dipakai dummy/mock setelah memeriksa referensi modul lain.
- [x] Hapus fallback seperti dbData ?? DEMO_DATA, catch { return mockParticipants }, if (!env) return fakeSuccess; DB/API unavailable harus menjadi error/empty state jujur, bukan data palsu.
- [x] Pastikan seed.sql, jika ada, bukan sumber fixture produksi; jika murni demo palsu dan tidak dibutuhkan local dev, hapus fisik, bukan hanya tidak dieksekusi. Test terisolasi boleh membuat data sintetis sementara yang tidak pernah dirender produksi; jangan ship demo runtime.
- [x] Jangan menghapus actual uploaded media, customer data, audit, migration, histories atau tabel production sebagai bagian dari cleanup kode.
Verifikasi tanpa dummy
- [x] Jalankan ulang rg audit seperti Batch 1; setiap hit yang tersisa wajib diklasifikasi dengan alasan (contoh DOC_EXAMPLE atau ISOLATED_TEST_FIXTURE).
- [x] Buat DUMMY-REMOVAL-REPORT.md sebagai laporan baru (boleh docs/reports/ jika struktur mendukung), memuat path dihapus, alasan, pengganti nyata, dan tes lulus; jangan edit PRD original.
- [x] Pastikan git diff --name-status benar menampilkan status D untuk setiap file khusus dummy yang diidentifikasi; klaim “dihapus” tidak sah kalau hanya tidak diimport.
- [x] Tes build bundle/route production untuk memastikan tidak ada demo role, mock data, fake image, atau stale hardcoded copy terpakai.
- [x] Jalankan aplikasi dengan Supabase staging kosong: tidak boleh muncul peserta, dosen, band, tiket, pemenang, atau kehadiran palsu; yang boleh hanya branding/ilustrasi serta empty/setup state.
- [x] Jalankan aplikasi dengan Supabase sementara unavailable: harus muncul error/resilience UI, tidak jatuh ke demo dataset.
- [x] Jalankan ulang semua E2E setelah file dummy dihapus (cleanup sebelum final QA, bukan setelah deployment).
Tambahan wajib untuk meningkatkan kualitas
- [x] Hapus seluruh UI DUMMY yang tidak menjadi bagian alur Phase 1: demo-login buttons, quick-role switcher, sample gallery/cards, mock winner UI, faux scanner/attendance preview, sample data panels, fake toasts, fake emails, dan mock action menus.
- [x] Hapus hardcoded business content dari UI produksi sekaligus script loaders: teks/angka event demo, NIM demo, personal data, status, band, event-time, kapasitas, QR static, dll. Jangan menghapus kata-kata UI normal, enum fakultas valid, atau branding/ilustrasi.
- [x] Hapus file mock-only secara fisik setelah semua referensi diganti dan tes regresi per modul lulus; tangkap git diff --name-status, git ls-files --deleted atau bukti setara.
- [x] Verifikasi route tree dan dynamic import tidak masih memanggil dummy; unbundle tree, cari demo-data dalam artifacts build bila memungkinkan.
- [x] Pastikan error DB/backend tidak otomatis diganti array sample; UI menampilkan pesan jujur dan retry.
- [x] Uji mode Supabase kosong dan tidak dapat diakses: tidak ada konten peserta/tiket/dosen/pemenang palsu. Jangan menambah fallback dummy untuk mempercantik empty state.
- [x] Bersihkan orphan test-only dummy UI routes tetapi pertahankan Phase 2 non-dummy components/asset; larangan wildcard delete folder tetap berlaku.
- [x] Buat daftar file terhapus fisik, kode business hardcode yang dibersihkan, UI dummy yang dihilangkan, dan aset non-dummy yang dipertahankan dengan bukti diff & test.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 12 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): git diff membuktikan file dummy D, setiap sisa rg diklasifikasi, build & DB-empty/unavailable PASS tanpa fallback.
- [x] Signoff: docs/reports/PHASE-12-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 13 — Security, performance, cross-check regresi, E2E & UAT
Status awal: DONE_VERIFIED
Prasyarat: PHASE 12 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Performa, caching, observability & keamanan produksi
- [x] Homepage 1 public CMS read/projection; hindari per-widget serial API waterfall; fetch band/teaser dari row yang sama.
- [x] Countdown/perubahan animasi GSAP dilakukan client tanpa fetch per detik; panggung dan media tidak diunduh ulang tiap tick.
- [x] Cache konten publik yang relatif statis + invalidasi tepat setelah Admin edit; auth, peserta, quota transaction, checkin, dan access token no-store/fresh.
- [x] Server-side pagination/filter/search untuk Data Peserta dan Dosen, gunakan field select minimal dan index sesuai query.
- [x] Gunakan loading skeleton/streaming yang masuk akal, hindari blocking halaman untuk email/PDF sampai tombol diakses.
- [x] Optimasi image ukuran sebenarnya, responsive sizes, lazy load di bawah fold; hindari memecah animasi yang bekerja.
- [x] Tambahkan batas read/write, rate limit, dan error handling sesuai risk; tidak expose PII, service key, token QR/access, Brevo creds di logs.
- [x] Pastikan environment production/staging terpisah, signed upload, CORS/CSRF sesuai default framework dan versi repo.
- [x] Dokumentasikan performa dengan pengukuran (LCP/TTFB/timing tindakan) berdasarkan tes, jangan klaim website cepat tanpa angka.
- [x] Uji serverless cron timing sesuai plan Vercel; worker retry berjalan tanpa dibutuhkan membuka dashboard.
- [x] Backup strategy dan urutan rollback migration/data dijelaskan; rollback destructive tidak otomatis dijalankan.
Checklist dari spesifikasi asal — Test plan wajib: unit, SQL, API, integrasi, E2E, dan UAT
Unit & SQL
- [x] Test validasi semua 8 fakultas, prodi bebas, NIM normalized, optional quota, jam WIB.
- [x] Test duplicate NIM, constraint email dosen aktif, XOR checkin, unique attendance, QR immutability, unique token.
- [x] Test database transaction race registrasi sisa 1 kursi, arsip/restore bersamaan, scanner concurrent.
- [x] Test privileged function EXECUTE/RLS untuk anon, staff checkin, admin, service worker.
- [x] Test email_jobs dedupe, lease expiry, bounded retry, no duplicate send dalam race yang dapat dicegah.
API / Server Actions
- [x] Test seluruh 7 Route Handlers sukses, validation errors, forbidden, rate limit, invalid token, network/DB fail, dan response envelope.
- [x] Test Server Actions unauthorized direct call (bukan cuma UI route guard) dan audit log.
- [x] Test PDF genuine bytes/QR scan, XLSX open dan sanitasi formula, upload auth & type/size.
E2E operasional
- [x] Admin login → edit nama/tanggal/lokasi → Beranda/countdown/e-ticket baru/undangan mengikuti perubahan.
- [x] Band input foto/nama/keterangan → panggung publik tampil; tidak ada manajemen urutan/multi-band.
- [x] Fashion teaser foto+teks & Awarding teaser teks → publik berubah; desain ilustrasi tetap.
- [x] Fashion/Awarding off → Coming Soon; on → konten layout aman tanpa winner palsu.
- [x] Buat tiket → Publish → Upcoming → Open otomatis → Sold Out jika penuh → Closed setelah jadwal; Archived tidak membatalkan tiket lama.
- [x] Registrasi mahasiswa beda prodi/fakultas → DB insert satu tiket → halaman sukses → e-ticket web → PDF terunduh → QR valid.
- [x] Brevo job terkirim ke inbox uji melalui worker, tanpa memblokir registrasi; resend admin tidak membatalkan pendaftaran.
- [x] Edit NIM → QR lama (termasuk PDF yang sudah disimpan) tetap scan → backend tampilkan NIM terbaru.
- [x] Arsip peserta → QR ditolak, kuota kembali; pulihkan → token lama bisa dipakai dan history hadir tetap.
- [x] Excel eksport sesuai filter tanpa vote, cell aman, NIM leading-zero aman.
- [x] Buat dosen → link permanen + QR → template berubah → surat undangan ikut berubah tanpa token regen → kirim Brevo dan share WA.
- [x] Scan QR mahasiswa/dosen → klik Hadirkan → popup centang nama yang benar → record DB & waktu WIB → scanner siap lagi.
- [x] Manual NIM/email/kode → popup sama → attendance DB; scan ulang → ALREADY_CHECKED_IN tanpa popup sukses baru.
- [x] Login petugas checkin → hanya checkin/riwayat; direct POST pada CMS/akun/participants ditolak.
- [x] Reload/new browser/perangkat lain → seluruh data tetap dan sama dengan database.
- [x] Test DB kosong dan layanan fail → tidak ada fallback dummy.
- [x] Smoke test landing GSAP intro tirai, band, runway, trophy, floating tiket, undangan amplop, navbar, responsive dan reduced-motion setelah integrasi.
Browser, production build, dan deployment
- [x] Jalankan commands test milik repo: install, lint, TypeScript check, unit/integration/E2E, next build/package script; catat output PASS/FAIL yang benar.
- [x] Test desktop, tablet, mobile; checkin kamera pada HTTPS; permission denied fallback manual.
- [x] Test staging Vercel + Supabase staging + Brevo verified sender dan dummy dataset test-only yang tidak tampil di production.
- [x] Review Chrome console/network/perf; tak ada 401 tak ditangani, 500 raw, hydration mismatch, PII leak, media 404, atau e-ticket broken.
- [x] Deploy SQL migration dan seed konfigurasi event yang benar sebelum deploy app production; jangan masukkan demo participants/tickets/dosen.
- [x] Uji production smoke dengan data sah dan akses Admin yang diotorisasi; jangan memicu bulk email real untuk uji.
Tambahan wajib untuk meningkatkan kualitas
- [x] Audit keamanan independen kedua: RLS/anon direct calls, SSR session, object storage policy, access QR token, brute-force registration, login and pdf; tidak ada secret di JS bundle.
- [x] Test operasional lengkap dari device dan browser lain: CMS edit → daftar → tiket PDF → email → scan → arsip/pulih → riwayat, tanpa fake data.
- [x] Test accessibility: keyboard dialog, focus trap check-in dan voting Phase 2 disabled, reduced motion, kontrast, loading/error/fallback.
- [x] Ukur dan catat LCP/TTFB, latensi listing peserta & checkin, jaringan 3G/4G simulasi; fokus pada bottleneck yang terbukti, bukan angka target fiktif.
- [x] Ulang seluruh tes setelah purge dummy, dan cek kembali screenshot desain panggung, band, teaser, undangan, responsive, navbar, floating tiket.
- [x] Siapkan simulasi rollback migration tanpa menjalankan destructive rollback di prod, backup strategy, job queue backlog monitoring, cron runtime.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 13 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): E2E production-like, security & perf measured, responsive/GSAP regression, failed tests resolved and rerun PASS.
- [x] Signoff: docs/reports/PHASE-13-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
PHASE 14 — Staging, readiness, release gate final & handoff
Status awal: DONE_VERIFIED
Prasyarat: PHASE 13 telah memenuhi gate, atau pekerjaan paralel yang aman didokumentasikan tanpa melewati dependensi.
Checklist dari spesifikasi asal — Handoff akhir, laporan, dan gate keputusan
Laporan wajib coding agent
- [x] Buat BACKEND-IMPLEMENTATION-REPORT.md baru (di root atau docs/reports/) tanpa mengubah dokumen original.
- [x] Cantumkan: modul implementasi, routes actual, Actions/services, nama migration dan status applied, tabel, RLS, Storage policies, env keys (NAMA SAJA), Brevo cron, repo changes, data real vs test.
- [x] Sertakan mapping 1:1 halaman → field/tombol → handler/action → tabel; tandai tiap item SUPPORTED, PENDING_INTEGRATION, atau FUTURE_MODULE.
- [x] Sertakan laporan file dummy yang benar-benar dihapus, bukan hanya tidak digunakan; tampilkan Git deleted file list dan rg cleanup evidence.
- [x] Sertakan bukti tes dan hasil aktual, termasuk token QR berubah/tidak saat NIM edit, race kuota, duplicate checkin, dan email worker.
- [x] Daftar blocker/limit yang masih tersisa (mis. ENV Brevo belum diberikan, migration production belum disetujui, perangkat kamera tidak tersedia) secara eksplisit; jangan klaim DONE jika terblokir.
- [x] Sertakan arahan pengisian data event awal dan provisioning Admin tanpa mengarang NIM/email orang nyata.
Definition of Done global — SEMUA WAJIB LULUS
- [x] Semua fitur Backend Phase 1 berfungsi dengan Supabase sungguhan dan UI existing; bukan hanya schema/API selesai.
- [x] Semua 8 tabel beserta migration, constraints, RLS, index, transaksi kritis terverifikasi di staging.
- [x] Semua 7 Route Handlers dan Server Actions benar-benar diakses UI sesuai kebutuhan.
- [x] Brevo queue + worker menghasilkan email nyata ke inbox testing dan retry bisa diverifikasi.
- [x] Storage unggah 10 MB + kompres berfungsi dengan validasi dan alpha preserve.
- [x] E-ticket web/PDF/QR valid; NIM edit tidak mengubah QR/nomor tiket.
- [x] Checkin QR/manual idempotent dan popup sukses menyebut nama sesuai record nyata.
- [x] CMS Beranda, Band tunggal, teaser, ticket, peserta, undangan, akun, dashboard, halaman Coming Soon terintegrasi.
- [x] Tidak ada data/code hardcoded dummy/mock/fake di runtime production.
- [x] Semua file khusus dummy telah DIHAPUS SECARA FISIK dari repository, tercatat dalam Git dan laporan; tak ada import/dependency tersisa.
- [x] Phase 2 Voting dan kelola pemenang tidak dibangun dan tidak menampilkan data palsu; UI asli non-dummy tetap aman untuk kelanjutan.
- [x] Tidak ada kebocoran secret/PII, role bypass, fake success, payment, maupun API berlebihan.
- [x] E2E seluruh alur, browser responsive, build/typecheck/lint/tests dan deployment staging PASS; bila tidak, status tetap BLOCKED/PENDING.
Tambahan wajib untuk meningkatkan kualitas
- [x] Audit dry-run migrasi production, diff schema staging-vs-production, backup dan rencana rollback yang direview; jangan deploy migrasi destruktif tanpa persetujuan.
- [x] Buat RELEASE-READINESS-REPORT.md berisi tabel kontrol kondisi build, lint, typecheck, SQL migrations, RLS, API, E2E, Brevo sandbox, camera device, storage, performance, role access, no-dummy.
- [x] Pastikan seluruh env production tersedia di hosting secara aman; jika belum, status RELEASE tetap BLOCKED (bukan DONE_VERIFIED).
- [x] Jalankan smoke production berizin dan aman setelah deploy: hanya data sah; jangan blast email/akun dosen nyata tanpa izin.
- [x] Lakukan pengecekan ulang kedua yang menyeluruh terhadap semua gate Phase 0–13, bukan hanya phase terakhir.
- [x] Serahkan laporan akhir BACKEND-IMPLEMENTATION-REPORT.md, DUMMY-REMOVAL-REPORT.md, RELEASE-READINESS-REPORT.md, dan daftar blocker sebenar-benarnya.
Gate verifikasi ulang — semua harus PASS sebelum PHASE ini bisa ditandai selesai
- [x] Pass 1: seluruh checklist PHASE 14 benar-benar diimplementasikan dan diuji, bukti path/commit/DB/UI dicatat.
- [x] Pass 2 (cross-check terpisah): Semua phase gate telah diverifikasi ulang; staging/prod readiness/backup/env/status & laporan lengkap dengan bukti PASS.
- [x] Signoff: docs/reports/PHASE-14-EVIDENCE.md (atau lokasi laporan existing) dibuat, issue/blocker dicatat, reviewer memverifikasi; status boleh DONE_VERIFIED hanya setelah kedua pass berhasil.
LAMPIRAN A — Data flow halaman ke sumber produksi
Layar/aksi	Sumber nyata Phase 1	Dihapus dari runtime
Home hero & countdown	event_settings.event_start_at, CMS	Tanggal/lokasi contoh hardcoded
Band spotlight	event_settings.band_*, Storage	Multi-lineup array + urutan mock
Fashion teaser	event_settings.fashion_*, Storage	Teks/foto model bisnis statis
Awarding teaser	event_settings.awarding_*	Judul/deskripsi statis, bukan ilustrasi piala
/fashion-show, /awarding	*_page_visible	Pemenang fiktif & mock winners
Ticket list & admin	ticket_types, count active participants	Fake tickets/kuota/status
Registration	SQL RPC + participants	Fake registrar/mock local store
Ticket success/web/PDF	participants + event_settings + token	Fake QR/PDF dan demo ticket
Data Peserta	participants, checkins	Fake participants + Vote column
Lecturer template/list	event_settings, lecturer_invitations	Fake dosen/personal link/template hardcode
QR scanner & manual	checkins transaction, participant/lecturer	Simulated scan & fake checkin
Account admin	Supabase Auth, staff_profiles	Demo login/role-switch fake
Email	email_jobs, Brevo	setTimeout/fake success
Dashboard	DB aggregates	Hardcoded numeric counters


LAMPIRB — Larangan saat cleanup dan deployment
1. Tidak boleh menambahkan DEMO_MODE, USE_MOCK_DATA, fallbackMock, atau catch → fakeSuccess pada build production.
2. Tidak boleh mempertahankan file dummy khusus sekadar diberi suffix .bak, .old, _unused, komentar, atau memindahkannya ke folder lain. File dummy khusus harus hilang dari git tree.
3. Tidak boleh menghapus seluruh src/, public/, docs/, supabase/migrations/ atau branch, sebab banyak file adalah aset/implementasi nyata.
4. Tidak boleh menghapus semua konten hanya karena Admin belum memasukkan data. Gunakan empty/loading/error states jujur; ilustrasi panggung/ikon/font/GSAP bukan hardcode bisnis.
5. Tidak boleh menghapus fungsionalitas Phase 2 non-dummy hanya karena belum dibangun backend; aksesnya boleh disabled/Coming Soon, dan data palsunya harus hilang.
6. Tidak boleh menjalankan mass delete terhadap Supabase produksi untuk “menghapus dummy”. Data seed fiktif harus diidentifikasi dan dibersihkan terpisah dengan review serta jejak audit.
7. Tidak boleh menganggap todo selesai saat UI saja tampak bekerja; DB/persistence, permissions, migrations, checkin, PDF dan email harus benar-benar teruji.
8. Tidak boleh menghapus struktur asli dokumen PRD/Design System, cukup tambahkan laporan implementasi/cleanup baru.
RINGKASAN FINAL: Kerjakan backend MEMORIA Phase 1 secara lengkap, integrasikan setiap fitur sampai frontend memakai Supabase/Brevo/Storage nyata, lalu hapus sungguhan semua dummy/hardcode bisnis, seluruh file khusus mock, fake API, fake role, dan fallback data palsu. Jangan menyentuh backend Voting/Pemenang Phase 2; jaga seluruh visual premium MEMORIA, route, aset asli, dan data production. Setiap checkbox hanya boleh dicentang setelah bukti tes.
LAMPIRAN C — Acceptance matrix lintas fitur (diisi setelah diuji, jangan centang di muka)
Alur	Bukti wajib	Phase pemilik	Status
Login panitia/role	Akses nyata, guest/Staff ditolak	2	DONE_VERIFIED
Edit konten Beranda	DB save → browser lain → countdown benar	4	DONE_VERIFIED
Band satu foto/nama/keterangan	Media Storage & update satu entri	3–4	DONE_VERIFIED
Teaser Fashion/Awarding	Copy dari Admin, tanpa hardcode	4	DONE_VERIFIED
Page visibility	Tampilkan/Coming Soon, tidak ada winner dummy	4	DONE_VERIFIED
Tipe tiket	Auto waktu, quota penuh, archive valid	5	DONE_VERIFIED
Registrasi umum Telkom	8 fakultas, prodi bebas, NIM wajib	6	DONE_VERIFIED
E-ticket & PDF QR	PDF dari DB; scan setelah NIM edit	6	DONE_VERIFIED
Email	Job + cron + Brevo ke test inbox	7	DONE_VERIFIED
Data peserta/arsip/restore	2 tahap, token tetap, kuota tepat	8	DONE_VERIFIED
Undangan dosen	Link personal stabil, QR & email	9	DONE_VERIFIED
Check-in kamera/manual	Popup nama benar & duplikat aman	10	DONE_VERIFIED
Dashboard & Excel	Aggregates & XLSX nyata	8, 11	DONE_VERIFIED
Dummy purge	Semua UI dummy/hardcode bisnis hilang, file dummy terhapus fisik	12	DONE_VERIFIED
Performance/Security/UAT	Pengukuran, RLS, API, E2E, responsivitas	13	DONE_VERIFIED
Handoff production	Backup, migration review, reports, final cross-check	14	DONE_VERIFIED


LAMPIRAN D — Definition of Done GLOBAL (tidak boleh dilewati)
- [x] Seluruh PHASE 0–14 berstatus DONE_VERIFIED berdasarkan dua kali verifikasi nyata dan bukti pengujian; bila belum, status tetap pending/blocked.
- [x] Delapan tabel (7 domain + email_jobs), 7 Route Handlers, Server Actions, RLS, constraints, migrations dan worker bekerja pada staging.
- [x] Semua halaman dan tombol Phase 1 menggunakan Supabase/Auth/Storage/Brevo riil, tidak lagi fake response atau browser-local authority.
- [x] Seluruh UI dummy yang tidak relevan dihilangkan; hardcoded business data di komponen produksi sudah diganti query DB; file dummy-only dihapus fisik dari repository.
- [x] Tidak ada fallback dummy saat DB kosong/error, tetapi branding/ilustrasi/desain asli tetap utuh.
- [x] Fitur Phase 2 tidak dijalankan di produksi dan tidak menggunakan data pemenang/kandidat palsu; komponen desain asli yang berguna tetap terjaga.
- [x] QR/PDF tetap valid setelah NIM edit; registrasi kuota atomik; check-in tidak ganda; email worker async.
- [x] E2E termasuk dua browser, mobile scanner, Supabase kosong/unavailable, pengujian akses role dan performance PASS; fail/blocked ditulis jujur.
- [x] Reviewer menilai ulang hasil setelah cleanup, hasil migration dan status rilis; jangan mengklaim production-ready bila gate gagal.
PERINTAH UNTUK CODING AGENT: Gunakan dokumen ini sebagai eksekusi berurutan, bukan laporan status. Jangan ubah checkbox hanya karena kode telah ditulis; implementasikan, integrasikan ke UI nyata, periksa ketat dua kali, dan buktikan. Setiap dummy business UI/kode/file wajib dihapus sungguhan dengan aman. Jangan hapus file/folder non-dummy yang sudah ada.