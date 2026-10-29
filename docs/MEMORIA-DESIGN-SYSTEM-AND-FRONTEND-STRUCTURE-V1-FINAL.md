# MEMORIA — DESIGN SYSTEM & FRONTEND STRUCTURE BLUEPRINT

> **Versi:** 1.0 — Visual Baseline (28 Oktober 2026)  
> **Status:** Baseline desain berdasarkan pembahasan yang telah disepakati; bukan source code aplikasi, bukan PRD Backend  
> **Produk:** MEMORIA — Diesnatalis SIKC 2026, tema acara **Velvet Night / A Night to Remember**  
> **Pendamping:** `MEMORIA-PRD-FRONTEND-V1-FINAL-BASELINE.md`  
> **Bahasa UI:** Bahasa Indonesia (dengan copy pendek bahasa Inggris sebagai aksen editorial, bila disetujui panitia)  
> **Zona waktu:** Asia/Jakarta (WIB)  
> **Framework rencana:** Next.js App Router + React + TypeScript + Tailwind CSS  
> **Target:** Website publik yang teatrikal dan kaya animasi, tetapi dashboard panitia dan proses operasional tetap minimal, cepat, dan mudah digunakan.

---

## DAFTAR ISI

1. [Tujuan, sumber acuan, dan aturan pengambilan keputusan](#1-tujuan-sumber-acuan-dan-aturan-pengambilan-keputusan)
2. [Design DNA dan pembagian dua dunia visual](#2-design-dna-dan-pembagian-dua-dunia-visual)
3. [Palet warna lengkap dan penggunaan](#3-palet-warna-lengkap-dan-penggunaan)
4. [Typography dan hierarki teks](#4-typography-dan-hierarki-teks)
5. [Spacing, layout, bentuk, bayangan, dan layering](#5-spacing-layout-bentuk-bayangan-dan-layering)
6. [Ikon, ornamen, dan bahasa ilustrasi](#6-ikon-ornamen-dan-bahasa-ilustrasi)
7. [Asset specification dan panduan produksi aset](#7-asset-specification-dan-panduan-produksi-aset)
8. [Motion system global dan aturan GSAP](#8-motion-system-global-dan-aturan-gsap)
9. [Opening theatre: panggung, tirai, dan hero](#9-opening-theatre-panggung-tirai-dan-hero)
10. [Navbar, footer, floating tiket, dan navigasi publik](#10-navbar-footer-floating-tiket-dan-navigasi-publik)
11. [Desain halaman Beranda dan Band Showcase](#11-desain-halaman-beranda-dan-band-showcase)
12. [Desain halaman Fashion Show dan Awarding](#12-desain-halaman-fashion-show-dan-awarding)
13. [Desain pemilihan tiket, formulir, dan halaman sukses](#13-desain-pemilihan-tiket-formulir-dan-halaman-sukses)
14. [Desain Private Voting — Spotlight Rotating Stage](#14-desain-private-voting--spotlight-rotating-stage)
15. [Desain Undangan Dosen — Interactive Velvet Envelope](#15-desain-undangan-dosen--interactive-velvet-envelope)
16. [Design system Admin & Petugas — Clean Minimal](#16-design-system-admin--petugas--clean-minimal)
17. [Rincian UI delapan menu Admin Panitia](#17-rincian-ui-delapan-menu-admin-panitia)
18. [Komponen UI reusable dan state](#18-komponen-ui-reusable-dan-state)
19. [Responsive, mobile, accessibility, dan performance](#19-responsive-mobile-accessibility-dan-performance)
20. [Sitemap, route contract, dan layout boundaries](#20-sitemap-route-contract-dan-layout-boundaries)
21. [Struktur folder Next.js lengkap](#21-struktur-folder-nextjs-lengkap)
22. [Tanggung jawab file, data layer, dan mock mode](#22-tanggung-jawab-file-data-layer-dan-mock-mode)
23. [Contoh design tokens dan konfigurasi awal](#23-contoh-design-tokens-dan-konfigurasi-awal)
24. [Aturan interaksi serta invariant bisnis lintas halaman](#24-aturan-interaksi-serta-invariant-bisnis-lintas-halaman)
25. [QA visual, animasi, responsivitas, dan handoff](#25-qa-visual-animasi-responsivitas-dan-handoff)
26. [Urutan implementasi frontend dan definition of done](#26-urutan-implementasi-frontend-dan-definition-of-done)
27. [Checklist aset, risiko, dan keputusan yang belum dibekukan](#27-checklist-aset-risiko-dan-keputusan-yang-belum-dibekukan)
28. [Referensi dan catatan implementasi](#28-referensi-dan-catatan-implementasi)

---

## 1. Tujuan, sumber acuan, dan aturan pengambilan keputusan

### 1.1 Tujuan dokumen

Dokumen ini mendefinisikan **bagaimana semua halaman MEMORIA terlihat, bergerak, berperilaku, dan dipecah ke komponen/kode frontend**. PRD Frontend sebelumnya tetap menjadi rujukan tentang fitur dan aturan bisnis. Dokumen ini bukan perintah memulai coding; ia adalah spesifikasi visual-teknis yang dapat dipakai saat implementasi dimulai.

### 1.2 Basis sumber

| Sumber | Bagian penting yang diambil | Batasan |
|---|---|---|
| `Konsep Diesnatalis.pdf`, halaman 1–2 | Velvet Night; diesnatalis SIKC; red velvet curtain; suasana elegan, hangat, memorable; merah-hitam-gold; chandelier, frame, red carpet, photo area | **Referensi arah seni**, bukan semua elemen wajib dipasang di setiap halaman |
| `Konsep Diesnatalis.pdf`, halaman 5–8 | Atmosfer venue, lampu hangat, gallery, photo experience, urutan acara | Dipakai sebagai inspirasi visual, bukan menambah fitur website otomatis |
| `Tupoksi Diesnatalis.pdf`, halaman 1–3, 8 | Layout tirai dan film-strip, tipografi kaligrafi, marquee/cinema; pengelolaan identitas visual dan website undangan/check-in oleh PDD | Bukan spesifikasi API atau sistem baru |
| Tiga foto referensi panggung yang diberikan pengguna | Proscenium melengkung, marquee bulbs, red velvet, panggung bertingkat, spotlight, drapery samping | Gambar referensi ber-watermark; **jangan dipakai sebagai aset produksi** |
| PRD Frontend MEMORIA v1 | Role, rute, identitas tiket, voting, undangan, check-in, arsip, validasi, mock | Sumber otoritatif business flow; desain tidak boleh mengubahnya |
| Keputusan brainstorming setelah PRD | Ballet untuk logo, GSAP, Phosphor + custom SVG, voting panggung foto transparan, amplop klik-buka, admin polos | Menjadi tambahan desain yang melengkapi PRD lama |

### 1.3 Urutan prioritas jika muncul konflik

1. Keputusan pengguna yang secara eksplisit sudah **ACC/LOCKED** dalam percakapan terkini.
2. PRD Frontend MEMORIA untuk aturan dan cakupan sistem.
3. Dokumen ini untuk keputusan desain, animasi, dan pemetaan folder.
4. Asumsi implementasi yang disebut **USULAN**, boleh disesuaikan melalui review tanpa diam-diam mengubah kebijakan bisnis.

**Prinsip penting:** visual pemenang boleh megah tetapi pemenang tetap **ditetapkan manual**. Visual voting boleh teatrikal tetapi voting tetap hanya **1 suara per kategori**; visual check-in boleh modern tetapi tidak boleh menambah penutupan check-in.

### 1.4 Lingkup implementasi

- **Termasuk:** seluruh UI publik, halaman undangan/voting, halaman admin/petugas, komponen, tipografi, warna, ornamen, animasi, responsive, accessibility, dan rancangan mock data.
- **Tidak termasuk saat frontend-only:** database produksi, pengiriman email nyata, API server, verifikasi password nyata, penyimpanan data permanen lintas device, check-in QR nyata ke database, workflow deployment backend.
- **Pemodelan interaksi FE:** cukup dapat mensimulasikan success/error, status tiket, penghitungan kuota, voting, arsip/pemulihan, check-in, dan role menggunakan mock adapter tanpa mengklaim tersimpan di server.

---

## 2. Design DNA dan pembagian dua dunia visual

### 2.1 Brand statement

**MEMORIA — Velvet Cinematic Experience**: pengalaman memasuki pertunjukan malam yang istimewa, menelusuri momen bersama, memilih favorit di atas panggung spotlight, dan menerima undangan kehormatan dalam amplop bersegel.

Kata kunci: **cinematic • theatrical • elegant • warm • vintage-premiere • celebratory • modern interaction**.

### 2.2 Komposisi referensi

- **80%** luxury cinema / vintage theatre: panggung, beludru, lampu marquee, spotlight, film strip, gold ornament.
- **20%** vintage carnival accents: bentuk panggung melengkung, lampu perimeter, ritme dekoratif; **bukan** palet sirkus merah-putih yang mendominasi.
- Hindari kesan neon-futuristik, gradient biru-ungu, kartun flat serba warna, atau glitter tanpa tujuan.

### 2.3 Dua dunia antarmuka

| Konteks | Desain | Animasi | Tujuan |
|---|---|---|---|
| Beranda/Fashion Show/Awarding | **Velvet Cinematic Theatre** | Tinggi, koreografi terukur | Emosi, identitas, storytelling |
| Voting private | **Spotlight Rotating Stage** | Tinggi namun pemilihan jelas | Pengalaman spesial + keputusan adil |
| Undangan dosen | **Interactive Velvet Envelope** | Tinggi di pembuka, tenang saat membaca | Formal, memorable, QR mudah ditemukan |
| Pilih tiket | **Vintage Cinema Ticket** | Sedang | Memilih jenis tiket dengan cepat |
| Form pendaftaran/sukses | **Clean Ivory Registration** | Rendah | Kecepatan, keterbacaan, validasi |
| Dashboard Admin/Petugas | **Clean Minimal Dashboard** | Minimal | Produktivitas, tabel dan kontrol cepat |

### 2.4 Hal yang dilarang pada visual

- Tidak ada intro tirai pada **setiap halaman**; opening eksklusif di beranda.
- Tidak memasang lampu, chandelier, panggung, tirai, atau ornament 3D pada setiap panel admin.
- Tidak membuat QR code bergerak, blur, berwarna kompleks, atau tertutup ilustrasi.
- Tidak mengganti isi data dengan teks statis/hardcode; panitia mengelola konten publik.
- Tidak memakai efek visual sukses untuk tindakan yang belum dikonfirmasi sistem.

---

## 3. Palet warna lengkap dan penggunaan

### 3.1 Palet merek publik — disepakati

| Token | Nama | HEX | Peruntukan |
|---|---|---|---|
| `brand.primary` | Velvet Burgundy | `#891523` | Tombol utama, aksen stage, headline terbatas |
| `brand.secondary` | Antique Gold | `#D6B46A` | Marquee, garis ornament, ikon dekoratif, border |
| `brand.background` | Midnight Black | `#140809` | Backdrop panggung, section dramatis |
| `brand.surfaceDark` | Dark Wine | `#350A10` | Permukaan gelap, panel voting, panggung belakang |
| `brand.stageRed` | Stage Red | `#B52735` | Highlight lipatan tirai/cahaya |
| `brand.ivory` | Warm Ivory | `#F5E9D3` | Body text gelap, kertas undangan, surface ringan |
| `brand.champagne` | Champagne | `#EACFA4` | Background kartu undangan dan label terang |
| `brand.copper` | Copper | `#B87545` | Trim vintage, bayangan material logam |
| `brand.rose` | Dusty Rose | `#A98A8F` | Teks sekunder pada background sangat gelap |
| `brand.softWhite` | Soft White | `#FFF9F0` | Kartu form, teks terang, dokumen |
| `brand.plum` | Deep Plum | `#24131B` | Background sekunder / overlay |

### 3.2 Palet admin — sederhana

| Token | HEX | Fungsi |
|---|---|---|
| `admin.canvas` | `#F8F9FB` | Background workspace |
| `admin.surface` | `#FFFFFF` | Sidebar, kartu, modal, tabel |
| `admin.text` | `#252932` | Teks utama |
| `admin.textMuted` | `#6B7280` | Teks bantuan |
| `admin.border` | `#E5E7EB` | Border dan separator |
| `admin.accent` | `#891523` | Tombol utama, tab/sidebar aktif |
| `admin.accentTint` | `#FAEDEF` | Hover/selected background burgundy lembut (**token pelengkap usulan**) |
| `admin.focus` | `#891523` | Focus ring yang jelas |

### 3.3 Semantic colors

| Semantik | HEX | Copy contoh | Catatan |
|---|---|---|---|
| Success | `#2E8B67` | `Check-in berhasil` | Ikon + teks, bukan warna saja |
| Warning | `#C58C32` | `Pendaftaran hampir ditutup` | Gunakan teks gelap pada latar warning terang |
| Error | `#C94E57` | `QR tidak valid` | Tidak menggantikan penjelasan error |
| Information | `#497FA6` | `Voting terjadwal` | Warna fungsional, bukan dekorasi situs |
| Disabled | `#9CA3AF` | Tombol tidak aktif | Contrast dan state jelas |

### 3.4 Aturan kombinasi dan aksesibilitas

| Latar | Teks utama | Teks bantuan | Aksen |
|---|---|---|---|
| Midnight Black | `#F5E9D3` | `#A98A8F` | Gold |
| Dark Wine | `#FFF9F0` | `#EACFA4` | Gold |
| Burgundy | `#FFF9F0` | `#F5E9D3` | Outline Gold |
| Ivory/Champagne | `#350A10` | `#6B4545` (pelengkap) | Burgundy |
| Admin White | `#252932` | `#6B7280` | Burgundy |

- **Jangan** memakai `#D6B46A` sebagai teks kecil di atas `#F5E9D3` (kontras tidak memadai).
- Kontras pasangan penting yang telah dihitung sebagai panduan: Warm Ivory di atas Burgundy ≈ **7,96:1**, Gold di atas Midnight ≈ **9,92:1**, sedangkan Gold di atas Ivory ≈ **1,65:1**. Uji ulang kombinasi aktual di UI.
- Gold dipakai untuk aksen selektif, bukan semua paragraf, tabel, atau form.
- Prinsip kasar komposisi beranda: **50%** gelap, **25%** burgundy, **15%** ivory/champagne, **10%** gold/aksen; ini panduan, bukan angka wajib.

### 3.5 State warna sesuai konteks

- Voting terpilih: border Antique Gold 2–3px **plus** checkmark dan teks `Dipilih`.
- Winner Draft: badge netral, tidak tampil publik.
- Winner Published: badge success di dashboard; di publik tampil kartu glamor tanpa badge admin.
- Hadir: ikon centang + `Hadir`; Belum Check-in: label netral `Belum Check-in`.
- Arsip: badge abu-abu `Diarsipkan` + larangan QR/voting baru, bukan sekadar opacity.

---

## 4. Typography dan hierarki teks

### 4.1 Tiga peran font

| Role | Font | Area | Aturan |
|---|---|---|---|
| **Brand logotype** | **Ballet (optical size 24pt / Ballet 24pt)** | Kata `MEMORIA`, komposisi logo, signature display | Dipakai besar saja; jangan untuk teks operasional |
| **Editorial heading** | **Bodoni Moda** | Judul hero pendamping, judul section, Fashion Show, Awarding | Serif high-contrast; tetap responsif |
| **Interface/body** | **DM Sans** | Navbar, form, tiket, voting labels, undangan isi, dashboard, check-in | Prioritas keterbacaan |

**Jejak sumber:** `Tupoksi Diesnatalis.pdf` memuat font tertanam bernama `Ballet24pt-Regular`; ini menguatkan keputusan pengguna untuk tulisan MEMORIA mengikuti gaya judul script pada presentasi. **Font yang tertanam di PDF tidak boleh diekstrak atau didistribusikan ulang**; gunakan sumber font resmi dan lisensi sesuai kebijakan proyek.

### 4.2 Typographic scale (usulan implementasi)

| Token | Desktop | Mobile | Font/Weight | Use |
|---|---:|---:|---|---|
| `type.brandHero` | 88–144 px | 54–84 px | Ballet | MEMORIA hero, batasi overflow loop |
| `type.sectionXL` | 64–80 px | 40–48 px | Bodoni Moda | Fashion/Awarding intro |
| `type.h1` | 48–64 px | 32–40 px | Bodoni Moda | Judul halaman publik |
| `type.h2` | 36–48 px | 26–32 px | Bodoni Moda | Section band/kategori |
| `type.h3` | 24–32 px | 20–24 px | Bodoni/DM Sans | Kartu publik |
| `type.bodyLarge` | 18 px | 16–18 px | DM Sans | Lead deskripsi |
| `type.body` | 16 px | 16 px | DM Sans | Isi utama form/undangan |
| `type.bodySmall` | 14 px | 14 px | DM Sans | Field/help/metadata |
| `type.caption` | 12 px | 12 px | DM Sans | Caption decorative only |
| `type.adminH1` | 26–30 px | 22–26 px | DM Sans Semibold | Judul admin |
| `type.adminBody` | 14–16 px | 14–16 px | DM Sans | Dashboard dan tabel |

### 4.3 Aturan penggunaan font

- Label, NIM, kode tiket, nomor telepon, email, tanggal, dan QR caption **selalu DM Sans**.
- Brand Ballet: sediakan fallback teks biasa jika font belum dimuat; pastikan kerning huruf pada `MEMORIA` tidak saling mengganggu di mobile.
- Jangan memakai Ballet untuk seluruh kata tombol, navbar, body, atau isi undangan.
- Judul dekoratif tetap punya heading semantik (`h1`/`h2`), terlepas dari bentuk visual.
- Font disajikan melalui `next/font/google` (atau legal local font jika dibutuhkan), dengan `display: swap` dan fallback.
- Keterangan foto dan CTA boleh memakai sedikit uppercase/letter spacing, tetapi jangan menambah jarak huruf berlebihan pada paragraf.
- Angka countdown gunakan DM Sans dengan `font-variant-numeric: tabular-nums` agar tidak bergeser saat detik berubah.

### 4.4 Copywriting visual

- Branding: `MEMORIA` / `A Night to Remember` / `Velvet Night` / `Diesnatalis SIKC 2026`.
- Teks fungsi **Bahasa Indonesia**: `Daftar Gratis`, `Pilih Kandidat`, `Konfirmasi Suara`, `Buka Undangan`, `Lihat QR Undangan`, `Hadirkan`, `Kirim Email`.
- Teks editorial Inggris opsional di label kecil: `The Runway`, `The Golden Moment`, `Choose Your Experience`, `The Spotlight Stage`.
- Nama, tanggal, waktu, lokasi, deskripsi acara, nama band, dan kategori winner **berasal dari data panitia**, bukan hardcode.

---

## 5. Spacing, layout, bentuk, bayangan, dan layering

### 5.1 Layout fundamentals

- Base spacing 4px: gunakan kelipatan 4 atau 8 untuk sebagian besar grid.
- Container publik maksimum **1200–1280px**, gutter desktop **32–48px**, tablet **24px**, mobile **16–20px**.
- Jarak section publik **96–160px desktop**, **64–96px tablet**, **48–72px mobile** (sesuaikan komposisi).
- Dashboard container full width adaptif, padding **24–32px desktop**, **16px mobile**; jangan mengorbankan tabel demi ruang dekoratif.
- Grid publik: editorial 12-column desktop (atau CSS grid yang setara); 2 column tablet; 1 column mobile.
- Grid tiket/kandidat: 3/2 kolom jika tersedia ruang; 1 kolom untuk layout mobile sempit; showcase kandidat stage selalu punya **satu fokus utama**.

### 5.2 Radius, border, shadow

| Token | Nilai usulan | Pemakaian |
|---|---|---|
| `radius.field` | 8px | Form input |
| `radius.button` | 10–12px | Button admin, form |
| `radius.card` | 16px | Ticket card, admin card |
| `radius.panel` | 20–24px | Panel besar, envelope paper |
| `radius.pill` | 9999px | Floating tiket, filter badge |
| `border.admin` | 1px solid `#E5E7EB` | Tabel, form, modal |
| `border.premium` | 1–2px `#D6B46A` | Ornament/frame publik |
| `shadow.admin` | rendah | Kartu tabel/form |
| `shadow.stage` | layer glow & vignette lembut | Panggung dan poster |

### 5.3 z-index dan posisi fixed

| Layer | Indikator / z-index rekomendasi |
|---|---|
| Base content | 0–10 |
| Stage rear / spotlight | 10–20 |
| Candidate / theatre content | 20–30 |
| Curtains / stage foreground | 30–40 |
| Navbar | 50 |
| Floating ticket | 60 |
| Menu mobile / sheet | 70 |
| Dialog / modal | 90 |
| Toast | 100 |
| Curtain intro overlay sementara | 110, lalu pointer events dinonaktifkan / layer unmounted |

Gunakan token z-index bernama, bukan angka acak di banyak komponen. Elemen `fixed` floating tiket **di luar** wrapper yang sedang dianimasikan `transform` untuk menghindari posisi fixed menjadi keliru.

### 5.4 Surface material

- Velvet: tekstur kain ringan dengan lipatan realistis, bukan gradient merah polos saja.
- Antique gold: gradient halus untuk ornament **non-teks**, hindari metal chrome berlebihan.
- Paper invitation: ivory hangat + serat kertas tipis, tidak mengurangi kontras.
- Admin surface: putih, border netral, shadow minimal; **tanpa bahan velvet di belakang tabel**.

---

## 6. Ikon, ornamen, dan bahasa ilustrasi

### 6.1 Sistem ikon

- **Phosphor Icons** dipakai untuk ikon fungsi: menu, pengguna, ticket, download, mail, QR scanner, vote, lock, archive, edit.
- Varian rekomendasi: `regular` untuk dashboard; `duotone` untuk highlight halus pada publik; konsisten ukuran.
- Icon sizes: 16px dense table; 18–20px button; 24px nav/feature; 32–48px ilustrasi status (bukan sebagai ikon navbar).
- **Custom Animated SVG** untuk elemen identitas: tiket berlubang (perforation), miniature theatre arch, spotlight, marquee bulb, gold seal, film reel, curtain tassel, luxury envelope, golden star.
- Ikon harus punya bounding box dan stroke yang konsisten, tetap jelas di mobile, serta tidak bergantung pada warna saja.

### 6.2 Motion untuk ikon

| Ikon | Keadaan idle | Hover/aktivasi | Selesai |
|---|---|---|---|
| Floating Ticket | Diam; aksen cahaya sangat jarang | Lift 3–4px, shine gold | Navigasi ke pilih tiket |
| Film Reel | Diam | Rotasi singkat | Tetap diam |
| Spotlight | Glow rendah | Cone bergeser ringan | Kembali normal |
| Golden Star | Diam | Rotate 8–15° | Kembali normal |
| Envelope Seal | Diam | Pulse pendek saat `Buka Undangan` | Segel hilang sewaktu amplop dibuka |
| QR Scanner | Fokus border scanner | Scan line singkat | Success/Error yang jelas |
| Admin Icon | Diam | Tint/hover minimal | Diam |

Animasi ikon fungsional tidak boleh berjalan terus bila tidak memberikan feedback; pilih `hover`, `focus`, `click`, atau *in view*.

### 6.3 Ornament policy

- Tirai, frame art-deco, lampu marquee = **besar**, maksimal satu focal system per section.
- Foto band / kandidat / pemenang adalah **konten utama**; dekorasi harus membantu framing, bukan menutup wajah atau tulisan.
- Carnival vector (ferris wheel, topeng, motif sirkus) boleh jadi aksen kecil di area memori/galeri; **jangan** membuat wajah/topeng kartun menjadi fokus UI voting.
- Tidak perlu ilustrasi kartun pada admin.

---

## 7. Asset specification dan panduan produksi aset

### 7.1 Asset inventory prioritas

| ID | File usulan | Format | Tujuan |
|---|---|---|---|
| ST-01 | `theatre-arch.svg` | SVG | Bingkai panggung melengkung |
| ST-02 | `curtain-left.webp` | WebP transparan | Tirai kiri |
| ST-03 | `curtain-right.webp` | WebP transparan | Tirai kanan |
| ST-04 | `curtain-back.webp` | WebP/JPEG | Tirai latar |
| ST-05 | `stage-platform.webp` | WebP transparan | Podium/panggung bertingkat |
| ST-06 | `marquee-bulb.svg` | SVG | Lampu theater marquee |
| ST-07 | `spotlight-cone.svg` | SVG/gradient layer | Sorot lampu atas |
| ST-08 | `stage-shadow.webp` | WebP transparan | Bayangan panggung/kandidat |
| ST-09 | `theatre-grain.webp` | WebP kecil tile | Film/velvet texture opsional |
| CI-01 | `film-strip.svg` | SVG | Bingkai galeri band |
| CI-02 | `ornament-gold-corner.svg` | SVG | Frame award/undangan |
| CI-03 | `winner-star.svg` | SVG | Animasi pemenang |
| TK-01 | `ticket-perforation.svg` | SVG | Tiket pilihan / PDF |
| EN-01 | `envelope-front.svg` | SVG | Depan amplop undangan |
| EN-02 | `envelope-flap.svg` | SVG | Tutup amplop yang bisa dibuka |
| EN-03 | `wax-seal.svg` | SVG | Segel gold |
| EN-04 | `invitation-paper.svg` | SVG / CSS | Kertas undangan |
| VC-01 | `candidate-placeholder.webp` | WebP transparan | Placeholder preview kandidat |
| UI-01 | `empty-state.svg` | SVG | Empty dashboard |

**Catatan:** nama-nama file adalah **usulan produksi**, bukan file yang sudah dibuat. Aset final harus dibuat/diadakan terpisah.

### 7.2 Asset foto kandidat voting — **keputusan pengguna**

- Admin mengunggah foto kandidat dengan **background transparan**, idealnya **full body / minimal lutut sampai kepala** untuk bisa terlihat berdiri di atas stage.
- **Format disarankan:** PNG atau WebP dengan alpha. Untuk panel admin, tampilkan preview pada pola checkerboard agar transparansi terlihat.
- **Resolusi usulan minimum:** tinggi sumber sekitar 800px; lebih tinggi diperbolehkan jika dioptimasi.
- **Batas file usulan:** 5MB sebelum kompresi/pemrosesan; dipastikan nanti saat implementasi.
- **Komposisi:** kaki kandidat sebaiknya bertemu panggung; beri area aman atas kepala; jangan menambahkan tekstur background utuh di foto.
- **Tidak ada auto background removal pada V1**. Sistem hanya meminta file transparan dan memberi panduan. Pemeriksaan alpha dapat dibuat sebagai validasi bantu, bukan jaminan foto rapi.
- Wajah/proporsi kandidat tidak dipoles atau dimodifikasi oleh UI. Setiap kandidat mendapat skala, spotlight, dan durasi yang setara.
- Sediakan fallback yang tetap adil untuk kandidat yang belum punya foto layak, seperti placeholder siluet netral (jika kebijakan panitia mengizinkan).

### 7.3 Foto Band, pemenang, dan bahan acara

- Band: foto editorial resolusi cukup, rasio 4:5 atau 3:4, crop mempertimbangkan subjek.
- Fashion/Awarding winner: rasio 3:4 untuk portrait; objek `cover` dengan safe area wajah.
- Hero: elemen panggung terpisah per layer supaya animasi dan penggantian konten tidak saling bertabrakan.
- Konten administrasi event (foto band, nominee, winner, teks, tanggal, lokasi) harus dari mock store saat FE-only; bukan ditulis langsung ke JSX komponen layout.
- Semua media punya `alt` yang cocok; ornament murni memiliki `aria-hidden`/alt kosong.

### 7.4 Larangan aset

- Tidak memakai screenshot PNGTree, stock ber-watermark, atau sampel dari PDF sebagai background langsung pada website publik.
- Jangan mengunduh/menyertakan file font tertanam dari PDF; pakai Google Fonts/source yang lisensinya sah.
- Aset panggung original boleh terinspirasi komposisi referensi, tetapi dibuat ulang secara kreatif.
- Hindari GIF berat sebagai pengganti animasi layer bila bisa dicapai via CSS/GSAP/SVG.

---
## 8. Motion system global dan aturan GSAP

### 8.1 Technology choices

| Teknologi | Status | Dipakai untuk |
|---|---|---|
| **GSAP** | **Utama** | Timeline curtain, envelope, candidate, award reveal |
| **ScrollTrigger** | **Utama di publik** | Scroll parallax, text reveal, band/photo transition |
| **CSS transition/keyframes** | **Utama untuk mikro UI** | Hover tombol, fokus input, toast, sidebar admin |
| **Lenis** | Opsional (bukan wajib) | Smooth scroll **khusus publik**, setelah uji perangkat |
| **Rive** | Opsional masa depan | Aset ikon/ilustrasi interaktif sangat khusus |
| **React Three Fiber/Three.js** | **Tidak diperlukan V1** | Hanya jika nantinya disetujui 3D nyata |
| Motion/Framer Motion | Tidak wajib | Hindari dua engine besar yang overlap tanpa alasan |

### 8.2 Motion tokens

| Token | Durasi usulan | Ease | Penggunaan |
|---|---|---|---|
| `motion.micro` | 150–250ms | ease-out | Button, tab, field |
| `motion.component` | 250–450ms | ease-out | Card transition, modal |
| `motion.reveal` | 500–900ms | power2.out | Text/photo reveal |
| `motion.scene` | 900–1600ms | power3.inOut | Stage scene transition |
| `motion.curtainIntro` | total ~1.8–3s (target usulan) | custom | Pembuka tirai beberapa tahap |
| `motion.envelope` | total ~1.4–2.2s | timeline | Buka amplop dan kertas keluar |
| `motion.candidate` | 5–8s / cycle atau gerak terbatas | sine.inOut | Kandidat mengayun halus |
| `motion.spotlight` | 500–900ms | power2.out | Sorot pindah saat kandidat berubah |

Timing di atas adalah **parameter prototyping**, bukan janji presisi. Setelah dites di HP kelas menengah, durasi bisa disesuaikan.

### 8.3 Prinsip pengalaman

1. **One hero moment per scene:** animasi terbesar harus punya titik fokus; jangan semua item berputar sekaligus.
2. **User control wins:** klik CTA, navigasi, baca form, dan scan QR selalu mengalahkan animasi.
3. **Meaningful reveal:** nama/QR/pemenang penting tidak disembunyikan terlalu lama.
4. **No false success:** success animation setelah mock action resolve, bukan pada `onClick` sebelum validasi.
5. **No vote bias:** setiap kandidat mendapat intensitas sorot, waktu tampil, dan skala yang setara.
6. **Reduced motion:** seluruh animasi dekoratif non-esensial memiliki mode langsung/instan.
7. **Keyboard first:** pengguna dapat memindahkan kandidat dan mengonfirmasi tanpa hover/cursor.

### 8.4 React/Next.js integration rules

- GSAP dipakai di **Client Components** yang memiliki referensi DOM (mis. `CurtainIntro.client.tsx`).
- Gunakan `@gsap/react` (`useGSAP`) atau `gsap.context()` agar animasi dibersihkan saat unmount dan tidak menggandakan listener/ScrollTrigger pada navigasi.
- Jangan memanggil `window`, `document`, `sessionStorage`, atau `matchMedia` di Server Component/render awal tanpa guard client.
- GSAP plugin didaftarkan sekali pada module client terkait.
- Animasi multi-layer mengutamakan properti **transform** dan **opacity**; hindari mengubah `top/left/width` setiap frame dan CSS blur besar yang terus-menerus.
- Untuk gambar, fokus animasi pada container/mask; jangan mengubah ukuran sumber gambar setiap frame.
- ScrollTrigger instance dibersihkan saat komponen unmount dan diperbarui saat ukuran/asset layout berubah bila perlu.
- Jika Lenis dipakai, integrasikan sinkronisasi scroll dengan GSAP menggunakan pattern resmi; jangan menggabungkan beberapa smooth-scroll engine sekaligus.

### 8.5 Reduced motion / fallback

- Hormati `prefers-reduced-motion: reduce`.
- Tanpa JS atau animasi gagal, hero tetap menunjukkan **MEMORIA, tanggal/waktu/lokasi, countdown/teks statis, dan floating tiket**.
- Hilangkan continuous candidate swing pada reduced-motion, tetapi navigasi kandidat tetap berfungsi.
- Undangan dalam mode reduced-motion tetap memulai **amplop tertutup** (sesuai alur klik pengguna), kemudian saat klik kertas langsung tampil tanpa animasi panjang.
- Jangan mengunci body scroll untuk animasi jika viewport tidak dapat dipulihkan setelah error.

### 8.6 Profil animasi per halaman

| Halaman | Intro | Scroll | Interaksi | Perangkat lambat/reduced motion |
|---|---|---|---|---|
| Beranda | Curtain Grand Reveal | Parallax film, band masks | Floating ticket | Stage statis, tanpa parallax |
| Fashion Show | Heading editorial reveal | Winner images reveal | Hover frame | Fade pendek atau instan |
| Awarding | Golden light reveal | Winner spotlight | Card focus | Frame statis |
| Pilih tiket | Card stagger | Minimal | Lift/shine on hover | Border/hover saja |
| Form | Simple fade | Tidak ada parallax | Focus/error/loading | Instan |
| Vote | Lampu stage menyala | Tidak prioritas | Kandidat berganti, putar, pilih, confirm seal | Stage statis, transisi instan |
| Undangan | **Menunggu klik** | Baca surat biasa | Flap opens, letter emerges | Surat langsung muncul setelah klik |
| Dashboard/Check-in | Tidak ada cinematic | Tidak ada | Toast/modal/focus | Instan |

---

## 9. Opening theatre: panggung, tirai, dan hero

### 9.1 Komposisi yang disepakati

- Proscenium / **bingkai panggung melengkung** dengan perimeter lampu marquee hangat.
- Tirai velvet merah, dua lapis foreground kiri–kanan + lapisan belakang; awalnya **tertutup** saat pengunjung pertama masuk beranda.
- Panggung utama berundak, bagian podium berwarna deep burgundy; gold trim, bukan pola merah-putih sirkus sebagai fokus.
- Spotlight dari bagian atas, vignette hitam di sudut untuk memberi kedalaman.
- Setelah tirai terbuka: tulisan **MEMORIA** (font Ballet), tagline, nama/tema event, tanggal, waktu, lokasi, countdown, indikator scroll.
- Semua data tanggal/waktu/lokasi/nama event berasal dari **Kelola Website → Beranda**. Count down terhadap waktu event nyata (WIB), bukan angka statis.

### 9.2 Stage layer stack (dari belakang ke depan)

1. `stage-ambient-bg`: Midnight Black + maroon gradient.
2. `curtain-back`: lipatan velvet belakang.
3. `stage-spotlight`: radial beam gold, opacity terkendali.
4. `hero-event-info`: logotype, tagline, tanggal, lokasi, countdown.
5. `platform-back` / `platform-front`: panggung bertingkat.
6. `curtain-left` dan `curtain-right`: tirai yang dapat bergerak.
7. `proscenium-arch`: frame melengkung.
8. `marquee-lights`: bulbs di tepian lengkungan.
9. `stage-front-vignette` dan detail ornament kecil.
10. Navbar dan floating ticket di layer UI terpisah, bukan bagian raster stage.

### 9.3 Timeline intro — storyboard

| Step | Pemicu | Animasi | Konten yang terlihat | Aksesibilitas |
|---|---|---|---|---|
| 0 | Halaman pertama dimuat | Stage statis dengan tirai tertutup, ada konten semantik yang tersedia | Frame panggung, teks aksesibilitas | Reduced-motion siap bypass |
| 1 | Asset essential ready | Bulbs menyala berurutan singkat | Lampu teater | Hanya dekorasi |
| 2 | Intro timeline | Dua tirai bergeser ke kiri/kanan; lipatan bergerak halus | Isi panggung mulai tampak | Tidak mencegah keyboard nav |
| 3 | Tirai cukup terbuka | Spotlight hangat naik, logotype Ballet terungkap | MEMORIA | Heading semantik tidak terduplikasi |
| 4 | Logo sudah jelas | Tagline, metadata, countdown stagger | Hari, jam, tempat | Metadata tetap dapat dibaca |
| 5 | Intro selesai | Scroll hint dan floating ticket tersedia | CTA `Tiket Gratis` | CTA fokus dan aktif |

**Kebijakan usulan:** intro hanya dijalankan **sekali per sesi browser untuk beranda**; pada kunjungan berikutnya dalam sesi yang sama, panggung langsung tampil terbuka. Ini usulan UX untuk menghindari pengulangan, bukan perubahan proses bisnis.

### 9.4 Mobile stage

- Arc boleh dipotong secara dekoratif di sisi kanan/kiri, tetapi MEMORIA + tanggal + CTA **tidak boleh terpotong**.
- Tirai yang membuka bergerak lebih pendek dibanding desktop; jumlah layer dan bulbs yang dianimasikan dikurangi.
- Countdown disusun 4 angka rapat atau 2×2 bila viewport sangat sempit, selalu dengan label hari/jam/menit/detik.
- Panggung bawah dapat muncul sebagai ilustrasi pendek, jangan memaksa tinggi scene hingga informasi penting harus scroll jauh.
- Jika sumber daya kurang, gunakan `stage-mobile-static.webp` sebagai fallback hasil produksi, tanpa kehilangan fungsi.

### 9.5 Countdown states

| Situasi | Perilaku |
|---|---|
| Event belum mulai | Menghitung hari/jam/menit/detik hingga `eventDateTime` |
| Jam mulai tercapai | Hindari angka negatif; tampil `Acara dimulai` atau status yang ditentukan panitia |
| Tanggal/jam kosong | Jangan menampilkan countdown `NaN`/`00` palsu; tampil informasi belum tersedia |
| Timezone client berbeda | Dasarkan pada timestamp event WIB yang diparsing/ditangani eksplisit |
| Tab tidak aktif | Perbarui selisih waktu saat kembali fokus, jangan hitung berdasar interval akumulasi semata |

---

## 10. Navbar, footer, floating tiket, dan navigasi publik

### 10.1 Navbar publik — **tiga halaman**, bukan anchors

| Label | Route | Behavior |
|---|---|---|
| Beranda | `/` | Menampilkan hero+sections |
| Fashion Show | `/fashion-show` | Halaman kategori dan pemenang |
| Awarding | `/awarding` | Halaman kategori dan pemenang |

- Brand MEMORIA di kiri sebagai tautan `/`.
- Desktop: navbar horizontal dengan active indicator tipis burgundy/gold (menurut latar).
- Mobile: brand + tombol hamburger, drawer menu 3 pilihan. Close on navigation, escape, outside click.
- Navbar boleh berubah background dari transparan gelap ke solid Midnight/Wine saat scroll. Blur secukupnya; hindari backdrop filter berat di banyak layer.
- Form, voting, dan undangan **tidak membutuhkan navbar tiga menu** jika memecah fokus; cukup link kembali atau identitas kecil.

### 10.2 Floating ticket — keputusan khusus

- Hanya tampil **kanan bawah** pada beranda, fashion show, dan awarding saat minimal satu tiket Published.
- Label **`Tiket Gratis`**, ikon ticket custom/Phosphor, latar burgundy, teks ivory, trim gold.
- Posisi memperhitungkan safe-area mobile: `bottom: max(16px, env(safe-area-inset-bottom) + 12px)` (usulan teknis).
- Aksi klik membuka `/daftar`, bukan form langsung dan **bukan section landing page**.
- Pada halaman daftar/form/sukses/vote/undangan, floating CTA disembunyikan agar tidak menghalangi kontrol utama.
- Saat tidak ada tiket Published, tidak tampil. Bila tiket Published tetapi penuh/ditutup, tiket dapat tetap tampil sesuai PRD (terdapat state informasi status pada halaman tiket).
- Animasi: hover lift 3px + shine singkat; jangan bouncing terus-menerus atau menutupi error toast.

### 10.3 Footer

- Logo MEMORIA versi kecil dan tagline.
- Metadata singkat event: tanggal/lokasi jika tersedia, copyright/identitas panitia bila diputuskan.
- Tidak membuat menu tambahan seperti Blog, Marketplace, RSVP, atau tautan sosial wajib tanpa keputusan.
- Ukuran teks mudah dibaca, ornament film strip minimal.

---

## 11. Desain halaman Beranda dan Band Showcase

### 11.1 Route `/` — komposisi utama

1. `PublicNavbar` (tetap terlihat saat perlu).
2. `CurtainHeroScene`: panggung, opening, logotype, tagline, countdown, tanggal, jam, tempat.
3. `BandShowcaseSection`: daftar band yang dipublikasikan/diisi panitia.
4. `FashionTeaserSection`: informasi acara Fashion Show + CTA halaman khusus.
5. `AwardingTeaserSection`: informasi acara Awarding + CTA halaman khusus.
6. `PublicFooter`.
7. `FloatingTicketCTA` fixed di kanan bawah saat tiket Published.

**Tidak ada section daftar tiket di bagian bawah beranda**, sesuai keputusan pengguna.

### 11.2 Band Showcase — editorial alternating

- Header editorial dengan label kecil `THE PERFORMANCE` dan judul dari komposisi desain.
- Setiap item band: `photo`, `name`, `description`, `order` dari panel Admin Kelola Website.
- Layout desktop **asymmetric alternating**: foto kiri/teks kanan, berikutnya foto kanan/teks kiri. Bentuk bukan grid kartu seragam.
- Pencahayaan foto: overlay burgundy gelap untuk transisi, hindari membuat foto terlalu gelap sampai tak terbaca.
- Film strip motif sebagai bingkai sekunder, tidak menghalangi wajah.
- In-view mask reveal dan parallax ringan. Data kosong → section dapat tersembunyi atau menampilkan state yang ditentukan panitia; **jangan munculkan band dummy di produksi**.
- Jika jumlah band banyak, gunakan logika layout generik berdasarkan indeks dan key stabil; konten tetap CMS/mock-data driven.

### 11.3 Teaser Fashion Show

- Satu blok visual editorial, copy singkat `Akan hadir Fashion Show` / copy panitia.
- Foto/ilustrasi stage/runway, CTA `Lihat Fashion Show` → `/fashion-show`.
- **Tidak** menampilkan pemenang di teaser beranda.

### 11.4 Teaser Awarding

- Blok visual gold/red, copy `Akan hadir Awarding` / copy panitia.
- CTA `Lihat Awarding` → `/awarding`.
- **Tidak** mengaitkan pengumuman dengan hasil voting otomatis.

### 11.5 UI states

| State | Tampilan |
|---|---|
| Data hero lengkap | Stage dan countdown normal |
| Tanggal/lokasi belum diisi | Informasi aman, CTA tetap dapat dipakai bila tiket tersedia |
| Band kosong | Hilangkan section atau state yang dirancang, tanpa hardcode band |
| Foto band gagal | Placeholder branded + alt/label teks |
| Tidak ada tiket Published | Floating tidak terlihat |
| Device reduced motion | Stage statis; semua informasi tetap terbaca |

---

## 12. Desain halaman Fashion Show dan Awarding

### 12.1 Persamaan kedua halaman

- Navbar publik tetap sama, dengan indikator aktif.
- Hero editorial berjudul besar (Bodoni Moda) dan teks penjelasan dari panitia.
- Kategori dan pemenang yang **Published** tampil dalam kartu berisi `kategori`, `foto`, `nama`, `keterangan`.
- Draft disimpan admin, **tidak dirender kepada publik**.
- Jika kategori/pemenang belum Published, tampil empty state elegan: `Pemenang akan diumumkan pada acara MEMORIA` (copy bisa disesuaikan).
- Floating tiket tetap di kanan bawah jika syarat tiket terpenuhi.
- Foto pemenang disimpan/diubah panitia, tidak mengambil otomatis foto kandidat voting.

### 12.2 Fashion Show: Editorial Runway

- Palet Midnight + Wine lebih dominan, warm gold sebagai garis penekanan.
- Typography headline Bodoni Moda, framing foto peserta gaya fashion editorial (3:4).
- Winner cards berupa editorial portraits; bisa 1 kartu besar dan sisanya grid berdasarkan jumlah data.
- Motion: mask reveal foto, spotlight sweep ringan per kartu, hover focus. Tidak terus-menerus berputar.
- Keterangan pemenang maksimal lebar baca nyaman; teks panjang `wrap`, tidak dipotong total.

### 12.3 Awarding: Golden Moment

- Palet lebih gold dibanding Fashion, tetapi gold tetap aksen, tidak menguasai latar.
- Kategori dengan gold overline; kartu winner memakai ornamental corner/spotlight.
- Motion `Category label → Spotlight → Foto → Nama → Keterangan` saat masuk viewport.
- Cukup satu kali per kartu; ketika berpindah back/forward, tidak wajib replay.
- Jika total kategori banyak, gunakan grid/gap jelas; tidak membuat semua kategori satu carousel wajib.

### 12.4 Ketentuan pemenang manual (LOCKED)

`Admin Kelola Website → Buat Kategori & Pemenang → Simpan Draft → Preview → Publish → Muncul Publik`

- Published dapat dikembalikan ke Draft untuk menyembunyikan dari publik.
- Hasil voting memang bisa membantu keputusan panitia, tetapi **tidak** memasukkan winner otomatis.
- Tidak menampilkan kandidat yang masih ikut voting sebagai pemenang sebelum dipublikasikan.
- Setelah Publish, animasi winner dapat ditampilkan. Efek confetti hanya bila diperlukan, jangan overload.

---

## 13. Desain pemilihan tiket, formulir, dan halaman sukses

### 13.1 `/daftar` — Vintage Cinema Ticket

- Layout focused, judul `Pilih Tiket MEMORIA` dengan label editorial opsional `Choose Your Experience`.
- Grid daftar beberapa jenis tiket gratis (data Admin), kartu seperti admission ticket dengan perforasi dan angka kuota.
- Fields per kartu: nama tiket, label `Gratis`, kuota tersisa atau `Tanpa batas`, rentang waktu daftar, status (tersedia/penuh/ditutup/belum dibuka), tombol `Pilih Tiket`.
- Kartu penuh/closed: masih dapat tampil tetapi tombol dinonaktifkan dan menjelaskan alasan.
- Animasi masuk: stagger 250–450ms, hover lift 3px, glow gold lembut.
- Ketika jenis dipilih → `/daftar/[ticketId]`. Bukan checkout, tidak ada harga/pembayaran.

### 13.2 `/daftar/[ticketId]` — Clean Ivory Registration

**Kontainer:** kartu ivory/soft white di atas background Wine/Midnight yang tenang, satu kolom. Aksen ornament gold sangat minimal.

| Field | Komponen | Konten / aturan |
|---|---|---|
| Jenis tiket | Read-only highlight card | Nama tiket terpilih, harga Rp0, kuota/status |
| Nama Lengkap | Text input | Wajib; nama boleh sama dengan orang lain |
| NIM | Text input | Wajib; unik **di seluruh MEMORIA**, termasuk yang diarsipkan |
| Program Studi | Read-only/locked | `D4 Sistem Informasi Kota Cerdas` |
| Fakultas | Read-only/locked | `Fakultas Ilmu Terapan` |
| Nomor HP | Tel input | Wajib; format valid; tidak harus unik |
| Email | Email input | Wajib; format valid; tidak harus unik antar mahasiswa |
| CTA | Button besar | `Daftar Gratis` |

- Form menampilkan error inline; submit invalid mengarahkan fokus ke error pertama dan mempertahankan input.
- Submit loading tidak membuat klik ganda/pendaftaran duplikat.
- Jika NIM sudah terdaftar, tampilkan `NIM sudah terdaftar` dan anjuran menghubungi panitia; **tidak** ada login atau self-service pengiriman ulang tanpa verifikasi.
- Jika ticket expired/closed/penuh saat submit, blok dan tampilkan alasan.
- Tidak ada curtain animation, 3D, parallax, atau decorative interactive yang mengganggu mengetik.

### 13.3 `/daftar/berhasil` — E-ticket success

- Tampilkan status berhasil, ringkasan nama/NIM/jenis tiket, nomor tiket, QR check-in, kode voting, dan informasi event.
- Tombol utama `Unduh Tiket PDF` aktif segera setelah registrasi mock sukses.
- Teks `Tiket juga dikirim ke email yang didaftarkan`; **pengiriman gagal tidak membatalkan pendaftaran**.
- Tombol `Kembali ke Beranda` sekunder.
- Animasi sukses berupa stamp/centang gold singkat; jangan menunggu animasi untuk mengaktifkan unduh PDF.
- Akses `/daftar/berhasil` tanpa konteks sesi harus menampilkan state aman `Sesi pendaftaran tidak ditemukan`, bukan tiket orang lain.

### 13.4 E-ticket PDF — tata letak visual

- Gaya premiere ticket: Burgundy/Gold/Ivory, perforasi dekoratif di pinggir, tetapi isi teks tetap jelas.
- Isi wajib: MEMORIA, nama mahasiswa, NIM terbaru, prodi, fakultas, nama jenis tiket, nomor tiket tetap, jadwal/lokasi event, **QR check-in**, **kode voting unik**, petunjuk singkat.
- QR: hitam di atas putih dengan quiet zone, ukuran cukup pada HP, tidak distorsi.
- Saat NIM diedit Admin, **regenerasi tampilan PDF** memakai NIM baru tetapi `ticketNo`, `voteCode`, dan QR check-in **tetap**.
- Saat peserta diarsipkan, PDF yang sudah diunduh tidak dapat ditarik dari perangkatnya; **validitas QR saat check-in** yang menolak tiket arsip. Jangan memberi kesan file PDF lama otomatis lenyap.

### 13.5 Multi-ticket rules

- Panitia dapat membuat beberapa jenis tiket, semuanya gratis.
- Mahasiswa **hanya boleh memiliki satu tiket untuk seluruh event** (bukan per jenis).
- Kuota dikonsumsi sesuai jenis tiket yang dipilih; arsip mengembalikan kursi, restore mengonsumsi kursi saat masih tersedia.
- Halaman tiket list responsif dan tidak mengasumsikan jumlah jenis tiket tetap 1/2/3.

---

## 14. Desain Private Voting — Spotlight Rotating Stage

### 14.1 Prinsip desain utama — keputusan pengguna

**Bukan** grid foto kandidat biasa. Setiap kandidat yang diunggah panitia (PNG/WebP transparan/no background) tampil **di atas panggung** dengan **sorotan lampu dari atas**, serta **gerakan rotasi/berayun yang elegan**. Panggung mengikuti bahasa visual berlengkung, velvet, dan gold, tetapi diarahkan agar fokus ada pada kandidat.

### 14.2 Route `/vote/[voteToken]` dan state

| State | Konten wajib | Gerakan |
|---|---|---|
| Invalid token | `Voting tidak ditemukan` + kembali | Tidak ada panggung interaktif |
| Draft/terjadwal | Judul, deskripsi, periode, informasi belum dibuka | Stage statis/teaser |
| Aktif, belum verifikasi | Form NIM + kode unik tiket | Spotlight ambient lemah |
| Verifikasi gagal | Error `Identitas tiket tidak cocok` | Shake ringan opsional, tidak flash |
| Sudah memilih | `Kamu sudah memberikan suara` | Tidak dapat vote ulang |
| Pilih kandidat | Stage center dengan kandidat fokus | Kandidat berayun + transisi kiri/kanan |
| Konfirmasi | Nama & foto terpilih + CTA `Kirim Suara` | Putaran berhenti, spotlight stabil |
| Submit sedang berjalan | Button loading, interaksi kandidat sementara terkunci | Tidak tampil animasi sukses dulu |
| Submit berhasil | Segel emas / gold ballot stamp + teks berhasil | Transisi success satu kali |
| Voting selesai | Status ditutup, tidak menerima suara | Stage read-only/teaser |

### 14.3 Flow interaksi pengguna

`Link Private → NIM + Kode Voting Tiket → Verifikasi → Stage Kandidat → Pindah Kandidat → Pilih → Konfirmasi → Simpan Suara → Gold Seal Success`

- Link private tiap judul voting berbeda. Tidak ada link voting di navbar publik.
- Kode tiket untuk vote sama di semua judul; mahasiswa memasukkan **NIM DAN kode unik voting**, bukan hanya NIM.
- Satu peserta boleh mengikuti beberapa judul, tetapi **maksimal satu suara pada setiap judul**.
- Status voting mengikuti jadwal mulai/akhir WIB secara otomatis.
- Tidak tampilkan hasil voting real-time untuk mahasiswa.

### 14.4 Layer desain VotingStage

1. `voting-backdrop`: Midnight/wine texture.
2. `voting-curtain-back`: velvet stage rear.
3. `voting-arch`: arc frame dan marquee bulbs relatif tenang.
4. `spotlight-beam`: cone dari atas menuju posisi kandidat.
5. `candidate-shadow`: shadow pada permukaan podium.
6. `candidate-image`: PNG/WebP transparan; transform berada dalam area aman.
7. `podium`: multi-step burgundy/gold platform.
8. `foreground-glow`: radial lighting tipis.
9. `candidate-metadata`: nama + keterangan di bawah atau samping, bukan menempel di tubuh.
10. `voting-navigation`: panah kiri/kanan, indikator urutan, CTA pilih/konfirmasi.

### 14.5 Rotasi kandidat — keputusan desain yang realistis

**Foto tunggal 2D transparan tidak memberikan tampilan punggung/tubuh sebenarnya.** Karena itu **jangan** menjanjikan rotasi 360° realistik.

Implementasi V1 yang disarankan:

- Kandidat bergerak sebagai figur panggung **3D-like sway/rocking**: `rotateY` bolak-balik **±8–14°** dan translasi Y kecil, bukan berputar 360° seperti kertas.
- Durasi 5–8 detik per ayunan, ease halus, `transform-style: preserve-3d` bila relevan, `perspective` pada container.
- Stop/kurangi gerak pada `hover`, `focus`, `selected`, modal konfirmasi, atau `prefers-reduced-motion`.
- Kandidat yang berganti ditransisikan fade/slide ringan; background panggung tidak dimuat ulang setiap perpindahan.
- Jika suatu hari user ingin full 360° realistis, butuh foto multi-sudut atau model 3D dan keputusan baru.

### 14.6 Kontrol stage dan kebijakan adil

| Kontrol | Desktop | Mobile / keyboard |
|---|---|---|
| Berikutnya/Sebelumnya | Tombol di samping stage | Tombol besar di bawah, arrow keys bila fokus pada stage |
| Thumbnail kandidat | Bisa tampil di bawah stage | Scrollable, label nama jelas |
| Pilih kandidat | CTA prominent | CTA lebar, minimum 44px target |
| Lihat keterangan | Panel samping/bawah | Di bawah stage, dapat scroll normal |
| Konfirmasi | Modal/drawer | Modal mobile scrollable, akses escape/back |

- **Semua kandidat** memakai tinggi visual, posisi podium, durasi spotlight, dan motion setara; `object-fit: contain` untuk foto transparan.
- Jangan mengunci pengguna sampai animasi berputar selesai.
- Tidak ada auto-advance kandidat pada timer; pengguna mengendalikan urutan.
- Jangan gunakan warna spotlight berbeda untuk membujuk pilihan.

### 14.7 Perilaku success

1. Peserta menekan `Pilih Kandidat` → status selected.
2. Tombol `Konfirmasi Vote` membuka review nama, foto, judul vote.
3. Peserta menekan `Kirim Suara` → mock adapter memvalidasi jadwal, peserta aktif, token, belum pernah vote.
4. **Hanya setelah resolve sukses**, panggung diredupkan dan gold seal muncul.
5. Tampilkan `Suara kamu berhasil dicatat` + `Selesai` ke beranda.
6. Setelah reload dengan identitas sama, tampil `Sudah voting`, bukan pengulangan success yang mengizinkan pilih lagi.

### 14.8 Preview untuk Admin Kandidat

- Form admin mencakup `nama`, `foto transparan`, `keterangan`, upload input, checkerboard preview, dan **Preview di Panggung**.
- Preview menggunakan reusable `VotingStage` presentational, tanpa akses submit suara.
- Setelah total suara voting > 0, tombol tambah/edit/hapus kandidat disabled **dan mock store menolak mutasi**.
- Jangan menyeragamkan data kandidat dengan pemenang; pemenang tetap dipilih manual pada menu Kelola Website.

---

## 15. Desain Undangan Dosen — Interactive Velvet Envelope

### 15.1 Konsep utama — keputusan pengguna

**Undangan pertama kali dibuka harus menampilkan amplop yang TERTUTUP.** Animasi tidak otomatis berjalan. Dosen **klik tombol `Buka Undangan`**, baru tutup amplop terbuka dan **kertas undangan keluar**.

### 15.2 Route `/undangan/[inviteToken]`

| Fase | Tampilan | Aksi | Gerakan |
|---|---|---|---|
| `CLOSED` | Latar Wine, amplop Burgundy, segel gold MEMORIA, teks singkat | `Buka Undangan` | Bulb/ornament ambient rendah |
| `OPENING` | Segel bereaksi, lipatan amplop terbuka | Tidak perlu klik lain | Flap rotate, kertas naik |
| `EXPANDING` | Kertas bergerak ke depan, frame membesar | Tidak perlu klik lain | Transform + scale + opacity |
| `OPEN` | Surat ivory lengkap: nama dosen, teks, detail event, QR | `Lihat QR Undangan`, kembali/baca | Animasi berhenti; scroll normal |
| `ERROR` | Link undangan salah/tidak berlaku | Kembali Beranda / hubungi panitia | Tidak tampil data tamu |

### 15.3 Storyboard interaksi

1. Halaman dimuat: amplop tetap tertutup di tengah, dengan tombol `Buka Undangan` yang langsung dapat diakses keyboard.
2. Pengguna klik tombol: state `OPENING`, tombol disabled selama animasi.
3. Segel gold pulse singkat lalu tutup amplop berotasi ke belakang (bukan hanya menghilang).
4. Kertas ivory naik keluar (layer kertas berada di belakang flap depan, lalu dipindah visual ke lapisan atas).
5. Kertas membesar dan bertransisi menjadi **halaman surat yang dapat di-scroll normal**, bukan tetap terkunci dalam area kecil.
6. Fokus aksesibilitas dipindah ke judul surat; tombol `Lihat QR Undangan` mudah ditemukan.
7. Bila halaman refresh/diakses lagi, **usulan UX** boleh mempertahankan state opened pada sesi yang sama agar dosen langsung menemukan QR. Pada kunjungan baru, default tertutup sesuai keputusan pengguna.

### 15.4 Konten surat dan komposisi

| Elemen | Sumber data | Gaya |
|---|---|---|
| `MEMORIA` + tagline | Branding | Ballet besar / Bodoni + DM Sans |
| Judul undangan | Template panitia | Bodoni Moda |
| Salam/nama dosen | Data dosen pribadi | DM Sans/Bodoni; harus jelas |
| Isi undangan | Template panitia | DM Sans body 16–18px, line height lega |
| Tanggal/waktu/tempat | Kelola Website Beranda | Panel ivory/champagne |
| Nama pengirim/penutup | Template panitia | DM Sans |
| QR undangan dosen | Token QR tetap | Hitam-putih, tanpa motion pada QR |
| Kode undangan jika diperlukan | Data dosen | DM Sans/tabular jika numerik |

### 15.5 Aturan QR khusus undangan

- QR dipasang dalam panel putih solid dengan **quiet zone**, kontras maksimum, tidak dibuat transparan di atas dekorasi.
- Tombol `Lihat QR Undangan` melakukan scroll/fokus menuju QR, bukan membuka tautan lain yang membingungkan.
- Dosen menunjukkan QR kepada Petugas Check-in; tidak harus login atau RSVP.
- QR undangan bersifat personal dan stabil sepanjang record aktif; pengiriman ulang tidak menghasilkan QR baru.
- Check-in manual dosen lewat email atau kode undangan, bukan NIM.

### 15.6 UX aksesibilitas dan fallback

- Button eksplisit **Buka Undangan**, bukan hanya klik amplop tanpa petunjuk.
- Bila animasi SVG gagal, klik tetap menampilkan surat secara instan.
- Jika dosen dengan keyboard menekan Enter/Space di tombol, perilakunya identik.
- Setelah terbuka, teks tidak punya motion berulang/kontras rendah dan tidak dipaksa seluruhnya mengikuti parallax.
- Tidak memasukkan informasi dosen (email/nomor HP) ke gambar dekoratif atau metadata publik.

---

## 16. Design system Admin & Petugas — Clean Minimal

### 16.1 Keputusan pengguna: admin **polosan aja**

**Semua halaman internal harus polos, cepat, dan sederhana.** Jangan menghadirkan konsep velvet teater ke dalam tabel. Brand cukup pada logo kecil, tombol burgundy, badge, dan icon konsisten.

- Background `#F8F9FB`; surfaces putih; teks `#252932`; border `#E5E7EB`.
- Sidebar putih (atau putih dengan aksen burgundy aktif), topbar singkat; tanpa ornamental flourishes.
- Typography **DM Sans** 100% untuk semua proses internal.
- Icon Phosphor regular; custom animated SVG hanya pada preview panggung/undangan, bukan sidebar.
- Animasi internal berupa CSS transitions/opacity saja; **tidak** perlu GSAP khusus di seluruh menu admin.
- Desktop sidebar; tablet sidebar collapse; mobile drawer. Petugas Check-in langsung diarahkan ke scanner.

### 16.2 Admin screen anatomy

1. Sidebar navigasi 8 menu utama.
2. Topbar akun/role, logout.
3. Judul halaman + deskripsi satu kalimat.
4. Primary CTA kanan atas bila ada.
5. Metrics/filters/tabs jika relevan.
6. Tabel/form/konten.
7. Confirmation modal, loading/error/empty/success feedback.
8. Footer admin minimal (opsional, tidak menghalangi kerja).

### 16.3 Admin navbar & sidebar

| Menu | Subbagian / screen | Akses |
|---|---|---|
| Dashboard | Statistik | Admin |
| Kelola Website | Beranda; Band; Fashion Show; Awarding | Admin |
| Tiket | Daftar; Baru; Edit | Admin |
| Data Peserta | Aktif; Arsip; Detail | Admin |
| Voting | Daftar; Editor Kandidat; Hasil | Admin |
| Undangan Dosen | Template; Daftar Dosen | Admin |
| Check-in | Scan QR; Manual; Riwayat | Admin & Petugas |
| Kelola Akun | Daftar; Tambah/Edit/Reset | Admin |

Petugas: sidebar **Check-in + Keluar** saja. Jangan menampilkan tautan Data Peserta publik penuh pada petugas.

### 16.4 Element states dan animasi admin

- Menu hover: background abu/ivory tipis.
- Menu aktif: bar burgundy tipis + label teks, bukan marquee.
- Modal: fade/scale rendah 150–200ms.
- Button loading: spinner + disabled selama mutation.
- Toast: ringkas, menandakan respons sebenarnya dari mock adapter.
- Tabel loading: skeleton netral; tidak ada cinematic reveal.
- Focus ring 2px jelas untuk keyboard; jangan memakai gold tipis di atas putih.

---
## 17. Rincian UI delapan menu Admin Panitia

### 17.1 `Dashboard` — `/panitia`

**Layout:** header judul + metadata acara kecil; KPI grid; ringkasan; shortcut.

| Komponen | Konten | Perilaku |
|---|---|---|
| KPI Total Peserta Aktif | Jumlah pendaftar aktif | Klik ke Data Peserta |
| KPI Hadir | Jumlah peserta aktif sudah check-in | Klik filter Hadir |
| KPI Belum Check-in | Pendaftar aktif belum hadir | Klik filter Belum |
| KPI Tiket | Total jenis Published, kapasitas/terpakai | Klik menu Tiket |
| KPI Voting | Aktif/Terjadwal/Selesai, total suara | Klik menu Voting |
| KPI Undangan Dosen | Jumlah undangan dan dosen hadir | Klik Undangan Dosen |
| Quick Action | `Lihat Peserta`, `Buka Check-in` | Aksi navigasi, bukan edit langsung |

- Data realistis dari store; jangan hardcode angka 250/180 dalam aplikasi final.
- Admin dashboard bukan halaman untuk langsung mengubah status suara/pemenang.
- Chart opsional berupa grafik simpel jika memang membantu; tidak perlu plugin 3D.

### 17.2 `Kelola Website` — `/panitia/website/*`

**Submenu `Beranda`** `/panitia/website/beranda`: form nama acara, tagline, deskripsi, tanggal, waktu, lokasi, hero media/teaser copy. `Simpan` memperbarui publik langsung; preview tanpa mengirim email/tiket.

**Submenu `Band`** `/panitia/website/band`: daftar band; `Tambah`, `Edit`, `Hapus`, `Atur Urutan`, `Simpan`; field nama, foto, deskripsi. Preview memakai layout band publik, tetapi CRUD tetap form admin sederhana.

**Submenu `Fashion Show`** `/panitia/website/fashion-show`: teaser publik (judul, deskripsi, foto); daftar kategori/pemenang. Field pemenang `kategori`, `foto`, `nama`, `keterangan`; status Draft/Published; `Preview`, `Simpan Draft`, `Publish`, `Kembalikan Draft`, `Edit`.

**Submenu `Awarding`** `/panitia/website/awarding`: bentuk dan flow setara Fashion Show, tetapi preview gaya Golden Moment.

- Semua perubahan konten normal **langsung tampil setelah Simpan**; pengumuman pemenang **hanya tampil setelah Publish**.
- Jangan memungkinkan edit kandidat voting dari Kelola Website; ini dua fitur berbeda.
- Section yang kosong punya empty state admin `Belum ada band/pemenang` + CTA yang tepat.

### 17.3 `Tiket` — `/panitia/tiket/*`

**Daftar:** tabel nama, kuota, terdaftar aktif, tersisa, periode, status Draft/Published + availability, aksi.

**Tombol:** `Tambah Tiket`, `Detail`, `Edit`, `Publish`, `Unpublish/Tutup Pendaftaran`, `Lihat Pendaftar`.

**Form:** nama tiket, harga read-only `Gratis / Rp0`, kuota opsional, buka/tutup pendaftaran (tanggal dan jam WIB), status publikasi. Gunakan datetime picker sederhana dengan label zona waktu.

**UX kasus:**

- Draft: tidak muncul pada halaman tiket publik.
- Published belum buka: dapat terlihat dengan label `Belum Dibuka`, tidak bisa didaftari.
- Published terbuka: tersedia kecuali kuota penuh.
- Published sudah lewat: label `Ditutup`, tidak bisa daftar.
- Kuota tanpa batas: tampil `Tanpa batas`, tidak ditampilkan angka palsu.
- Perubahan kuota tidak boleh membuat `capacity < activeRegistrations`.
- Jenis tiket dengan pendaftar tidak bisa dihapus permanen dengan sembarang aksi.

### 17.4 `Data Peserta` — `/panitia/peserta/*`

**Subtab:** `Peserta Aktif` dan `Arsip Peserta` dalam satu menu; tab bukan sidebar baru.

**Toolbar:** search nama/NIM, filter jenis tiket, Hadir/Belum, status voting per kategori (dinamis), `Ekspor Excel (.xlsx)`.

**Tabel utama (desktop):**

| Kolom | Tipe display |
|---|---|
| Nama | Text primary |
| NIM | Text monospace/tabular-nums jika cocok, pertahankan nol depan |
| Email | Text / ringkas dengan tooltip jika perlu |
| Nomor HP | Text, pertahankan `0` depan |
| Prodi | Readable text `D4 Sistem Informasi Kota Cerdas` |
| Fakultas | `Fakultas Ilmu Terapan` |
| Jenis tiket | Badge/text |
| Kehadiran | `Hadir` / `Belum Check-in` |
| Waktu Check-in | Tanggal+jam WIB atau `—` |
| Vote: [judul voting dinamis] | Setiap kategori status `Sudah/Belum` |
| Aksi | `Detail`, `Kirim Email`, `Edit Data`, `Hapus Data` |

**Aksi Kirim Email:** konfirmasi tujuan → simulasi kirim ulang **tiket yang sama** → toast berhasil/gagal; **tidak ada kolom status email permanen**.

**Edit Data dengan dua verifikasi:**

1. Admin membuka form, memperbarui nama/NIM/email/HP/jenis tiket (prodi/fakultas locked).
2. Tahap pertama: dialog perbandingan `Sebelum → Sesudah`, termasuk peringatan identitas tiket tetap.
3. Tahap kedua: input password admin → `Konfirmasi & Simpan`.
4. Jika berhasil, data NIM baru dipakai pada tampilan/PDF terbaru, tetapi nomor tiket, kode voting, QR tetap sama.
5. Jika NIM duplikat (termasuk peserta arsip) atau jenis tiket baru penuh, tolak tanpa perubahan sebagian.

**Hapus Data = Arsip, dua verifikasi:**

1. Klik `Hapus Data` dari menu aksi.
2. Tahap pertama: dialog menampilkan peserta dan akibat arsip, klik `Lanjutkan`.
3. Tahap kedua: password admin + ketik `HAPUS`, klik `Arsipkan`.
4. Saat sukses: status Archived, tiket/QR/vote baru dinonaktifkan, kursi kembali tersedia, riwayat suara/check-in **tetap**.

**Arsip Peserta:** tampil pencarian dan detail historis, tombol `Pulihkan Peserta` dengan konfirmasi, hanya jika kuota jenis tiket masih cukup. Mengaktifkan kembali **identitas tiket yang sama**. Jika peserta dulu sudah Hadir atau Sudah Voting, riwayatnya tetap dan tidak dapat melakukan tindakan ganda.

**Mobile:** tabel detail menjadi row cards; jangan menghilangkan akses aksi atau menyembunyikan waktu hadir.

### 17.5 `Voting` — `/panitia/voting/*`

**Daftar:** judul, deskripsi ringkas, jumlah kandidat, jadwal, status Draft/Terjadwal/Aktif/Selesai, total suara, aksi.

**Editor form:** judul, keterangan, tanggal mulai, tanggal akhir, repeater kandidat. Kandidat harus memiliki nama; foto transparan dan keterangan; minimal dua kandidat untuk menjadwalkan.

**Tombol:** `Tambah Voting`, `Simpan Draft`, `Jadwalkan`, `Kelola Kandidat`, `Preview di Panggung`, `Salin Link Private`, `Lihat Hasil`.

**Hasil:** total suara, kandidat, foto kecil, perolehan dan persentase, grafik batang admin. Jangan otomatis membuat pengumuman pemenang.

**Status:** waktu awal/akhir otomatis mengatur kapan publik boleh voting. Kandidat boleh diedit jika **belum ada suara**, meskipun status saat itu Aktif; begitu ada satu suara, add/edit/delete kandidat dikunci.

**Admin preview:** hanya preview foto transparan di atas podium; tidak melakukan casting vote.

### 17.6 `Undangan Dosen` — `/panitia/undangan/*`

**Tab Template Undangan:** field judul/subjek, salam pembuka, isi surat, penutup, nama pengirim; preview surat keluar dari amplop, metadata acara dari Beranda. Tombol `Simpan Template`, `Lihat Pratinjau`.

**Tab Daftar Dosen:** tabel nama, email, nomor WA, status hadir, waktu check-in, aksi. `Tambah Dosen` modal/halaman kecil dengan nama, email, WA. **Satu email hanya satu undangan aktif**.

**Aksi:** `Lihat Undangan`, `Kirim Email`, `Kirim WhatsApp`, `Salin Link`, `Edit`, kirim ulang.

- Mengirim WhatsApp: membuka pesan siap kirim, **bukan** mengklaim pesan sudah terkirim.
- Mengirim Email: feedback sukses/gagal langsung, **tidak perlu kolom status pengiriman email**.
- Link/QR personal dibuat sekali dan tetap saat edit email/nama, kecuali aturan keamanan produksi yang nanti disepakati pada backend.
- Preview surat di admin boleh statis/sederhana; **interaksi amplop penuh ada pada halaman dosen**.

### 17.7 `Check-in` — `/panitia/check-in`

**Role:** Admin dan Petugas Check-in. Desain **mobile-first**, bersih dan cepat.

**Tabs:** `Scan QR`, `Manual`, `Riwayat`.

**Scan QR:** area camera/permission, border scan, status validasi. Setelah scan sukses secara teknis, tampil kartu identitas (`Nama`, `NIM` atau `Email/Kode Undangan`, jenis pengunjung, status), tombol `Hadirkan`.

**Manual:** pilih `Mahasiswa` atau `Dosen`. Jika mahasiswa, input **NIM**; jika dosen, input **Email/Kode Undangan**. Klik `Cari`, tampil hasil, `Hadirkan`.

**Riwayat:** nama, jenis pengunjung, metode QR/Manual, tanggal/jam WIB, petugas (terbatas menurut role). Minimal searching nama/identitas apabila berwenang.

**State penting:**

| Kondisi | Pesan |
|---|---|
| Valid belum hadir | Tampilkan tombol `Hadirkan` |
| Berhasil | `Check-in berhasil` + waktu aktual |
| Scan kedua | `Sudah Check-in` + waktu pertama, tidak berubah |
| QR/NIM tidak ditemukan | `Data tidak ditemukan` |
| QR peserta Archived | `Tiket tidak aktif` |
| Izin kamera ditolak | `Izinkan kamera atau gunakan Check-in Manual` |
| Offline/error | `Tidak dapat memverifikasi kehadiran` (jangan sukses palsu) |

**Tidak ada:** jadwal buka/tutup check-in, auto status `Tidak Hadir`, QR scan otomatis langsung hadir tanpa konfirmasi.

### 17.8 `Kelola Akun` — `/panitia/akun`

**Role:** Admin Panitia saja.

**Tabel:** nama, email, role, status aktif/nonaktif, aksi. **Form:** nama lengkap, email unik, password awal, role Admin Panitia/Petugas Check-in.

**Aksi:** `Tambah Akun`, `Edit`, `Reset Password`, `Nonaktifkan`, `Aktifkan`.

- Tidak ada registrasi publik mahasiswa/dosen maupun petugas.
- Admin pertama disiapkan saat inisialisasi sistem (backend nanti).
- Tidak memperlihatkan password yang tersimpan.
- Admin terakhir yang aktif tidak boleh dinonaktifkan/dihilangkan akses admin.
- Tidak perlu hapus permanen agar audit check-in tetap punya referensi aktor.

---

## 18. Komponen UI reusable dan state

### 18.1 Public brand components

| Component | Props/isi utama | Lokasi |
|---|---|---|
| `BrandLogotype` | text, size, color | Navbar, hero, undangan |
| `TheatreArch` | variant, bulb count | Hero, stage vote |
| `CurtainScene` | left/right/back asset, open state | Hero intro |
| `MarqueeBulbs` | intensity, stagger, static fallback | Hero/theatre |
| `StagePlatform` | variant, depth | Hero, voting |
| `SpotlightBeam` | target, opacity, direction | Stage vote/award |
| `FilmStripFrame` | media, caption | Band |
| `EditorialReveal` | children, in-view mode | Section publik |
| `FloatingTicketCTA` | enabled, link | Public pages |
| `WinnerCard` | category/photo/name/description | Fashion/Awarding |
| `VintageTicketCard` | type/quota/status/onSelect | Pilih tiket |
| `TicketPDFPreview` | identity, QR, code, event | Sukses, admin preview |
| `CandidateStage` | candidate, selected, change | Voting & admin preview |
| `CandidateCarouselControls` | prev/next/indices | Voting |
| `VoteConfirmationDialog` | candidate, pending | Voting |
| `GoldVoteSeal` | success state | Voting success |
| `EnvelopeScene` | closed/opening/open, onOpen | Undangan |
| `InvitationPaper` | invite content, QR | Undangan |
| `PersonalInvitationQR` | QR data, print-safe styles | Undangan |

### 18.2 Shared functional components

- `AppButton` with `primary/secondary/ghost/destructive`, `loading`, `disabled`.
- `AppInput`, `EmailInput`, `PhoneInput`, `DateTimeField`, `TextareaField`, `SelectField`, `FileUploadField`.
- `FieldError`, `FieldHint`, `FormSection`, `FormSubmitBar`.
- `ConfirmDialog`, `TwoStepVerificationDialog`, `Toast`, `InlineAlert`, `EmptyState`, `Skeleton`, `StatusBadge`.
- `QRCodeView` with high-contrast print-safe rendering; `CameraScannerPanel` mobile-first.
- `ResponsiveTable`, `MobileRecordCard`, `SearchToolbar`, `Pagination`, `FilterBar`.
- `PublicNavbar`, `PublicFooter`, `AdminSidebar`, `AdminTopbar`, `AdminPageHeader`, `Breadcrumb`.

### 18.3 State contract

| State | Yang harus selalu ada |
|---|---|
| Loading | Indikator status tanpa layout jump besar |
| Empty | Pesan spesifik + aksi yang bisa dilakukan |
| Error | Pesan manusiawi + cara retry/kembali |
| Success | Konfirmasi faktual setelah aksi selesai |
| Disabled | Alasan jelas, terutama tiket/akun/kandidat |
| Not found | Tidak membocorkan data personal |
| Permission denied | Link kembali ke akses yang sesuai |
| Archived | Status dan sejarah tetap dapat dilihat oleh admin |
| Reduced motion | Interaksi penuh, gerakan dekoratif dihentikan |

### 18.4 Naming dan props

- Gunakan **nama komponen semantik** (`InvitationEnvelope`, `CheckInScanner`) bukan `Card1` atau `Section2`.
- Pisahkan `*View` pure presentation dan `*Controller`/hooks yang menyimpan state bila suatu fitur kompleks.
- Foto, label, URL, status, dan tanggal masuk via props/store, **bukan disimpan sebagai data dummy di komponen reusable**.
- Komponen publik dan admin boleh memakai primitives bersama, tetapi style variant dipisah (`variant="public"|"admin"`) agar admin tidak menerima dekorasi stage tanpa sengaja.

---

## 19. Responsive, mobile, accessibility, dan performance

### 19.1 Breakpoint desain (usulan awal, bukan dogma)

| Target | Range perkiraan | Perlakuan |
|---|---|---|
| Small mobile | < 480px | Satu kolom, CTA besar, stage ringkas |
| Mobile/tablet portrait | 480–767px | Satu kolom / stacked |
| Tablet | 768–1023px | Grid 2 kolom, sidebar collapse |
| Laptop | 1024–1439px | Layout editorial/container besar |
| Wide desktop | ≥ 1440px | Lebar konten dikontrol max-width, stage dapat lebih lebar |

Uji pada viewport sempit 320–360px juga. Jangan memaksa BaleT logo sangat besar sampai keluar viewport.

### 19.2 Prioritas per device

- **Hero:** static fallback bagus, label tanggal/tempat tetap terbaca; fixed ticket tidak menutupi countdown.
- **Voting:** satu kandidat terlihat jelas, next/prev/pilih mudah disentuh; jangan mengandalkan hover; foto tidak terpotong.
- **Undangan:** CTA Buka Undangan jelas, setelah terbuka surat bisa di-scroll; tombol QR accessible tanpa mencari-cari.
- **Form:** satu kolom, keyboard type sesuai (`email`, `tel`), area input cukup tinggi, teks 16px untuk mengurangi zoom mobile.
- **Check-in:** akses kamera dan tombol Hadirkan berada dekat area scan; fallback manual praktis.
- **Admin Data Peserta:** desktop tabel horizontal; mobile drawer/detail card dengan semua aksi tetap ada.

### 19.3 Aksesibilitas wajib

- `prefers-reduced-motion`: kurangi/hilangkan parallax, tirai panjang, rotasi kandidat, dan transisi amplop panjang.
- Keyboard: tab order logis; menu, candidate controls, modal, tabs, verifikasi dua langkah dapat digunakan keyboard.
- Fokus terlihat (2px + offset) pada semua CTA.
- Alt teks deskriptif untuk foto kandidat, band, pemenang; ornament murni diabaikan screen reader.
- Kontras minimum WCAG AA ditargetkan untuk teks normal/besar dan kontrol; uji hasil UI final.
- Countdown tidak boleh mengirim update screen-reader setiap detik; pengumuman penting punya region `aria-live` terkendali.
- Animasi flashing: hindari strobe lampu >3 kali per detik; marquee bulbs hanya menyala secara hangat.
- Hit target minimum sekitar 44×44px untuk controls kritis pada mobile.
- QR punya teks/kode cadangan untuk verifikasi manual bila kamera bermasalah.
- Error form ditautkan ke field, tidak hanya toast umum.

### 19.4 Performance policy

1. Prioritaskan **konten hero penting** sebelum asset dekoratif.
2. Tirai dan panggung dioptimasi; hindari mengunduh banyak gambar 4K di mobile.
3. `next/image` untuk foto umum/remote berkonfigurasi tepat; jangan memaksa image optimization pada SVG statis tanpa alasan.
4. Lakukan code splitting/dynamic import komponen animasi besar sesuai route: stage hero hanya di beranda, envelope hanya di undangan, candidate stage hanya di voting/preview.
5. Jangan menaruh GSAP dan semua aset scene dalam bundle dashboard.
6. Animasi `transform`, `opacity`; minimalkan repaint/filter mahal; `will-change` dipasang sementara saat animasi, bukan semua komponen permanen.
7. Jangan menjalankan infinite particle simulation bila tab browser tidak aktif; pause/reduce.
8. Hanya satu smooth-scroll engine; Lenis opsional dan tidak dipakai di form/dashboard/check-in.
9. Uji performa di HP menengah dan jaringan lambat. Tetapkan budget transfer gambar dan target Core Web Vitals saat implementasi memakai alat ukur aktual.
10. Jangan menunda verifikasi vote atau check-in hanya untuk menyelesaikan animasi dekoratif.

### 19.5 Resilience UX

- Ketika PNG kandidat transparan gagal dimuat → placeholder netral + nama kandidat tetap dapat dipilih (keputusan UI fallback).
- Ketika video/animasi stage gagal → statis, voting tetap aktif.
- Ketika kamera error/permission denied → tab Manual dapat dipakai.
- Ketika email gagal → peserta tetap mendapatkan PDF yang tersedia dari pendaftaran sukses; Admin dapat kirim ulang.
- Ketika URL voting/undangan token tidak dikenal → error aman, tidak memunculkan data privat.

---

## 20. Sitemap, route contract, dan layout boundaries

### 20.1 Rute publik yang selaras PRD Frontend

| Route | Layout | Komponen utama |
|---|---|---|
| `/` | `(public)` | Navbar, CurtainHeroScene, band, teasers, floating ticket |
| `/fashion-show` | `(public)` | Navbar, EditorialRunway, published winners, floating |
| `/awarding` | `(public)` | Navbar, GoldenMoment, published winners, floating |
| `/daftar` | `(journey)` | TicketSelector |
| `/daftar/[ticketId]` | `(journey)` | RegistrationForm |
| `/daftar/berhasil` | `(journey)` | RegistrationSuccess + PDF download |
| `/vote/[voteToken]` | `(journey)` | Verification, CandidateStage, Confirm, Success |
| `/undangan/[inviteToken]` | `(journey)` | Closed Envelope → paper → QR |

**Catatan:** `(public)` dan `(journey)` merupakan **route groups** Next.js (folder dalam tanda kurung tidak menjadi path URL).

### 20.2 Rute internal

| Route | Komponen/page | Role |
|---|---|---|
| `/panitia/login` | LoginForm | Guest |
| `/panitia` | AdminDashboard | Admin |
| `/panitia/website/beranda` | EditEventContent | Admin |
| `/panitia/website/band` | BandManager | Admin |
| `/panitia/website/fashion-show` | FashionContentManager | Admin |
| `/panitia/website/awarding` | AwardingContentManager | Admin |
| `/panitia/tiket` | TicketManagement | Admin |
| `/panitia/tiket/baru` | TicketEditor | Admin |
| `/panitia/tiket/[id]/edit` | TicketEditor | Admin |
| `/panitia/peserta` | Participants + Archive tabs | Admin |
| `/panitia/peserta/[id]` | ParticipantDetails | Admin |
| `/panitia/voting` | VotingManagement | Admin |
| `/panitia/voting/baru` | VotingEditor | Admin |
| `/panitia/voting/[id]/edit` | VotingEditor | Admin |
| `/panitia/voting/[id]/hasil` | VoteResults | Admin |
| `/panitia/undangan/template` | InvitationTemplateEditor | Admin |
| `/panitia/undangan/dosen` | LecturerInvitationManager | Admin |
| `/panitia/check-in` | Scan QR/Manual/Riwayat | Admin + Petugas |
| `/panitia/akun` | AccountManager | Admin |

**Akses:** setelah login, Petugas Check-in menuju `/panitia/check-in`. Admin ke `/panitia`. Akses direct URL admin oleh Petugas harus ditolak oleh guard (simulasi FE; backend nanti wajib menegakkan otorisasi asli).

### 20.3 Layout boundaries

- `app/layout.tsx`: HTML shell, font/tokens, providers dasar, metadata.
- `(public)/layout.tsx`: navbar + footer + floating CTA **hanya halaman event publik**, tanpa pembuka tirai global.
- `(journey)/layout.tsx`: halaman fokus yang tidak dibebani navbar/tirai/floating CTA publik.
- `(auth)` group: login internal polos.
- `(panitia)/panitia/layout.tsx`: guard role + admin/petugas shell adaptif; konten petugas hanya check-in.
- `not-found.tsx`: halaman tidak ditemukan yang tidak membocorkan identitas.

---
## 21. Struktur folder Next.js lengkap

**Prinsip struktur:** satu aplikasi Next.js yang dapat dikembangkan menjadi full-stack nantinya, tetapi fase pertama hanya membangun frontend memakai **mock service adapter**. Tidak perlu monorepo atau microservice. Folder dipisah menurut **rute**, **fitur**, **komponen UI**, **animasi**, **data mock**, serta **asset**. Nama folder adalah usulan implementasi yang konsisten dengan rute PRD.

### 21.1 Blueprint directory tree (rekomendasi)

```text
memoria-web/
├── README.md
├── package.json
├── package-lock.json                   # bila menggunakan npm
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── .gitignore
├── .env.example                        # variabel publik/mode, BUKAN secrets asli
├── docs/
│   ├── MEMORIA-PRD-FRONTEND-V1-FINAL-BASELINE.md
│   ├── MEMORIA-DESIGN-SYSTEM-AND-FRONTEND-STRUCTURE-V1-FINAL.md
│   ├── asset-inventory.md
│   ├── animation-storyboards.md
│   └── qa-checklist.md
│
├── public/
│   ├── brand/
│   │   ├── memoria-mark.svg
│   │   ├── favicon.svg
│   │   └── og-cover.webp
│   ├── theatre/
│   │   ├── arch.svg
│   │   ├── curtain-left.webp
│   │   ├── curtain-right.webp
│   │   ├── curtain-back.webp
│   │   ├── stage-platform.webp
│   │   ├── stage-mobile-static.webp
│   │   ├── marquee-bulb.svg
│   │   ├── spotlight-cone.svg
│   │   └── stage-shadow.webp
│   ├── ornaments/
│   │   ├── film-strip.svg
│   │   ├── gold-corner.svg
│   │   ├── winner-star.svg
│   │   ├── ticket-perforation.svg
│   │   └── paper-texture.webp
│   ├── invitation/
│   │   ├── envelope-front.svg
│   │   ├── envelope-flap.svg
│   │   ├── wax-seal.svg
│   │   └── invitation-paper.svg
│   └── placeholders/
│       ├── band-placeholder.webp
│       ├── candidate-transparent.webp
│       ├── winner-placeholder.webp
│       └── empty-state.svg
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root <html>, font, providers
│   │   ├── globals.css                 # Tailwind import & design token import
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   │
│   │   ├── (public)/
│   │   │   ├── layout.tsx               # Navbar + footer + floating ticket
│   │   │   ├── page.tsx                 # / — Beranda
│   │   │   ├── fashion-show/
│   │   │   │   └── page.tsx             # /fashion-show
│   │   │   └── awarding/
│   │   │       └── page.tsx             # /awarding
│   │   │
│   │   ├── (journey)/
│   │   │   ├── layout.tsx               # Focused layout; no main navbar
│   │   │   ├── daftar/
│   │   │   │   ├── page.tsx             # /daftar: pilih tiket
│   │   │   │   ├── [ticketId]/
│   │   │   │   │   └── page.tsx         # /daftar/:ticketId: form
│   │   │   │   └── berhasil/
│   │   │   │       └── page.tsx         # /daftar/berhasil
│   │   │   ├── vote/
│   │   │   │   └── [voteToken]/
│   │   │   │       └── page.tsx         # /vote/:voteToken
│   │   │   └── undangan/
│   │   │       └── [inviteToken]/
│   │   │           └── page.tsx         # /undangan/:inviteToken
│   │   │
│   │   ├── (auth)/
│   │   │   └── panitia/
│   │   │       └── login/
│   │   │           └── page.tsx         # /panitia/login
│   │   │
│   │   └── (panitia)/
│   │       └── panitia/
│   │           ├── layout.tsx           # Protected Admin/Check-in shell
│   │           ├── page.tsx             # /panitia: dashboard admin
│   │           ├── website/
│   │           │   ├── beranda/page.tsx
│   │           │   ├── band/page.tsx
│   │           │   ├── fashion-show/page.tsx
│   │           │   └── awarding/page.tsx
│   │           ├── tiket/
│   │           │   ├── page.tsx
│   │           │   ├── baru/page.tsx
│   │           │   └── [id]/edit/page.tsx
│   │           ├── peserta/
│   │           │   ├── page.tsx
│   │           │   └── [id]/page.tsx
│   │           ├── voting/
│   │           │   ├── page.tsx
│   │           │   ├── baru/page.tsx
│   │           │   └── [id]/
│   │           │       ├── edit/page.tsx
│   │           │       └── hasil/page.tsx
│   │           ├── undangan/
│   │           │   ├── template/page.tsx
│   │           │   └── dosen/page.tsx
│   │           ├── check-in/page.tsx
│   │           └── akun/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # Primitives UI bersama
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DateTimeField.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── ResponsiveTable.tsx
│   │   │   ├── FileUploadField.tsx
│   │   │   └── QRCodeView.tsx
│   │   ├── brand/
│   │   │   ├── BrandLogotype.tsx
│   │   │   ├── TheatreArch.tsx
│   │   │   ├── MarqueeBulbs.client.tsx
│   │   │   ├── SpotlightBeam.tsx
│   │   │   ├── FilmStripFrame.tsx
│   │   │   ├── GoldSeal.client.tsx
│   │   │   └── CustomIcon.tsx
│   │   ├── public-layout/
│   │   │   ├── PublicNavbar.client.tsx
│   │   │   ├── PublicFooter.tsx
│   │   │   ├── FloatingTicketCTA.client.tsx
│   │   │   └── PublicPageShell.tsx
│   │   ├── admin-layout/
│   │   │   ├── AdminShell.client.tsx
│   │   │   ├── AdminSidebar.client.tsx
│   │   │   ├── AdminTopbar.tsx
│   │   │   ├── AdminPageHeader.tsx
│   │   │   ├── AdminBreadcrumb.tsx
│   │   │   └── RoleGuard.client.tsx
│   │   └── feedback/
│   │       ├── FormErrorSummary.tsx
│   │       ├── SuccessState.tsx
│   │       └── ForbiddenState.tsx
│   │
│   ├── features/
│   │   ├── event/
│   │   │   ├── components/
│   │   │   │   ├── CurtainHeroScene.client.tsx
│   │   │   │   ├── HeroEventInfo.tsx
│   │   │   │   ├── Countdown.client.tsx
│   │   │   │   ├── BandShowcase.client.tsx
│   │   │   │   ├── BandItem.tsx
│   │   │   │   ├── FashionTeaser.tsx
│   │   │   │   └── AwardingTeaser.tsx
│   │   │   ├── animations/
│   │   │   │   ├── curtainTimeline.ts
│   │   │   │   ├── heroRevealTimeline.ts
│   │   │   │   └── bandScrollTimeline.ts
│   │   │   ├── hooks/useHeroIntro.ts
│   │   │   ├── services/event.service.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── winners/
│   │   │   ├── components/
│   │   │   │   ├── WinnerCard.tsx
│   │   │   │   ├── FashionRunway.client.tsx
│   │   │   │   └── AwardingGallery.client.tsx
│   │   │   ├── animations/winnerReveal.ts
│   │   │   ├── services/winners.service.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── components/
│   │   │   │   ├── TicketSelector.tsx
│   │   │   │   ├── VintageTicketCard.client.tsx
│   │   │   │   ├── TicketEditorForm.client.tsx
│   │   │   │   ├── TicketListTable.client.tsx
│   │   │   │   └── TicketPDFPreview.tsx
│   │   │   ├── services/tickets.service.ts
│   │   │   ├── utils/ticketAvailability.ts
│   │   │   ├── schemas/ticket.schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── registration/
│   │   │   ├── components/
│   │   │   │   ├── RegistrationForm.client.tsx
│   │   │   │   ├── RegistrationSuccess.client.tsx
│   │   │   │   └── TicketDownloadButton.client.tsx
│   │   │   ├── services/registration.service.ts
│   │   │   ├── schemas/registration.schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── participants/
│   │   │   ├── components/
│   │   │   │   ├── ParticipantTable.client.tsx
│   │   │   │   ├── ParticipantDetail.tsx
│   │   │   │   ├── ParticipantEditor.client.tsx
│   │   │   │   ├── ParticipantArchiveTabs.client.tsx
│   │   │   │   ├── TwoStepEditDialog.client.tsx
│   │   │   │   ├── TwoStepArchiveDialog.client.tsx
│   │   │   │   └── RestoreParticipantDialog.client.tsx
│   │   │   ├── services/participants.service.ts
│   │   │   ├── utils/exportParticipantsXlsx.ts
│   │   │   ├── schemas/participant.schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── voting/
│   │   │   ├── components/
│   │   │   │   ├── VoteAccessForm.client.tsx
│   │   │   │   ├── VotingStage.client.tsx
│   │   │   │   ├── CandidateFigure.client.tsx
│   │   │   │   ├── CandidateNavigation.client.tsx
│   │   │   │   ├── CandidateChoice.client.tsx
│   │   │   │   ├── VoteConfirmDialog.client.tsx
│   │   │   │   ├── VoteSuccess.client.tsx
│   │   │   │   ├── VotingEditor.client.tsx
│   │   │   │   ├── CandidateEditor.client.tsx
│   │   │   │   ├── VotingStagePreview.client.tsx
│   │   │   │   └── VotingResults.client.tsx
│   │   │   ├── animations/
│   │   │   │   ├── candidateMotion.ts
│   │   │   │   ├── spotlightTransition.ts
│   │   │   │   └── goldVoteSuccess.ts
│   │   │   ├── services/voting.service.ts
│   │   │   ├── utils/voteSchedule.ts
│   │   │   ├── schemas/voting.schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── invitations/
│   │   │   ├── components/
│   │   │   │   ├── InvitationEnvelope.client.tsx
│   │   │   │   ├── InvitationPaper.tsx
│   │   │   │   ├── InvitationQR.tsx
│   │   │   │   ├── InvitationTemplateEditor.client.tsx
│   │   │   │   ├── LecturerInvitationTable.client.tsx
│   │   │   │   └── LecturerEditor.client.tsx
│   │   │   ├── animations/envelopeOpenTimeline.ts
│   │   │   ├── hooks/useEnvelopeState.ts
│   │   │   ├── services/invitations.service.ts
│   │   │   ├── schemas/lecturer.schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── check-in/
│   │   │   ├── components/
│   │   │   │   ├── CheckInScreen.client.tsx
│   │   │   │   ├── QRScanner.client.tsx
│   │   │   │   ├── ManualCheckIn.client.tsx
│   │   │   │   ├── AttendeeIdentityCard.tsx
│   │   │   │   ├── CheckInSuccess.tsx
│   │   │   │   └── CheckInHistory.client.tsx
│   │   │   ├── services/checkIn.service.ts
│   │   │   ├── utils/checkInDisplay.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── accounts/
│   │   │   ├── components/
│   │   │   │   ├── AccountTable.client.tsx
│   │   │   │   ├── AccountEditor.client.tsx
│   │   │   │   └── ResetPasswordDialog.client.tsx
│   │   │   ├── services/accounts.service.ts
│   │   │   ├── schemas/account.schema.ts
│   │   │   └── types.ts
│   │   │
│   │   └── auth/
│   │       ├── components/LoginForm.client.tsx
│   │       ├── hooks/useCurrentRole.ts
│   │       ├── services/auth.service.ts
│   │       └── types.ts
│   │
│   ├── lib/
│   │   ├── animations/
│   │   │   ├── gsapClient.ts             # lazy/guarded GSAP registration
│   │   │   ├── motionTokens.ts
│   │   │   ├── prefersReducedMotion.ts
│   │   │   └── useSceneLifecycle.ts
│   │   ├── date/
│   │   │   ├── formatWib.ts
│   │   │   └── parseEventDateTime.ts
│   │   ├── format/
│   │   │   ├── formatPhone.ts
│   │   │   └── formatCount.ts
│   │   ├── security/
│   │   │   └── clientDisplayGuards.ts    # UX guards; NOT backend auth
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   └── downloadFile.ts
│   │   └── constants/
│   │       ├── routes.ts
│   │       ├── uiCopy.ts
│   │       └── brand.ts
│   │
│   ├── data/
│   │   ├── mock/
│   │   │   ├── seedEvent.ts
│   │   │   ├── seedBands.ts
│   │   │   ├── seedTickets.ts
│   │   │   ├── seedParticipants.ts
│   │   │   ├── seedVotes.ts
│   │   │   ├── seedWinners.ts
│   │   │   ├── seedLecturers.ts
│   │   │   ├── seedAccounts.ts
│   │   │   ├── demoClock.ts
│   │   │   └── mockStore.ts
│   │   └── adapters/
│   │       ├── index.ts                 # service facade; memilih mock mode
│   │       ├── event.adapter.ts
│   │       ├── ticket.adapter.ts
│   │       ├── participant.adapter.ts
│   │       ├── voting.adapter.ts
│   │       ├── invitation.adapter.ts
│   │       ├── checkin.adapter.ts
│   │       └── account.adapter.ts
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── public.css
│   │   ├── admin.css
│   │   ├── theatre.css
│   │   ├── voting-stage.css
│   │   └── invitation-envelope.css
│   ├── types/
│   │   ├── common.ts
│   │   ├── role.ts
│   │   └── status.ts
│   └── providers/
│       ├── AppProviders.client.tsx
│       ├── MockDataProvider.client.tsx
│       └── ToastProvider.client.tsx
│
└── tests/
    ├── unit/
    │   ├── ticketAvailability.test.ts
    │   ├── voteSchedule.test.ts
    │   ├── participantIdentity.test.ts
    │   └── archivedVote.test.ts
    ├── integration/
    │   ├── registrationFlow.test.tsx
    │   ├── votingFlow.test.tsx
    │   ├── invitationFlow.test.tsx
    │   ├── checkInFlow.test.tsx
    │   └── archiveRestoreFlow.test.tsx
    └── e2e/
        ├── publicNavigation.spec.ts
        ├── eventRegistration.spec.ts
        ├── privateVote.spec.ts
        ├── lecturerInvitation.spec.ts
        └── panitiaCheckIn.spec.ts
```

> **Penjelasan:** tree di atas adalah **arsitektur rencana**, bukan klaim seluruh file sudah dibuat. Bisa disederhanakan bertahap ketika implementasi pertama; jangan membuat file kosong yang tidak digunakan hanya untuk meniru pohon folder.

### 21.2 Folder yang *tidak* perlu dibuat pada fase frontend

- `src/app/api/` untuk endpoint bisnis nyata — baru nanti saat PRD Backend.
- `src/server/db/`, ORM schema, migrations, token signer, email provider, storage provider — bukan lingkup frontend.
- `microservices/`, `wallet/`, `payments/`, `merchant/` — tidak relevan dengan event MEMORIA.
- Paket 3D besar (`three`, `@react-three/fiber`) bila efek stage telah cukup dengan SVG/CSS/GSAP.

### 21.3 Konvensi nama file dan aturan ketergantungan

- `page.tsx` hanya menghubungkan route ke view/data; bukan tempat menyimpan seluruh form 400 baris.
- Komponen dengan interaksi browser (kamera, GSAP, form, carousel) menggunakan Client Component jelas (`.client.tsx` adalah **konvensi nama proyek**, bukan syarat Next.js; tetap butuh `'use client'`).
- `services/*.service.ts` memanggil interface/adapter, tidak mengimpor langsung `seed*.ts` dari UI.
- `data/mock/` adalah sumber mock terpusat; semua fitur memakai satu store agar kuota/vote/check-in tidak berbeda antarhalaman.
- `data/adapters/` memberikan kontrak yang bisa diganti API setelah backend selesai, tanpa menulis ulang komponen presentasional.
- `styles/` menyimpan CSS material, typography global, panggung, envelope; **hindari** CSS global per fitur yang mengubah semua `button`/`img` tanpa scope.
- Folder `assets` di `public/` hanya untuk aset statis/original; foto yang diunggah oleh Admin dalam demo cukup di mock store/object URLs, tidak dipaksa masuk `public/` secara dinamis.
- `test` dikelompokkan per aturan penting dan alur pengguna, bukan hanya snapshot kosmetik.

---

## 22. Tanggung jawab file, data layer, dan mock mode

### 22.1 Pendekatan Next.js yang disarankan

- Satu root layout, beberapa **route groups** untuk publik/focused/admin, bukan banyak project terpisah.
- Server Components untuk shell statis/routing dan composable UI tanpa event handler.
- Client Components hanya di tempat membutuhkan state, GSAP, kamera, interaksi form, browser API, atau mock store interaktif.
- **Tidak boleh** menampilkan dashboard data pribadi melalui route yang tidak terproteksi saat backend sudah hidup. Guard FE cuma untuk demo UX, bukan keamanan sebenarnya.

### 22.2 Adapter contract dalam mock phase

Setiap feature service sebaiknya memiliki interface metode yang akan tetap masuk akal ketika backend ditambahkan:

| Domain | Metode konseptual | Return status minimum |
|---|---|---|
| Event | `getEvent`, `saveEvent`, `listBands`, `saveBand` | success/error |
| Tickets | `listPublishedTickets`, `getTicket`, `createTicketType`, `updateTicketType` | draft/available/full/closed |
| Registration | `registerParticipant`, `getSuccessContext`, `downloadTicket` | registered/duplicateNim/full/invalid |
| Participants | `list`, `get`, `edit`, `archive`, `restore`, `resendEmail`, `exportXlsx` | active/archived/failed |
| Voting | `getPrivateVote`, `verifyVoter`, `castVote`, `listVoting`, `getResults` | scheduled/active/ended/alreadyVoted |
| Invitations | `saveTemplate`, `listLecturers`, `addLecturer`, `openInvite`, `resendEmail` | active/duplicateEmail/invalid |
| Check-in | `lookupQr`, `lookupManual`, `confirmAttendance`, `listHistory` | valid/alreadyCheckedIn/notFound/archived |
| Accounts/Auth | `login`, `logout`, `create`, `edit`, `resetPassword`, `toggleActive` | authenticated/forbidden/invalid |

**Tidak menganggap ini API final.** HTTP routes, payload schema, authorization, dan transaction semantics ditentukan pada PRD Backend kelak. Frontend menyiapkan seam/adapter sehingga tidak bergantung pada implementasi mock.

### 22.3 Entity mock minimum

| Entity | Field penting | Identitas stabil |
|---|---|---|
| `EventContent` | title, tagline, description, eventAt, venue, teasers, media | `eventId` |
| `Band` | name, photo, description, order | `bandId` |
| `TicketType` | name, quota?, registrationWindow, publishStatus | `ticketTypeId` |
| `Participant` | name, nim, program, faculty, phone, email, ticketTypeId, status | `participantId` |
| `TicketIdentity` | ticketNo, voteCode, checkInQrToken, participantId | **Tidak berubah saat edit NIM** |
| `VotePoll` | title, description, openAt, closeAt, token, status | `votingId` |
| `Candidate` | name, transparentPhoto, description, pollId | `candidateId` |
| `VoteRecord` | participantId, votingId, candidateId, castAt | `voteRecordId` + uniqueness pair |
| `WinnerAnnouncement` | category, name, photo, description, draft/published, pageType | `winnerId` |
| `LecturerInvite` | name, email, phone, inviteToken, inviteCode, qrToken, attendance | `lecturerId` |
| `CheckInRecord` | visitorType, visitorId, method, checkedInAt, staffId | `checkinId` |
| `InternalUser` | name, email, role, active, initial-password simulation only | `userId` |

### 22.4 Mock store invariants

1. NIM unik **di seluruh peserta aktif maupun arsip**.
2. Satu Participant punya satu TicketIdentity; edit NIM **tidak** membuat identitas baru.
3. `VoteRecord` unik pada pasangan `(participantId, votingId)`.
4. Vote yang sudah ada **tetap dihitung saat arsip**, tetapi peserta arsip tidak boleh vote baru.
5. CheckInRecord satu kehadiran pertama per pengunjung; waktu pertama stabil.
6. Arsip memulihkan kuota, restore membutuhkan kapasitas yang tersedia.
7. Peserta arsip tetap tercatat dalam audit, tetapi tidak dihitung sebagai peserta aktif.
8. `Candidate` add/edit/delete hanya jika total suara poll = 0.
9. `WinnerAnnouncement` Published tampil publik; Draft tidak.
10. Voting aktif ditentukan waktu WIB; tidak manual buka/tutup.
11. Check-in tanpa batas waktu penutupan otomatis.
12. Undangan dosen satu email satu undangan aktif.
13. Dashboard petugas hanya check-in; role dinilai di guard dan action mock.

### 22.5 File upload mock

- Upload foto band/kandidat/winner dalam demo bisa menggunakan input file dan `URL.createObjectURL` untuk preview, serta metadata yang disimpan di mock store selama sesi.
- Jika membutuhkan persist lintas reload untuk demo, tentukan format penyimpanan yang dibatasi ukuran dan tanpa rahasia; **jangan menyimpan binary besar, password, atau token privat secara sembarangan di localStorage**.
- Saat integrasi backend nanti, foto akan menggunakan storage service dan URL resmi; desain UI upload tidak perlu berubah drastis.

### 22.6 Email & QR di FE-only

- Tombol email pada fase frontend: **simulasi** sukses/gagal yang jelas; jangan menampilkan toast `Email terkirim` seolah sudah benar-benar dikirim ke internet.
- Tombol WhatsApp: bila menggunakan `wa.me`/tautan resmi, dapat membuka pesan prefilled; statusnya `WhatsApp dibuka`, **bukan** `Pesan terkirim`.
- QR generation pada demo harus dari token mock yang stabil dan dapat dipakai mock scan; validasi produksi dilakukan server nanti.
- QR camera dapat memakai integrasi browser/komponen scanner ketika implementasi frontend dimulai, namun pencatatan kehadiran FE-only tetap simulasi terkoordinasi.

---
## 23. Contoh design tokens dan konfigurasi awal

Bagian ini adalah **contoh baseline implementasi**, bukan aplikasi yang sudah dibuat. Token yang disepakati disajikan konsisten supaya tidak di-hardcode di puluhan komponen. Untuk Tailwind CSS versi modern, gunakan `@theme` bila sesuai versi yang dipilih ketika proyek diinisialisasi; jika versi lain, adaptasikan konfigurasi tanpa mengganti nilai identitas visual.

### 23.1 `src/styles/tokens.css` — contoh isi

```css
/* Design tokens MEMORIA — contoh awal; sesuaikan dengan setup Tailwind. */
:root {
  /* Brand */
  --memoria-burgundy: #891523;
  --memoria-antique-gold: #D6B46A;
  --memoria-midnight: #140809;
  --memoria-dark-wine: #350A10;
  --memoria-stage-red: #B52735;
  --memoria-ivory: #F5E9D3;
  --memoria-champagne: #EACFA4;
  --memoria-copper: #B87545;
  --memoria-dusty-rose: #A98A8F;
  --memoria-soft-white: #FFF9F0;
  --memoria-deep-plum: #24131B;

  /* Admin */
  --admin-canvas: #F8F9FB;
  --admin-surface: #FFFFFF;
  --admin-text: #252932;
  --admin-muted: #6B7280;
  --admin-border: #E5E7EB;
  --admin-accent-tint: #FAEDEF;

  /* Functional */
  --status-success: #2E8B67;
  --status-warning: #C58C32;
  --status-error: #C94E57;
  --status-info: #497FA6;

  /* Type: assign real font variables from next/font in layout */
  --font-ballet-family: var(--font-ballet), cursive;
  --font-bodoni-family: var(--font-bodoni), Georgia, serif;
  --font-dm-family: var(--font-dm-sans), Arial, sans-serif;

  /* Radius */
  --radius-field: 8px;
  --radius-button: 12px;
  --radius-card: 16px;
  --radius-panel: 24px;

  /* Motion */
  --motion-micro: 180ms;
  --motion-component: 320ms;
  --motion-reveal: 720ms;

  /* Layers */
  --z-nav: 50;
  --z-floating: 60;
  --z-sheet: 70;
  --z-dialog: 90;
  --z-toast: 100;
  --z-intro: 110;
}
```

### 23.2 `src/app/globals.css` — contoh pemetaan Tailwind

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@theme inline {
  --color-memoria-burgundy: var(--memoria-burgundy);
  --color-memoria-gold: var(--memoria-antique-gold);
  --color-memoria-midnight: var(--memoria-midnight);
  --color-memoria-ivory: var(--memoria-ivory);
  --color-admin-canvas: var(--admin-canvas);
  --color-admin-text: var(--admin-text);
  --font-brand: var(--font-ballet-family);
  --font-display: var(--font-bodoni-family);
  --font-ui: var(--font-dm-family);
}

body {
  font-family: var(--font-dm-family);
}

:focus-visible {
  outline: 2px solid var(--memoria-burgundy);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
  }
}
```

**Penting saat implementasi:** contoh memakai nama variabel berbeda (`--font-ballet-family` sebagai sumber, `--font-brand` sebagai utility Tailwind) supaya tidak terjadi referensi melingkar. `next/font` harus memasang class/variable font pada layout utama; sesuaikan import `@theme` dengan versi Tailwind yang benar-benar dipakai.

### 23.3 contoh kelas semantik (tanpa membuat component library kaku)

```css
.public-page {
  background: var(--memoria-midnight);
  color: var(--memoria-ivory);
}

.admin-page {
  background: var(--admin-canvas);
  color: var(--admin-text);
}

.gold-frame {
  border: 1px solid var(--memoria-antique-gold);
}

.ticket-float {
  position: fixed;
  right: 16px;
  bottom: max(16px, env(safe-area-inset-bottom) + 12px);
  z-index: var(--z-floating);
}

.qr-print-safe {
  background: white;
  color: black;
  padding: 12px; /* mempertahankan quiet zone visual */
}
```

### 23.4 TypeScript design contracts (konseptual)

```ts
export type InternalRole = "ADMIN" | "CHECKIN_STAFF";
export type AttendanceStatus = "NOT_CHECKED_IN" | "PRESENT";
export type ParticipantStatus = "ACTIVE" | "ARCHIVED";
export type WinnerStatus = "DRAFT" | "PUBLISHED";
export type VotingPhase = "DRAFT" | "SCHEDULED" | "ACTIVE" | "ENDED";

export interface StableTicketIdentity {
  participantId: string;  // immutable relation key
  ticketNo: string;       // immutable on NIM edit
  voteCode: string;       // immutable on NIM edit
  checkInQrToken: string; // immutable on NIM edit
}
```

**Tidak ada** field `NOT_PRESENT` otomatis: check-in tidak pernah memiliki penutupan yang akan menetapkan absen. `emailSendStatus` tidak perlu dibuat sebagai kolom tabel permanen hanya demi desain.

### 23.5 Dependency intent (jangan mengunci nomor versi sebelum setup)

| Paket | Peran | Timing |
|---|---|---|
| `next`, `react`, `react-dom`, `typescript` | Framework | Awal setup |
| `tailwindcss` | Styling | Awal setup |
| `gsap`, `@gsap/react` | Animasi panggung & SVG | Saat membuat public experience |
| `@phosphor-icons/react` | Ikon | Awal komponen UI |
| `zod` / form helper pilihan tim | Validasi form | Saat form dibuat |
| `react-hook-form` (opsional) | Pengelolaan form kompleks | Jika membantu |
| Library QR renderer pilihan tim | Gambar kode QR | Saat tiket/undangan dibuat |
| Library scanner browser pilihan tim | Camera QR | Saat Check-in |
| Library PDF pilihan tim | Generate e-ticket | Saat ticket success |
| Library XLSX pilihan tim | Ekspor Excel valid `.xlsx` | Saat Data Peserta |
| Test runner + E2E runner | QA | Sejak fitur awal diuji |

Versi dan compatibility matrix dikunci saat **implementasi**, bukan menebak versi dependency sekarang. Hindari memasang Rive/Three hanya untuk sekadar dicantumkan dalam stack.

---

## 24. Aturan interaksi serta invariant bisnis lintas halaman

Bagian ini merupakan *design-to-PRD traceability*: desain tidak boleh merusak apa yang sudah disepakati dalam brainstorming.

| ID | Keputusan locked | Implikasi desain & interaksi |
|---|---|---|
| UX-01 | Mahasiswa dan dosen tidak punya login | Jangan tampilkan `Daftar Akun` atau `Masuk` bagi pengunjung publik |
| UX-02 | Hanya Admin dan Petugas Check-in yang login | Login internal polos, akses sesuai role |
| UX-03 | Navbar publik hanya Beranda/Fashion Show/Awarding | Jangan otomatis menambah nav voting/undangan/section tiket |
| UX-04 | Tiket floating kanan bawah | Bukan section paling bawah atau menu navbar |
| UX-05 | Beberapa jenis tiket **gratis** | Tiket page list, tidak ada payment gateway |
| UX-06 | Satu NIM satu tiket seluruh MEMORIA | Form mengecek unik NIM melintasi semua jenis tiket |
| UX-07 | Nama boleh sama; email/HP mahasiswa tidak wajib unik | Jangan memblokir duplikasi nama/email/HP tanpa alasan lain |
| UX-08 | Prodi dan Fakultas locked | Input read-only yang jelas, tetap tampil dan ikut PDF |
| UX-09 | Registrasi sukses → PDF langsung + kirim email | Halaman sukses tanpa menunggu hasil email |
| UX-10 | Tidak perlu status pengiriman email permanen | Tidak ada badge `Email Terkirim` di setiap row |
| UX-11 | Foto/vote private | Link token voting + NIM dan kode unik tiket |
| UX-12 | Satu suara per judul voting | Konfirmasi final, menolak cast ganda |
| UX-13 | Voting otomatis mengikuti jadwal | Status Draft/Terjadwal/Aktif/Selesai, tanpa tombol manual buka/tutup wajib |
| UX-14 | Kandidat bisa edit sebelum suara pertama | Tombol edit tersedia hanya `totalVotes = 0`, lalu terkunci |
| UX-15 | Hasil suara bukan auto winner | Pengumuman Fashion/Awarding manual Draft/Published |
| UX-16 | Foto kandidat **transparent/no background** | Preview di checkerboard dan panggung, podium spotlight |
| UX-17 | Kandidat berputar/berayun di stage | GSAP rotasi terbatas untuk PNG 2D, bukan full 360 palsu |
| UX-18 | Undangan dosen mulai tertutup | Click `Buka Undangan` baru memicu animation |
| UX-19 | Satu email dosen = satu undangan aktif | Form tambah menolak email duplicate |
| UX-20 | QR dosen/mahasiswa berbeda identitas | QR personal dan code vote jangan disamakan |
| UX-21 | Check-in QR dan Manual | Manual mahasiswa NIM; dosen email/kode |
| UX-22 | Check-in bebas kapan saja | Tidak ada tombol tutup, tidak ada auto `Tidak Hadir` |
| UX-23 | Keberhasilan check-in mencatat tanggal + waktu pertama | Scan ulang tidak overwrite timestamp |
| UX-24 | Data Peserta punya voting dinamis | Tidak membuat tiga kolom Vote 1/2/3 secara hardcode |
| UX-25 | Edit dan Arsip harus **2 tahap verifikasi** | Dialog preview + password admin (arsip juga ketik `HAPUS`) |
| UX-26 | Hapus peserta = arsip, bukan hard delete | Tab Arsip, kuota kembali, QR/vote baru ditolak |
| UX-27 | Restore boleh jika kapasitas ada | Tombol pulihkan + konfirmasi kapasitas |
| UX-28 | Suara peserta arsip tetap dihitung | Grafik hasil tidak berubah sewaktu arsip |
| UX-29 | NIM edit tidak ganti ticketNo/voteCode/QR | PDF baru hanya teks NIM berubah, kode tetap |
| UX-30 | Admin desain polos | Tidak menambah animasi parallax/panggung ke seluruh admin |
| UX-31 | Ekspor Data Peserta Excel saja | Tombol `Ekspor Excel`, bukan CSV |

### 24.1 Jika muncul perubahan desain baru

1. Tunjukkan dampak pada UX-xx di atas.
2. Jika melanggar keputusan LOCKED, **mintakan ACC perubahan** sebelum implementasi.
3. Perbarui PRD Frontend jika fitur/alur berubah; perbarui dokumen ini jika hanya gaya/animasi berubah.
4. Jangan melompat ke PRD Backend hanya untuk menyelesaikan masalah styling.

---

## 25. QA visual, animasi, responsivitas, dan handoff

### 25.1 Test suite visual publik

| ID | Uji | Hasil yang diharapkan |
|---|---|---|
| VD-01 | Beranda pertama kali dibuka | Tirai awal tertutup lalu membuka; hero terbaca |
| VD-02 | Beranda dibuka ulang pada sesi sama (jika usulan diterapkan) | Intro tidak memaksa replay panjang |
| VD-03 | Disable animations/reduced-motion | Konten hero, countdown, tiket tetap tersedia |
| VD-04 | Mobile 320–390px | MEMORIA tidak keluar viewport, CTA tidak menutupi metadata |
| VD-05 | Masuk Fashion Show | Navbar menuju halaman baru, bukan scroll anchor |
| VD-06 | Masuk Awarding | Kategori hanya Published yang terlihat |
| VD-07 | Band lebih dari 3 | Alternating layout tetap rapi tanpa hardcode |
| VD-08 | Band kosong | Tidak ada foto/nama dummy yang muncul |
| VD-09 | Floating ticket ada jenis Published | Posisi kanan bawah + buka `/daftar` |
| VD-10 | Semua ticket Draft | Floating CTA tidak muncul |
| VD-11 | Hover/focus public CTA | Warna, border, dan animasi konsisten |
| VD-12 | Semua foto high contrast | Foto tetap terlihat, teks tidak tertutup vignette |

### 25.2 Test suite tiket dan formulir

| ID | Uji | Hasil |
|---|---|---|
| VD-13 | Banyak jenis tiket gratis | Grid adaptif + status kuota terbaca |
| VD-14 | Tiket penuh | Tombol pilih tidak aktif, alasan terlihat |
| VD-15 | Form error NIM duplikat | Error inline, tidak hilangkan field lain |
| VD-16 | Input di mobile | Keyboard tidak menutupi CTA/field penting |
| VD-17 | Registrasi berhasil | Unduh PDF dapat dilakukan tanpa menunggu email |
| VD-18 | PDF setelah edit NIM | NIM baru, ticketNo/voteCode/QR identik |
| VD-19 | QR PDF pada perangkat | QR high contrast dan zona putih cukup |
| VD-20 | Email gagal simulasi | Registrasi dan tombol PDF tetap berhasil |

### 25.3 Test suite voting — stage

| ID | Uji | Hasil |
|---|---|---|
| VD-21 | Vote link valid aktif | Form NIM + kode terlihat sebelum stage kandidat |
| VD-22 | Foto kandidat transparan | Figur berdiri di atas panggung, tidak ada background kotak |
| VD-23 | Spotlight pada kandidat | Sorot terang, teks keterangan tetap terbaca |
| VD-24 | Kandidat idle | Rotasi/ayunan halus, bukan flip 360 terlihat terbalik |
| VD-25 | Pilih kandidat | Putaran berhenti, pilihan ditandai jelas |
| VD-26 | Next/prev keyboard | Semua kandidat dapat dilihat tanpa mouse |
| VD-27 | Semua kandidat | Skala/sorot/durasi setara; tidak ada visual favorit bawaan |
| VD-28 | Konfirmasi & submit | Tidak ada sukses sebelum tindakan benar-benar selesai |
| VD-29 | Vote tersimpan | Gold seal singkat + pesan sukses |
| VD-30 | Sudah vote | Tidak muncul CTA ulang walau refresh |
| VD-31 | Vote closed/scheduled | Stage tidak dapat digunakan memilih suara |
| VD-32 | Reduced motion | Figur statis, vote tetap berfungsi |
| VD-33 | Foto gagal load | Placeholder adil, label/aksi tetap jelas |

### 25.4 Test suite undangan dosen

| ID | Uji | Hasil |
|---|---|---|
| VD-34 | Pertama membuka link undangan | Amplop tertutup, tombol `Buka Undangan` terlihat |
| VD-35 | Tidak ada klik | Amplop **tidak** otomatis membuka |
| VD-36 | Klik tombol | Flap buka, surat keluar, layar beralih ke surat |
| VD-37 | Keyboard Enter/Space | Sama dengan klik mouse |
| VD-38 | Reduced motion | Klik langsung menampilkan isi lengkap |
| VD-39 | Surat panjang | Scroll normal, font 16px nyaman, tidak terpotong |
| VD-40 | `Lihat QR Undangan` | Fokus/scroll ke QR, mudah ditemukan |
| VD-41 | QR dibuka pada HP | Hitam putih, tanpa dekorasi menutupi, bisa dipindai |
| VD-42 | Token salah | Tampil error aman, nama dosen tidak bocor |

### 25.5 Test suite admin & petugas

| ID | Uji | Hasil |
|---|---|---|
| VD-43 | Login Admin | Sidebar 8 menu, style minimal |
| VD-44 | Login Petugas | Hanya Check-in dan Keluar |
| VD-45 | Dashboard loading | Skeleton netral, tidak ada cinematic intro |
| VD-46 | Editor kandidat | Preview checkerboard dan panggung, upload jelas |
| VD-47 | Kandidat setelah 1 suara | Edit/add/delete terkunci dengan alasan |
| VD-48 | Email ulang tiket/dosen | Feedback langsung, tidak membuat kolom permanen |
| VD-49 | Edit Data dua tahap | Preview perubahan lalu admin password |
| VD-50 | Arsip dua tahap | Konfirmasi dampak + password + `HAPUS` |
| VD-51 | Arsip & restore | Kapasitas berubah, histori tidak hilang |
| VD-52 | QR peserta arsip | Tidak dapat Hadirkan |
| VD-53 | Scan dua kali | Waktu hadir pertama tidak berubah |
| VD-54 | Camera permission denied | Manual search bisa dipakai |
| VD-55 | Ekspor XLSX | Berkas valid, kolom suara dinamis dan nol depan NIM terjaga |
| VD-56 | Check-in mobile | Tombol Hadirkan besar dan mudah dicapai |
| VD-57 | Fokus keyboard admin | Border/focus visible, dialog aman |
| VD-58 | Data sangat panjang | Tabel responsif tanpa hilangnya detail penting |

### 25.6 Proses review UI

- Review tiap halaman desktop dan mobile, **bukan hanya screenshot hero**.
- Review stage pada perangkat low/mid-end dan browser populer; bukan hanya mesin developer cepat.
- Uji screenshot/visual regression ketika mengubah token dan layout.
- Periksa bahwa perubahan konten panitia di mock store tercermin pada halaman publik.
- Audit tab keyboard, fokus, reduced motion, ukuran target sentuh, dan screen reader labels.
- Verifikasi foto upload benar-benar transparan saat dipakai di stage.
- Ukur interaksi check-in dan form sebelum menambah layer animasi lagi.

---

## 26. Urutan implementasi frontend dan definition of done

**Prinsip:** terapkan desain ini **setelah** PRD Frontend baseline, tanpa membangun API/backend terlebih dahulu. Implementasi dapat dilakukan bertahap tetapi tidak boleh memalsukan status produksi.

### 26.1 Phase 0 — Setup & foundations

1. Inisialisasi Next.js App Router, TypeScript, Tailwind, lint, test skeleton.
2. Masukkan PRD dan Design System ke `docs/`.
3. Siapkan font resmi dan design tokens, shared primitives, toasts, modal, form fields.
4. Buat route/layout groups publik, focused journey, admin.
5. Buat model data dan **mock store terpusat** + adapters.
6. Pastikan seluruh route render static placeholder yang tidak menipu pengguna.

### 26.2 Phase 1 — Admin minimal + data pipeline

1. Login mock + RoleGuard.
2. Admin shell / sidebar / halaman Dashboard.
3. Kelola Website: hero + band + teaser + winners draft/publish.
4. Ticket manager dan participant manager dengan field/kuota/status.
5. Voting manager dengan kandidat/jadwal/hasil.
6. Undangan template dan daftar dosen.
7. Akun internal, arsip/pulihkan, export XLSX.
8. Check-in scanner/manual mock.

**Kenapa admin didahulukan sebagian?** Karena **seluruh konten halaman publik harus berasal dari data yang dibuat panitia**, bukan data ditanam dalam hero JSX. Namun hero visual dapat dikembangkan paralel memakai data mock interface yang sama.

### 26.3 Phase 2 — Public functional journey

1. Navbar, halaman Beranda, Fashion Show, Awarding dengan data mock.
2. Floating CTA → tiket list → form → success.
3. Tiket PDF preview/download + QR dan kode voting.
4. Voting verification + pemilihan kandidat + simpan suara (tanpa animasi berat dulu).
5. Undangan personal dosen + QR dan tautan.
6. Check-in QR/manual terhubung ke mock data yang sama.
7. Uji semua lintas fitur sebelum menambah motion besar.

### 26.4 Phase 3 — Cinematic visuals & motion

1. Produksi aset panggung original yang legal.
2. Implementasi theatre arch + curtain layers + GSAP opening.
3. Band editorial reveal / spotlight/film strip.
4. Fashion & Awarding golden reveal.
5. Vintage ticket card micro-interactions.
6. VotingStage: foto transparan + spotlight + limited rotateY + gold vote success.
7. EnvelopeScene: **klik** buka → flap → kertas → surat.
8. Optimasi mobile/reduced motion/performance; polish interaksi custom icon.

### 26.5 Phase 4 — QA & frontend freeze

- Jalankan scenario PRD + VD-01 s.d. VD-58.
- Uji role, navigasi, form, status, email mock feedback, PDF QR, vote one-time, kandidat locked, NIM edit immutable identity, check-in no cutoff, arsip restore.
- Review semua state: loading, empty, success, error, disabled, token invalid, network mock failure.
- Periksa assets/kontras/typography/mobile.
- Setelah frontend baseline dinilai aman, **baru** masuk brainstorming PRD Backend, database, auth real, email API, storage/QR validation, dan integrasi.

### 26.6 Definition of done untuk halaman

Satu halaman dianggap selesai bila:

- Semua data dan label yang menurut PRD dinamis memang diambil dari mock store.
- Navbar/CTA tepat dan aman terhadap role.
- Semua aksi memiliki feedback yang benar serta state error/loading/empty.
- UI mengikuti token dan komponen bersama; tidak ada style acak yang bertentangan.
- Desktop/mobile dan reduced-motion berfungsi.
- Animasi dibersihkan pada route transition, tidak menahan interaksi.
- Tidak ada konten pribadi yang bocor melalui route/query/preview.
- Skenario terkait PRD/Design QA lulus.

---

## 27. Checklist aset, risiko, dan keputusan yang belum dibekukan

### 27.1 Asset production checklist

- [ ] Wordmark MEMORIA menggunakan Ballet dengan tipografi yang jelas pada desktop/mobile.
- [ ] Foto panggung original/background legal, bukan screenshot ber-watermark.
- [ ] Layer curtain-left, curtain-right, back curtain, stage, marquee, spotlight disiapkan terpisah.
- [ ] Mobile fallback stage lebih ringan dan tetap menampilkan informasi hero.
- [ ] Ornament film strip/gold corners/vector icon suite konsisten.
- [ ] Tiket perforated dan undangan envelope SVG mempunyai state terpisah.
- [ ] Foto kandidat contoh transparan untuk uji stage (bukan identitas orang sungguhan tanpa izin).
- [ ] Placeholder band/pemenang/kandidat untuk empty image state.
- [ ] QR test assets hitam-putih, quiet zone jelas.

### 27.2 Risiko desain & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Tirai terlalu berat | Hero lambat/lag di HP | Layer optimal, reduced motion, static mobile fallback |
| Font Ballet terlalu sulit dibaca | Nama acara tidak terbaca | Besar hanya pada logo; teks semantik/fallback jelas |
| Kandidat PNG diputar 360° | Tampak seperti karton tipis | Batasi `rotateY` dan gunakan stage depth, bukan 360 palsu |
| Foto kandidat tidak transparan | Kotak background merusak stage | Checkerboard preview, panduan upload, validasi bantu |
| Spotlight berbeda antar kandidat | Pengalaman memilih tidak seimbang | Konfigurasi sama untuk semua kandidat |
| QR terlalu dekoratif | Tidak bisa dipindai saat acara | QR black on white, ukuran jelas, tanpa filter dan motion |
| Envelope auto-open | Bertentangan dengan interaksi yang diminta | State CLOSED, mulai hanya `Buka Undangan` |
| Admin terlalu ornamental | Panitia lambat mengelola data | Clean Minimal Dashboard, CSS micro only |
| Mock data tidak sinkron | Kuota/vote/check-in salah di preview | Satu mock store dan adapter actions |
| Arsip dianggap hard-delete | Riwayat suara/hadir hilang | Archive state + audit tetap; restore if capacity |
| Password mock tampak seperti keamanan nyata | Salah persepsi sistem aman | Label demo; backend wajib security enforcement |
| Banyak dependency motion | Bundle membengkak | GSAP sebagai core; optional add-on by need |

### 27.3 Keputusan yang **sudah disepakati** dan jangan dibahas ulang tanpa alasan

- Visual brand Burgundy, Antique Gold, Ivory, Midnight.
- Ballet untuk MEMORIA, Bodoni Moda heading, DM Sans functional UI.
- Cinematic theatre utama; panggung melengkung, velvet curtains, marquee, spotlight, stage bertingkat.
- Opening beranda tirai tertutup → membuka → nama acara + countdown/tanggal/lokasi.
- Navbar 3 halaman; floating tiket kanan bawah.
- Ticket chooser vintage, registration form sederhana.
- Voting photo transparent/no-bg di stage, spotlight, animasi putar/ayun, verifikasi dan satu suara per kategori.
- Undangan dosen berupa amplop tertutup, **klik Buka** baru animasi kertas keluar; QR dapat diakses.
- Admin dan petugas **polos**, tanpa panggung/animasi berat.
- GSAP/ScrollTrigger core; Phosphor + custom animated SVG; Next.js/TypeScript/Tailwind.

### 27.4 Detail yang masih **usulan implementasi**, tidak boleh dianggap kebijakan baru

- Durasi tepat intro 1.8–3 detik, jumlah lampu marquee, derajat rotasi kandidat, intensitas spotlight, breakpoints final.
- Apakah animasi tirai hanya sekali per sesi; disarankan untuk UX tetapi perlu diuji.
- Apakah undangan yang pernah dibuka langsung terbuka pada refresh sesi yang sama; disarankan untuk akses QR cepat.
- Kapasitas ukuran upload kandidat 5MB/800px minimum; ditetapkan saat QA assets dan backend storage.
- Pilihan library scanner, QR renderer, PDF generation, XLSX, dan form helper.
- Cara penempatan file/folder dalam implementasi nyata boleh disederhanakan bila konsisten dengan route contracts.
- Copy marketing pendek berbahasa Inggris dan bentuk stage asset final.

### 27.5 Kebutuhan input panitia ketika produksi aset dilakukan

| Input | Penanggung jawab | Tujuan |
|---|---|---|
| Logo resmi MEMORIA/identitas SIKC jika sudah ada | Panitia/PDD | Branding yang konsisten |
| Tanggal, jam, lokasi pasti | Panitia | Hero/countdown, surat, PDF tiket |
| Foto band asli & izin penggunaan | Panitia | Band Showcase |
| Copy teaser fashion/award | Panitia | Beranda |
| Foto kandidat transparan dan deskripsi | Panitia | Voting stage |
| Kategori + foto pemenang yang akan diumumkan | Panitia | Fashion/Awarding Published |
| Teks undangan dosen, penerima, kontak | Panitia | Interactive Envelope |
| Jenis tiket gratis, kuota, periode | Panitia | Loket tiket digital |

Jangan mengunci nama band, event date, lokasi, kandidat, dan dosen berdasarkan contoh yang dipakai selama brainstorming; semua harus menjadi **data editable dari Admin Panitia**.

---

## 28. Referensi dan catatan implementasi

### 28.1 Dokumen internal yang digunakan

1. `MEMORIA-PRD-FRONTEND-V1-FINAL-BASELINE.md` — fitur, aturan, rute, edge cases, acceptance criteria.
2. `Konsep Diesnatalis.pdf` — halaman 1–2 (tema Velvet Night), 5–8 (atmosfer, galeri, experience).
3. `Tupoksi Diesnatalis.pdf` — halaman 1–3 (tipografi Ballet, tirai/film), halaman 8 (desain identitas & website undangan/check-in).
4. Referensi gambar panggung yang diberikan pada percakapan: proscenium melengkung + lampu, spotlight pada panggung bertingkat, dan velvet sides.
5. Keputusan brainstorming Visual Batch 1–4 serta koreksi terbaru voting/undangan, disepakati pengguna.

### 28.2 Dokumentasi resmi teknologi (rujukan teknis)

- Next.js App Router, route groups: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js Server vs Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js fonts: https://nextjs.org/docs/app/getting-started/fonts
- Tailwind theme variables: https://tailwindcss.com/docs/theme
- GSAP documentation: https://gsap.com/docs/v3/
- GSAP React integration: https://gsap.com/resources/React/
- Phosphor Icons React: https://github.com/phosphor-icons/react
- Phosphor catalog: https://phosphoricons.com/
- Ballet (Google Fonts): https://fonts.google.com/specimen/Ballet
- Bodoni Moda (Google Fonts): https://fonts.google.com/specimen/Bodoni+Moda
- DM Sans (Google Fonts): https://fonts.google.com/specimen/DM+Sans

### 28.3 Persetujuan & pemisahan tahap

- Dokumen ini adalah **Design System + Frontend Structure Blueprint**, bukan backend PRD dan bukan kumpulan source code jadi.
- **Frontend PRD** menentukan apa yang harus terjadi; **Design System** menentukan bagaimana sistem terlihat/bergerak; **Backend PRD** nanti menentukan autentikasi, persistence, API, email delivery, QR validation, permissions, idempotency, dan data transactions.
- Status visual: arah utama dan interaksi kunci sudah disepakati pengguna; angka token/asset/breakpoints/detail teknis tertentu masih usulan implementation yang bisa dikalibrasi tanpa mengubah fitur.

---

## LAMPIRAN A — Quick implementation matrix

| Halaman | Primary component | Data source FE-only | Motion owner | State penting |
|---|---|---|---|---|
| Beranda | `CurtainHeroScene` | `event.adapter`, `bands` | `curtainTimeline` | intro/statik/empty |
| Fashion Show | `FashionRunway` | `winners.adapter` | `winnerReveal` | Draft tersembunyi |
| Awarding | `AwardingGallery` | `winners.adapter` | `winnerReveal` | Published only |
| Pilih Tiket | `TicketSelector` | `ticket.adapter` | CSS hover | open/full/closed |
| Form | `RegistrationForm` | `registration.service` | CSS feedback | duplicate NIM/invalid |
| Sukses | `RegistrationSuccess` | success context | CSS micro | PDF ready/email independent |
| Voting | `VotingStage` | `voting.adapter` | `candidateMotion` | scheduled/active/already voted |
| Undangan | `InvitationEnvelope` | `invitation.adapter` | `envelopeOpenTimeline` | closed/open/open error |
| Admin Dashboard | `AdminDashboard` | mock store | CSS micro | loading/empty |
| Kelola Website | forms/managers | `event.adapter` | CSS micro | save/public, draft winner |
| Tiket Admin | `TicketEditorForm` | `ticket.adapter` | CSS micro | quota/date/status |
| Peserta Admin | `ParticipantTable` | `participant.adapter` | CSS micro | archive/edit/restore |
| Voting Admin | `VotingEditor`, `VotingResults` | `voting.adapter` | CSS micro + preview stage | candidate lock after first vote |
| Undangan Admin | `InvitationTemplateEditor`, `LecturerInvitationTable` | `invitation.adapter` | CSS micro | duplicate email/preview |
| Check-in | `CheckInScreen` | `checkin.adapter` | CSS feedback | QR/manual/already present |
| Kelola Akun | `AccountTable` | `account.adapter` | CSS micro | role/active/reset |

## LAMPIRAN B — Ringkasan untuk handoff engineer/frontend designer

**Build it this way:** satu proyek Next.js; halaman publik kaya atmosphere red velvet dan premiere; hero pertama seperti membuka pertunjukan panggung; foto kandidat voting tanpa background tampil di atas podium dengan spotlight dan putaran halus; undangan dosen benar-benar amplop tertutup yang dibuka lewat klik; tiket registrasi simpel; admin tidak pakai efek teater; semua konten tetap bisa diubah panitia; mock services terpusat; route groups dan komponen jelas; kode tiket/QR tetap saat NIM diedit; arsip bukan hapus; voting dan check-in harus benar secara alur sebelum dilapisi animasi.

**Akhir dokumen — MEMORIA Design System & Frontend Structure Blueprint V1.0.**
