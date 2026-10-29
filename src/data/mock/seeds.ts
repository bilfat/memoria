import {
  EventContent,
  Band,
  WinnerAnnouncement,
  TicketType,
  Participant,
  TicketIdentity,
  Voting,
  Candidate,
  VoteRecord,
  InvitationTemplate,
  LecturerInvitation,
  CheckinRecord,
  InternalAccount,
  AuditLog,
} from '@/types';

export const INITIAL_EVENT_CONTENT: EventContent = {
  id: 'event-memoria-2026',
  eventName: 'MEMORIA',
  tagline: 'Velvet Night — Diesnatalis SIKC 2026',
  description:
    'Satu malam istimewa perayaan Diesnatalis D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan. Menghadirkan pertunjukan musik megah, peragaan busana teatrikal, malam penghargaan bergengsi, dan momen tak terlupakan di atas panggung beludru merah.',
  eventStartAt: '2026-11-20T18:30:00+07:00',
  eventEndAt: '2026-11-20T23:00:00+07:00',
  venueName: 'Grand Ballroom & Theatre Hall',
  venueAddress: 'Telkom University Landmark Hall, Gedung Selaru Lt. 4, Bandung',
  heroImage: '/brand/og-cover.webp',
  footerText: 'MEMORIA 2026 — Himpunan Mahasiswa D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan.',
  fashionTeaser: {
    title: 'The Runway Experience',
    description:
      'Panggung runway berbalut beludru merah dengan parade busana haute couture & carnival theatrical yang memukau.',
  },
  awardingTeaser: {
    title: 'The Golden Moment Awarding',
    description:
      'Penghargaan kehormatan tahunan untuk mahasiswa berprestasi, inovasi digital terunggul, dan kontributor terbaik SIKC.',
  },
};

export const INITIAL_BANDS: Band[] = [
  {
    id: 'band-1',
    name: 'Fosca Band',
    description:
      'Band beraliran indie-pop orchestral yang membawakan harmoni melodi hangat bernuansa sinematik teater.',
    sortOrder: 1,
  },
  {
    id: 'band-2',
    name: 'The Midnight Velvet',
    description:
      'Grup jazz & soul kontemporer dengan alunan saxophone dan vokal memikat pengiring malam penuh kenangan.',
    sortOrder: 2,
  },
  {
    id: 'band-3',
    name: 'Audio Track Collective',
    description:
      'Kolektif musisi mahasiswa SIKC dengan aransemen symphonic modern yang membakar semangat seisi panggung.',
    sortOrder: 3,
  },
];

export const INITIAL_WINNERS: WinnerAnnouncement[] = [
  {
    id: 'win-1',
    section: 'FASHION_SHOW',
    categoryName: 'Best Velvet Costume',
    winnerName: 'Aura Natasya & Tim Lumina',
    winnerDescription:
      'Konsep gaun couture beludru merah dengan aksen benang emas antik yang memancarkan keanggunan teater klasik.',
    status: 'PUBLISHED',
    sortOrder: 1,
    publishedAt: '2026-10-28T20:00:00+07:00',
  },
  {
    id: 'win-2',
    section: 'FASHION_SHOW',
    categoryName: 'Most Dramatic Runway Walk',
    winnerName: 'Dimas Rayhan',
    winnerDescription:
      'Langkah runway memukau dengan transisi siluet dramatis yang disambut tepuk tangan meriah seluruh penonton.',
    status: 'DRAFT',
    sortOrder: 2,
  },
  {
    id: 'win-3',
    section: 'AWARDING',
    categoryName: 'Smart City Innovator of The Year',
    winnerName: 'Tim SIKC GreenIoT',
    winnerPhoto: '/images/awarding-trophy-clean.png',
    winnerDescription:
      'Inovasi sistem pemantauan polusi udara mikro berbasis sensor cerdas dan dashboard prediksi cuaca kampus.',
    status: 'PUBLISHED',
    sortOrder: 1,
    publishedAt: '2026-10-28T20:30:00+07:00',
  },
  {
    id: 'win-4',
    section: 'AWARDING',
    categoryName: 'Outstanding Student Leader',
    winnerName: 'Rian Pratama',
    winnerPhoto: '/images/fashion-model-clean.png',
    winnerDescription:
      'Dedikasi luar biasa dalam memimpin proyek kolaborasi riset kota cerdas bersama pemerintah daerah dan masyarakat.',
    status: 'PUBLISHED',
    sortOrder: 2,
    publishedAt: '2026-10-28T20:45:00+07:00',
  },
  {
    id: 'win-5',
    section: 'AWARDING',
    categoryName: 'Digital Arts & Cultural Impact',
    winnerName: 'Nadia Clarissa & Tim Lumina',
    winnerPhoto: '/images/awarding-trophy-final.png',
    winnerDescription:
      'Karya visual interaktif yang memadukan warisan budaya nusantara dengan teknologi proyeksi panggung teater modern.',
    status: 'PUBLISHED',
    sortOrder: 3,
    publishedAt: '2026-10-28T21:00:00+07:00',
  },
];

export const INITIAL_TICKETS: TicketType[] = [
  {
    id: 'ticket-reg-1',
    name: 'General Admission Mahasiswa SIKC',
    description: 'Akses penuh ke seluruh pertunjukan panggung, runway fashion show, dan malam awarding MEMORIA.',
    price: 0,
    capacity: 250,
    registrationOpensAt: '2026-10-20T00:00:00+07:00',
    registrationClosesAt: '2026-11-20T17:00:00+07:00',
    publication: 'PUBLISHED',
  },
  {
    id: 'ticket-vip-2',
    name: 'Special Premiere Seat',
    description: 'Kursi prioritas di area depan panggung utama teater dengan souvenir kit eksklusif MEMORIA.',
    price: 0,
    capacity: 50,
    registrationOpensAt: '2026-10-20T00:00:00+07:00',
    registrationClosesAt: '2026-11-20T17:00:00+07:00',
    publication: 'PUBLISHED',
  },
  {
    id: 'ticket-alumni-3',
    name: 'Sesi Khusus Undangan Alumni',
    description: 'Pendaftaran khusus bagi alumni SIKC untuk temu kangen dan jamuan nostalgia diesnatalis.',
    price: 0,
    capacity: 30,
    registrationOpensAt: '2026-11-01T08:00:00+07:00',
    registrationClosesAt: '2026-11-15T23:59:00+07:00',
    publication: 'DRAFT',
  },
];

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'part-001',
    fullName: 'Andi Pratama',
    nim: '7708220001',
    email: 'andi.pratama@student.telkomuniversity.ac.id',
    phone: '081234567890',
    studyProgram: 'D4 Sistem Informasi Kota Cerdas',
    faculty: 'Fakultas Ilmu Terapan',
    ticketTypeId: 'ticket-reg-1',
    status: 'ACTIVE',
    registeredAt: '2026-10-22T09:15:00+07:00',
  },
  {
    id: 'part-002',
    fullName: 'Citra Amelia',
    nim: '7708220002',
    email: 'citra.amelia@student.telkomuniversity.ac.id',
    phone: '081398765432',
    studyProgram: 'D4 Sistem Informasi Kota Cerdas',
    faculty: 'Fakultas Ilmu Terapan',
    ticketTypeId: 'ticket-vip-2',
    status: 'ACTIVE',
    registeredAt: '2026-10-23T14:20:00+07:00',
  },
  {
    id: 'part-003',
    fullName: 'Budi Santoso',
    nim: '7708220003',
    email: 'budi.santoso@student.telkomuniversity.ac.id',
    phone: '081577788990',
    studyProgram: 'D4 Sistem Informasi Kota Cerdas',
    faculty: 'Fakultas Ilmu Terapan',
    ticketTypeId: 'ticket-reg-1',
    status: 'ARCHIVED',
    registeredAt: '2026-10-21T10:00:00+07:00',
    archivedAt: '2026-10-25T16:00:00+07:00',
    archivedByAccountId: 'acc-admin-1',
    archiveReason: 'Pembatalan mandiri atas permintaan mahasiswa',
  },
];

export const INITIAL_TICKET_IDENTITIES: TicketIdentity[] = [
  {
    participantId: 'part-001',
    ticketNo: 'MEM-26-0001',
    voteCode: 'VOTE-7K92P',
    checkinQrToken: 'qr_mhs_memoria_andi_7708220001',
    issuedAt: '2026-10-22T09:15:00+07:00',
  },
  {
    participantId: 'part-002',
    ticketNo: 'MEM-26-0002',
    voteCode: 'VOTE-3M48Q',
    checkinQrToken: 'qr_mhs_memoria_citra_7708220002',
    issuedAt: '2026-10-23T14:20:00+07:00',
  },
  {
    participantId: 'part-003',
    ticketNo: 'MEM-26-0003',
    voteCode: 'VOTE-9L14X',
    checkinQrToken: 'qr_mhs_memoria_budi_7708220003',
    issuedAt: '2026-10-21T10:00:00+07:00',
  },
];

export const INITIAL_VOTINGS: Voting[] = [
  {
    id: 'vote-poll-1',
    title: 'Best Runway Fashion Model 2026',
    description:
      'Pilih model peragaan busana favoritmu yang tampil paling spektakuler dan berkarisma di atas runway panggung MEMORIA!',
    privateToken: 'runway-velvet-2026',
    mode: 'SCHEDULED',
    startsAt: '2026-10-20T00:00:00+07:00',
    endsAt: '2026-11-20T22:00:00+07:00',
  },
  {
    id: 'vote-poll-2',
    title: 'Most Favorite Band Performance',
    description: 'Tentukan penampilan band musik yang paling berkesan dan menggetarkan malam Diesnatalis SIKC 2026.',
    privateToken: 'favorite-band-2026',
    mode: 'SCHEDULED',
    startsAt: '2026-11-20T19:00:00+07:00',
    endsAt: '2026-11-20T22:30:00+07:00',
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    votingId: 'vote-poll-1',
    name: 'Aurelia Salsabila',
    description: 'Nominee #01 — Konsep Crimson Elegance dengan jubah beludru megah',
    photo: '/images/fashion-model-clean.png',
    sortOrder: 1,
  },
  {
    id: 'cand-2',
    votingId: 'vote-poll-1',
    name: 'Rezky Pratama',
    description: 'Nominee #02 — Konsep Midnight Velvet Tuxedo dengan aksen kerah emas antik',
    photo: '/images/fashion-model-perfect.png',
    sortOrder: 2,
  },
  {
    id: 'cand-3',
    votingId: 'vote-poll-1',
    name: 'Zahra Kirana',
    description: 'Nominee #03 — Konsep Carnival Premiere Gown dengan ornamen bintang sinematik',
    photo: '/images/fashion-model.png',
    sortOrder: 3,
  },
  {
    id: 'cand-4',
    votingId: 'vote-poll-2',
    name: 'Fosca Band',
    description: 'Harmoni indie-pop berbalut melodi orkestra beludru malam',
    sortOrder: 1,
  },
  {
    id: 'cand-5',
    votingId: 'vote-poll-2',
    name: 'The Midnight Velvet',
    description: 'Irama jazz kontemporer memikat dengan instrumen brass megah',
    sortOrder: 2,
  },
];

export const INITIAL_VOTE_RECORDS: VoteRecord[] = [
  {
    id: 'vrec-001',
    votingId: 'vote-poll-1',
    participantId: 'part-001',
    candidateId: 'cand-1',
    votedAt: '2026-10-23T11:00:00+07:00',
  },
  {
    id: 'vrec-002',
    votingId: 'vote-poll-1',
    participantId: 'part-003', // archived participant whose vote still counts!
    candidateId: 'cand-2',
    votedAt: '2026-10-24T09:30:00+07:00',
  },
];

export const INITIAL_INVITATION_TEMPLATE: InvitationTemplate = {
  subject: 'Undangan Kehormatan Diesnatalis SIKC 2026 — MEMORIA: Velvet Night',
  greeting: 'Kepada Yth. Bapak/Ibu Dosen Pengajar SIKC, {{nama_dosen}}',
  body:
    'Dengan penuh rasa hormat dan sukacita, Civitas Akademika D4 Sistem Informasi Kota Cerdas mengundang Bapak/Ibu untuk berkenan hadir sebagai Tamu Kehormatan pada malam puncak Diesnatalis SIKC 2026 "MEMORIA — Velvet Night".\n\nKehadiran dan restu Bapak/Ibu merupakan kehormatan tak terhingga bagi segenap mahasiswa dan panitia dalam merayakan tonggak perjalanan institusi tercinta.',
  closing: 'Atas perhatian, bimbingan, dan kehadiran Bapak/Ibu, kami haturkan terima kasih yang sebesar-besarnya.',
  senderName: 'Panitia Pelaksana MEMORIA & Himpunan Mahasiswa SIKC 2026',
};

export const INITIAL_LECTURER_INVITATIONS: LecturerInvitation[] = [
  {
    id: 'lec-001',
    name: 'Dr. Ir. Hendra Saputra, M.T.',
    email: 'hendra.saputra@telkomuniversity.ac.id',
    phone: '081122334455',
    inviteCode: 'DOSEN-HND-01',
    inviteToken: 'prof-hendra-velvet-2026',
    checkinQrToken: 'qr_dsn_memoria_hendra_001',
    active: true,
  },
  {
    id: 'lec-002',
    name: 'Siti Rahmawati, S.Kom., M.Kom.',
    email: 'siti.rahmawati@telkomuniversity.ac.id',
    phone: '081299887766',
    inviteCode: 'DOSEN-STR-02',
    inviteToken: 'ibu-siti-velvet-2026',
    checkinQrToken: 'qr_dsn_memoria_siti_002',
    active: true,
  },
];

export const INITIAL_CHECKIN_RECORDS: CheckinRecord[] = [
  {
    id: 'chk-001',
    subjectType: 'MAHASISWA',
    subjectId: 'part-001',
    checkedInAt: '2026-10-26T18:45:12+07:00',
    method: 'QR',
    operatorAccountId: 'acc-petugas-1',
    operatorName: 'Petugas Pintu Barat',
    subjectName: 'Andi Pratama',
    subjectIdentifier: '7708220001',
    ticketName: 'General Admission Mahasiswa SIKC',
  },
];

export const INITIAL_ACCOUNTS: InternalAccount[] = [
  {
    id: 'acc-admin-1',
    fullName: 'Admin Utama MEMORIA',
    email: 'admin@memoria.telkom.id',
    role: 'ADMIN_PANITIA',
    status: 'ACTIVE',
    password: 'admin123',
  },
  {
    id: 'acc-petugas-1',
    fullName: 'Petugas Gerbang Teater A',
    email: 'petugas@memoria.telkom.id',
    role: 'PETUGAS_CHECKIN',
    status: 'ACTIVE',
    password: 'petugas123',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    actorAccountId: 'acc-admin-1',
    actorName: 'Admin Utama MEMORIA',
    action: 'ARCHIVE_PARTICIPANT',
    subjectId: 'part-003',
    happenedAt: '2026-10-25T16:00:00+07:00',
    summary: 'Mengarsipkan peserta Budi Santoso (NIM 7708220003) via verifikasi dua tahap',
  },
  {
    id: 'audit-002',
    actorAccountId: 'acc-petugas-1',
    actorName: 'Petugas Gerbang Teater A',
    action: 'CHECK_IN',
    subjectId: 'part-001',
    happenedAt: '2026-10-26T18:45:12+07:00',
    summary: 'Check-in QR sukses untuk Andi Pratama (NIM 7708220001)',
  },
];
