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
  TicketAvailabilityStatus,
  VotingStatus,
} from '@/types';
import {
  INITIAL_EVENT_CONTENT,
  INITIAL_BANDS,
  INITIAL_WINNERS,
  INITIAL_TICKETS,
  INITIAL_PARTICIPANTS,
  INITIAL_TICKET_IDENTITIES,
  INITIAL_VOTINGS,
  INITIAL_CANDIDATES,
  INITIAL_VOTE_RECORDS,
  INITIAL_INVITATION_TEMPLATE,
  INITIAL_LECTURER_INVITATIONS,
  INITIAL_CHECKIN_RECORDS,
  INITIAL_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
} from './seeds';

const STORAGE_KEY = 'memoria_mock_store_v1';
const SESSION_KEY = 'memoria_mock_session_v1';

export interface MockStoreData {
  event: EventContent;
  bands: Band[];
  winners: WinnerAnnouncement[];
  tickets: TicketType[];
  participants: Participant[];
  ticketIdentities: TicketIdentity[];
  votings: Voting[];
  candidates: Candidate[];
  voteRecords: VoteRecord[];
  invitationTemplate: InvitationTemplate;
  lecturerInvitations: LecturerInvitation[];
  checkinRecords: CheckinRecord[];
  accounts: InternalAccount[];
  auditLogs: AuditLog[];
}

function getInitialStore(): MockStoreData {
  if (typeof window === 'undefined') {
    return {
      event: INITIAL_EVENT_CONTENT,
      bands: INITIAL_BANDS,
      winners: INITIAL_WINNERS,
      tickets: INITIAL_TICKETS,
      participants: INITIAL_PARTICIPANTS,
      ticketIdentities: INITIAL_TICKET_IDENTITIES,
      votings: INITIAL_VOTINGS,
      candidates: INITIAL_CANDIDATES,
      voteRecords: INITIAL_VOTE_RECORDS,
      invitationTemplate: INITIAL_INVITATION_TEMPLATE,
      lecturerInvitations: INITIAL_LECTURER_INVITATIONS,
      checkinRecords: INITIAL_CHECKIN_RECORDS,
      accounts: INITIAL_ACCOUNTS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Sinkronisasi item baru dari INITIAL_WINNERS jika belum ada di localStorage
      if (Array.isArray(parsed.winners)) {
        INITIAL_WINNERS.forEach((seedWin) => {
          const idx = parsed.winners.findIndex((w: any) => w.id === seedWin.id);
          if (idx < 0) {
            parsed.winners.push(seedWin);
          } else if (seedWin.status === 'PUBLISHED' && !parsed.winners[idx].winnerPhoto) {
            parsed.winners[idx].status = 'PUBLISHED';
            parsed.winners[idx].winnerPhoto = seedWin.winnerPhoto;
          }
        });
      }

      // Sinkronisasi foto kandidat dari INITIAL_CANDIDATES jika belum ada
      if (Array.isArray(parsed.candidates)) {
        INITIAL_CANDIDATES.forEach((seedCand) => {
          const idx = parsed.candidates.findIndex((c: any) => c.id === seedCand.id);
          if (idx >= 0 && seedCand.photo && !parsed.candidates[idx].photo) {
            parsed.candidates[idx].photo = seedCand.photo;
          }
        });
      }

      // Sinkronisasi judul fashion teaser jika masih memakai judul bahasa Inggris lama
      if (parsed.event) {
        if (!parsed.event.fashionTeaser || parsed.event.fashionTeaser.title === 'The Runway Experience') {
          parsed.event.fashionTeaser = {
            ...parsed.event.fashionTeaser,
            title: INITIAL_EVENT_CONTENT.fashionTeaser?.title || 'Panggung Fashion Show',
          };
        }
      }

      return parsed;
    }
  } catch (err) {
    console.warn('Failed reading mock store from localStorage, using seed', err);
  }

  const initial: MockStoreData = {
    event: INITIAL_EVENT_CONTENT,
    bands: INITIAL_BANDS,
    winners: INITIAL_WINNERS,
    tickets: INITIAL_TICKETS,
    participants: INITIAL_PARTICIPANTS,
    ticketIdentities: INITIAL_TICKET_IDENTITIES,
    votings: INITIAL_VOTINGS,
    candidates: INITIAL_CANDIDATES,
    voteRecords: INITIAL_VOTE_RECORDS,
    invitationTemplate: INITIAL_INVITATION_TEMPLATE,
    lecturerInvitations: INITIAL_LECTURER_INVITATIONS,
    checkinRecords: INITIAL_CHECKIN_RECORDS,
    accounts: INITIAL_ACCOUNTS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (err) {
    console.warn('Failed to save initial store to localStorage', err);
  }

  return initial;
}

class MockStore {
  private data: MockStoreData = getInitialStore();
  private listeners: Set<() => void> = new Set();
  private currentUser: InternalAccount | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const rawSession = localStorage.getItem(SESSION_KEY);
        if (rawSession) {
          this.currentUser = JSON.parse(rawSession);
        } else {
          // Default demo session: Admin Panitia
          this.currentUser = INITIAL_ACCOUNTS[0];
          localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
        }
      } catch (err) {
        console.warn('Failed loading mock session', err);
        this.currentUser = INITIAL_ACCOUNTS[0];
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persistAndNotify() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Failed writing mock store to localStorage', e);
      }
    }
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in mock store listener', e);
      }
    });
  }

  public resetToDefault(): void {
    this.data = {
      event: INITIAL_EVENT_CONTENT,
      bands: INITIAL_BANDS,
      winners: INITIAL_WINNERS,
      tickets: INITIAL_TICKETS,
      participants: INITIAL_PARTICIPANTS,
      ticketIdentities: INITIAL_TICKET_IDENTITIES,
      votings: INITIAL_VOTINGS,
      candidates: INITIAL_CANDIDATES,
      voteRecords: INITIAL_VOTE_RECORDS,
      invitationTemplate: INITIAL_INVITATION_TEMPLATE,
      lecturerInvitations: INITIAL_LECTURER_INVITATIONS,
      checkinRecords: INITIAL_CHECKIN_RECORDS,
      accounts: INITIAL_ACCOUNTS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    this.persistAndNotify();
  }

  // --- AUTH SESSION ---
  public getCurrentUser(): InternalAccount | null {
    if (this.currentUser) return this.currentUser;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          this.currentUser = JSON.parse(raw);
          return this.currentUser;
        }
      } catch {}
    }
    return this.data.accounts[0] || null;
  }

  public setCurrentUser(user: InternalAccount | null) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    this.persistAndNotify();
  }

  public login(email: string, password?: string): InternalAccount {
    const cleanEmail = email.trim().toLowerCase();
    let account = this.data.accounts.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    if (!account) {
      // Support alias domains (ac.id vs telkom.id)
      if (cleanEmail === 'admin@memoria.ac.id' || cleanEmail === 'admin@memoria.telkom.id') {
        account = this.data.accounts.find((a) => a.role === 'ADMIN_PANITIA');
      } else if (
        cleanEmail === 'petugas@memoria.ac.id' ||
        cleanEmail === 'checkin@memoria.ac.id' ||
        cleanEmail === 'petugas@memoria.telkom.id'
      ) {
        account = this.data.accounts.find((a) => a.role === 'PETUGAS_CHECKIN');
      }
    }

    if (!account) {
      throw new Error('Email atau password tidak sesuai.');
    }
    if (account.status === 'INACTIVE') {
      throw new Error('Akun dinonaktifkan. Silakan hubungi Admin Utama.');
    }
    if (password && account.password && account.password !== password) {
      throw new Error('Email atau password tidak sesuai.');
    }
    this.setCurrentUser(account);
    return account;
  }

  public logout(): void {
    this.setCurrentUser(null);
  }

  // --- EVENT & CONTENT ---
  public getEvent(): EventContent {
    return this.data.event;
  }

  public updateEvent(changes: Partial<EventContent>): EventContent {
    this.data.event = {
      ...this.data.event,
      ...changes,
    };
    this.persistAndNotify();
    return this.data.event;
  }

  // --- BANDS ---
  public getBands(): Band[] {
    return [...this.data.bands].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public saveBand(bandData: Omit<Band, 'id'> & { id?: string }): Band {
    if (bandData.id) {
      const idx = this.data.bands.findIndex((b) => b.id === bandData.id);
      if (idx >= 0) {
        this.data.bands[idx] = {
          ...this.data.bands[idx],
          ...bandData,
        };
        this.persistAndNotify();
        return this.data.bands[idx];
      }
    }
    const newBand: Band = {
      id: `band-${Date.now()}`,
      name: bandData.name,
      description: bandData.description,
      photo: bandData.photo,
      sortOrder: bandData.sortOrder || this.data.bands.length + 1,
    };
    this.data.bands.push(newBand);
    this.persistAndNotify();
    return newBand;
  }

  public deleteBand(id: string): void {
    this.data.bands = this.data.bands.filter((b) => b.id !== id);
    this.persistAndNotify();
  }

  // --- WINNERS ---
  public getWinners(section?: 'FASHION_SHOW' | 'AWARDING'): WinnerAnnouncement[] {
    let list = this.data.winners;
    if (section) {
      list = list.filter((w) => w.section === section);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPublishedWinners(section: 'FASHION_SHOW' | 'AWARDING'): WinnerAnnouncement[] {
    return this.getWinners(section).filter((w) => w.status === 'PUBLISHED');
  }

  public saveWinner(
    winnerData: Omit<WinnerAnnouncement, 'id'> & { id?: string }
  ): WinnerAnnouncement {
    if (winnerData.id) {
      const idx = this.data.winners.findIndex((w) => w.id === winnerData.id);
      if (idx >= 0) {
        this.data.winners[idx] = {
          ...this.data.winners[idx],
          ...winnerData,
        };
        this.persistAndNotify();
        return this.data.winners[idx];
      }
    }
    const newWinner: WinnerAnnouncement = {
      id: `win-${Date.now()}`,
      ...winnerData,
      sortOrder: winnerData.sortOrder || this.data.winners.length + 1,
    };
    this.data.winners.push(newWinner);
    this.persistAndNotify();
    return newWinner;
  }

  public deleteWinner(id: string): void {
    this.data.winners = this.data.winners.filter((w) => w.id !== id);
    this.persistAndNotify();
  }

  public toggleWinnerPublish(id: string): WinnerAnnouncement {
    const winner = this.data.winners.find((w) => w.id === id);
    if (!winner) throw new Error('Pemenang tidak ditemukan.');
    winner.status = winner.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (winner.status === 'PUBLISHED') {
      winner.publishedAt = new Date().toISOString();
    }
    this.persistAndNotify();
    return winner;
  }

  // --- TICKETS ---
  public getTickets(): TicketType[] {
    return this.data.tickets;
  }

  public getPublishedTickets(): TicketType[] {
    return this.data.tickets.filter((t) => t.publication === 'PUBLISHED');
  }

  public getTicketById(id: string): TicketType | undefined {
    return this.data.tickets.find((t) => t.id === id);
  }

  public getRemainingQuota(ticketId: string): number | null {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return 0;
    if (ticket.capacity === null) return null; // unlimited
    const activeCount = this.data.participants.filter(
      (p) => p.ticketTypeId === ticketId && p.status === 'ACTIVE'
    ).length;
    return Math.max(0, ticket.capacity - activeCount);
  }

  public getTicketAvailability(ticket: TicketType): TicketAvailabilityStatus {
    const now = typeof window !== 'undefined' ? new Date() : new Date('2026-10-28T00:00:00Z');
    const opens = new Date(ticket.registrationOpensAt);
    const closes = new Date(ticket.registrationClosesAt);

    if (now < opens) return 'BELUM_DIBUKA';
    if (now > closes) return 'DITUTUP';

    const remaining = this.getRemainingQuota(ticket.id);
    if (remaining !== null && remaining <= 0) return 'PENUH';

    return 'TERSEDIA';
  }

  public saveTicket(ticketData: Omit<TicketType, 'id'> & { id?: string }): TicketType {
    if (ticketData.id) {
      const idx = this.data.tickets.findIndex((t) => t.id === ticketData.id);
      if (idx >= 0) {
        // Validation: cannot set capacity lower than active participants
        if (ticketData.capacity !== null) {
          const activeCount = this.data.participants.filter(
            (p) => p.ticketTypeId === ticketData.id && p.status === 'ACTIVE'
          ).length;
          if (ticketData.capacity < activeCount) {
            throw new Error(
              `Kuota tidak boleh lebih kecil dari jumlah peserta aktif saat ini (${activeCount} peserta).`
            );
          }
        }
        this.data.tickets[idx] = {
          ...this.data.tickets[idx],
          ...ticketData,
        };
        this.persistAndNotify();
        return this.data.tickets[idx];
      }
    }

    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      ...ticketData,
      price: 0,
    };
    this.data.tickets.push(newTicket);
    this.persistAndNotify();
    return newTicket;
  }

  // --- PARTICIPANTS & REGISTRATION ---
  public getParticipants(status?: 'ACTIVE' | 'ARCHIVED'): Participant[] {
    if (status) {
      return this.data.participants.filter((p) => p.status === status);
    }
    return this.data.participants;
  }

  public getParticipantById(id: string): Participant | undefined {
    return this.data.participants.find((p) => p.id === id);
  }

  public getParticipantByNim(nim: string): Participant | undefined {
    return this.data.participants.find((p) => p.nim.trim() === nim.trim());
  }

  public getTicketIdentity(participantId: string): TicketIdentity | undefined {
    return this.data.ticketIdentities.find((ti) => ti.participantId === participantId);
  }

  public registerParticipant(input: {
    fullName: string;
    nim: string;
    email: string;
    phone: string;
    ticketTypeId: string;
  }): { participant: Participant; ticketIdentity: TicketIdentity } {
    const trimmedNim = input.nim.trim();
    const existing = this.getParticipantByNim(trimmedNim);

    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new Error(
          'NIM sudah terdaftar pada MEMORIA. Satu mahasiswa hanya boleh memiliki satu tiket untuk seluruh acara.'
        );
      } else {
        throw new Error(
          'NIM ini terdaftar pada data arsip. Silakan hubungi panitia MEMORIA untuk pemulihan tiket Anda.'
        );
      }
    }

    const ticket = this.getTicketById(input.ticketTypeId);
    if (!ticket || ticket.publication !== 'PUBLISHED') {
      throw new Error('Jenis tiket ini tidak tersedia.');
    }

    const availability = this.getTicketAvailability(ticket);
    if (availability === 'PENUH') {
      throw new Error('Kuota tiket ini sudah penuh.');
    }
    if (availability === 'BELUM_DIBUKA') {
      throw new Error('Pendaftaran tiket ini belum dibuka.');
    }
    if (availability === 'DITUTUP') {
      throw new Error('Pendaftaran tiket ini sudah ditutup.');
    }

    const participantId = `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randomTicketNum = String(this.data.participants.length + 1).padStart(4, '0');
    const randomVoteCode = `VOTE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const opaqueQrToken = `qr_mhs_memoria_${participantId}_${Math.random().toString(36).substring(2, 8)}`;

    const newParticipant: Participant = {
      id: participantId,
      fullName: input.fullName.trim(),
      nim: trimmedNim,
      email: input.email.trim(),
      phone: input.phone.trim(),
      studyProgram: 'D4 Sistem Informasi Kota Cerdas',
      faculty: 'Fakultas Ilmu Terapan',
      ticketTypeId: input.ticketTypeId,
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
    };

    const newIdentity: TicketIdentity = {
      participantId: participantId,
      ticketNo: `MEM-26-${randomTicketNum}`,
      voteCode: randomVoteCode,
      checkinQrToken: opaqueQrToken,
      issuedAt: new Date().toISOString(),
    };

    this.data.participants.push(newParticipant);
    this.data.ticketIdentities.push(newIdentity);
    this.persistAndNotify();

    return { participant: newParticipant, ticketIdentity: newIdentity };
  }

  // --- TWO-STEP EDIT PARTICIPANT ---
  public updateParticipant(
    id: string,
    changes: {
      fullName: string;
      nim: string;
      email: string;
      phone: string;
      ticketTypeId: string;
    },
    adminPasswordConfirm: string
  ): Participant {
    const admin = this.getCurrentUser();
    if (!admin || admin.role !== 'ADMIN_PANITIA') {
      throw new Error('Hanya Admin Panitia yang memiliki wewenang mengedit data peserta.');
    }
    if (adminPasswordConfirm !== (admin.password || 'admin123')) {
      throw new Error('Password otorisasi admin tidak sesuai. Perubahan dibatalkan.');
    }

    const participant = this.getParticipantById(id);
    if (!participant) throw new Error('Peserta tidak ditemukan.');

    const newNim = changes.nim.trim();
    if (newNim !== participant.nim) {
      const duplicate = this.data.participants.find(
        (p) => p.id !== id && p.nim.trim() === newNim
      );
      if (duplicate) {
        throw new Error('NIM baru sudah terdaftar pada peserta lain (aktif maupun arsip).');
      }
    }

    // Changing ticket type quota checks
    if (changes.ticketTypeId !== participant.ticketTypeId) {
      const newTicket = this.getTicketById(changes.ticketTypeId);
      if (!newTicket) throw new Error('Jenis tiket tujuan tidak valid.');
      const remaining = this.getRemainingQuota(changes.ticketTypeId);
      if (remaining !== null && remaining <= 0) {
        throw new Error('Kuota jenis tiket tujuan sudah penuh.');
      }
    }

    participant.fullName = changes.fullName.trim();
    participant.nim = newNim;
    participant.email = changes.email.trim();
    participant.phone = changes.phone.trim();
    participant.ticketTypeId = changes.ticketTypeId;

    // NOTE: TicketIdentity (ticketNo, voteCode, checkinQrToken) remains 100% IDENTICAL as per PRD K-30!

    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorAccountId: admin.id,
      actorName: admin.fullName,
      action: 'EDIT_PARTICIPANT',
      subjectId: participant.id,
      happenedAt: new Date().toISOString(),
      summary: `Mengedit data peserta ${participant.fullName} (NIM: ${participant.nim})`,
    });

    this.persistAndNotify();
    return participant;
  }

  // --- TWO-STEP ARCHIVE PARTICIPANT ---
  public archiveParticipant(
    id: string,
    adminPasswordConfirm: string,
    archiveReason?: string
  ): Participant {
    const admin = this.getCurrentUser();
    if (!admin || admin.role !== 'ADMIN_PANITIA') {
      throw new Error('Hanya Admin Panitia yang berhak mengarsipkan peserta.');
    }
    if (adminPasswordConfirm !== (admin.password || 'admin123')) {
      throw new Error('Password otorisasi admin tidak sesuai.');
    }

    const participant = this.getParticipantById(id);
    if (!participant) throw new Error('Peserta tidak ditemukan.');
    if (participant.status === 'ARCHIVED') {
      throw new Error('Peserta sudah berstatus arsip.');
    }

    participant.status = 'ARCHIVED';
    participant.archivedAt = new Date().toISOString();
    participant.archivedByAccountId = admin.id;
    participant.archiveReason = archiveReason || 'Diarsipkan oleh panitia';

    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorAccountId: admin.id,
      actorName: admin.fullName,
      action: 'ARCHIVE_PARTICIPANT',
      subjectId: participant.id,
      happenedAt: new Date().toISOString(),
      summary: `Mengarsipkan peserta ${participant.fullName} (${participant.nim})`,
    });

    this.persistAndNotify();
    return participant;
  }

  // --- RESTORE PARTICIPANT ---
  public restoreParticipant(id: string): Participant {
    const admin = this.getCurrentUser();
    if (!admin || admin.role !== 'ADMIN_PANITIA') {
      throw new Error('Hanya Admin Panitia yang berhak memulihkan peserta.');
    }

    const participant = this.getParticipantById(id);
    if (!participant) throw new Error('Peserta tidak ditemukan.');
    if (participant.status !== 'ARCHIVED') {
      throw new Error('Peserta ini tidak sedang diarsipkan.');
    }

    const remaining = this.getRemainingQuota(participant.ticketTypeId);
    if (remaining !== null && remaining <= 0) {
      throw new Error(
        'Kapasitas tiket tidak mencukupi untuk memulihkan peserta. Tambah kuota tiket terlebih dahulu.'
      );
    }

    participant.status = 'ACTIVE';
    participant.archivedAt = undefined;
    participant.archivedByAccountId = undefined;
    participant.archiveReason = undefined;

    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorAccountId: admin.id,
      actorName: admin.fullName,
      action: 'RESTORE_PARTICIPANT',
      subjectId: participant.id,
      happenedAt: new Date().toISOString(),
      summary: `Memulihkan peserta ${participant.fullName} (${participant.nim})`,
    });

    this.persistAndNotify();
    return participant;
  }

  // --- VOTING & CANDIDATES ---
  public getVotings(): Voting[] {
    return this.data.votings;
  }

  public getVotingById(id: string): Voting | undefined {
    return this.data.votings.find((v) => v.id === id);
  }

  public getVotingByToken(token: string): Voting | undefined {
    return this.data.votings.find((v) => v.privateToken.trim() === token.trim());
  }

  public getVotingRuntimeStatus(voting: Voting): VotingStatus {
    if (voting.mode === 'DRAFT') return 'DRAFT';
    const now = typeof window !== 'undefined' ? new Date() : new Date('2026-10-28T00:00:00Z');
    const start = new Date(voting.startsAt);
    const end = new Date(voting.endsAt);

    if (now < start) return 'TERJADWAL';
    if (now >= start && now <= end) return 'AKTIF';
    return 'SELESAI';
  }

  public getCandidatesByVotingId(votingId: string): Candidate[] {
    return this.data.candidates
      .filter((c) => c.votingId === votingId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getVoteRecordsByVotingId(votingId: string): VoteRecord[] {
    return this.data.voteRecords.filter((vr) => vr.votingId === votingId);
  }

  public hasParticipantVoted(participantId: string, votingId: string): boolean {
    return this.data.voteRecords.some(
      (vr) => vr.participantId === participantId && vr.votingId === votingId
    );
  }

  public saveVoting(votingData: Omit<Voting, 'id' | 'privateToken'> & { id?: string }): Voting {
    if (votingData.id) {
      const idx = this.data.votings.findIndex((v) => v.id === votingData.id);
      if (idx >= 0) {
        this.data.votings[idx] = {
          ...this.data.votings[idx],
          ...votingData,
        };
        this.persistAndNotify();
        return this.data.votings[idx];
      }
    }
    const token = `vote-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newVoting: Voting = {
      id: `vote-${Date.now()}`,
      ...votingData,
      privateToken: token,
    };
    this.data.votings.push(newVoting);
    this.persistAndNotify();
    return newVoting;
  }

  public saveCandidate(
    candidateData: Omit<Candidate, 'id'> & { id?: string }
  ): Candidate {
    const voteCount = this.getVoteRecordsByVotingId(candidateData.votingId).length;
    if (voteCount > 0) {
      throw new Error(
        'Kandidat tidak dapat diubah karena voting sudah menerima suara dari pemilih.'
      );
    }

    if (candidateData.id) {
      const idx = this.data.candidates.findIndex((c) => c.id === candidateData.id);
      if (idx >= 0) {
        this.data.candidates[idx] = {
          ...this.data.candidates[idx],
          ...candidateData,
        };
        this.persistAndNotify();
        return this.data.candidates[idx];
      }
    }

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...candidateData,
    };
    this.data.candidates.push(newCandidate);
    this.persistAndNotify();
    return newCandidate;
  }

  public deleteCandidate(candidateId: string): void {
    const candidate = this.data.candidates.find((c) => c.id === candidateId);
    if (!candidate) return;
    const voteCount = this.getVoteRecordsByVotingId(candidate.votingId).length;
    if (voteCount > 0) {
      throw new Error(
        'Kandidat tidak dapat dihapus karena voting sudah menerima suara.'
      );
    }
    this.data.candidates = this.data.candidates.filter((c) => c.id !== candidateId);
    this.persistAndNotify();
  }

  public verifyVoter(
    votingToken: string,
    nim: string,
    voteCode: string
  ): { participant: Participant; voting: Voting; alreadyVoted: boolean } {
    const voting = this.getVotingByToken(votingToken);
    if (!voting) {
      throw new Error('Sesi voting tidak ditemukan atau tautan private salah.');
    }

    const status = this.getVotingRuntimeStatus(voting);
    if (status === 'DRAFT' || status === 'TERJADWAL') {
      throw new Error('Voting ini belum dibuka sesuai jadwal panitia.');
    }
    if (status === 'SELESAI') {
      throw new Error('Voting ini telah selesai dan ditutup.');
    }

    const participant = this.getParticipantByNim(nim);
    if (!participant) {
      throw new Error('NIM tidak terdaftar sebagai peserta MEMORIA.');
    }
    if (participant.status === 'ARCHIVED') {
      throw new Error('Tiket peserta ini telah diarsipkan dan tidak dapat melakukan voting.');
    }

    const identity = this.getTicketIdentity(participant.id);
    if (!identity || identity.voteCode.trim().toUpperCase() !== voteCode.trim().toUpperCase()) {
      throw new Error('Kode unik tiket tidak sesuai dengan data NIM.');
    }

    const alreadyVoted = this.hasParticipantVoted(participant.id, voting.id);

    return { participant, voting, alreadyVoted };
  }

  public castVote(votingId: string, participantId: string, candidateId: string): VoteRecord {
    const voting = this.getVotingById(votingId);
    if (!voting) throw new Error('Voting tidak ditemukan.');

    const status = this.getVotingRuntimeStatus(voting);
    if (status !== 'AKTIF') {
      throw new Error('Voting sedang tidak dalam periode aktif.');
    }

    const participant = this.getParticipantById(participantId);
    if (!participant || participant.status === 'ARCHIVED') {
      throw new Error('Peserta tidak valid atau telah diarsipkan.');
    }

    if (this.hasParticipantVoted(participantId, votingId)) {
      throw new Error('Kamu sudah memberikan suara pada voting ini.');
    }

    const candidate = this.data.candidates.find((c) => c.id === candidateId);
    if (!candidate || candidate.votingId !== votingId) {
      throw new Error('Kandidat yang dipilih tidak valid.');
    }

    const record: VoteRecord = {
      id: `vrec-${Date.now()}`,
      votingId,
      participantId,
      candidateId,
      votedAt: new Date().toISOString(),
    };

    this.data.voteRecords.push(record);
    this.persistAndNotify();
    return record;
  }

  // --- INVITATIONS (LECTURERS) ---
  public getInvitationTemplate(): InvitationTemplate {
    return this.data.invitationTemplate;
  }

  public updateInvitationTemplate(template: InvitationTemplate): InvitationTemplate {
    this.data.invitationTemplate = template;
    this.persistAndNotify();
    return this.data.invitationTemplate;
  }

  public getLecturerInvitations(): LecturerInvitation[] {
    return this.data.lecturerInvitations;
  }

  public getLecturerByToken(token: string): LecturerInvitation | undefined {
    return this.data.lecturerInvitations.find((l) => l.inviteToken.trim() === token.trim());
  }

  public saveLecturer(
    lecturerData: Omit<LecturerInvitation, 'id' | 'inviteCode' | 'inviteToken' | 'checkinQrToken'> & {
      id?: string;
    }
  ): LecturerInvitation {
    const trimmedEmail = lecturerData.email.trim().toLowerCase();

    if (lecturerData.id) {
      const idx = this.data.lecturerInvitations.findIndex((l) => l.id === lecturerData.id);
      if (idx >= 0) {
        // email unique check
        const dupe = this.data.lecturerInvitations.find(
          (l) => l.id !== lecturerData.id && l.email.toLowerCase() === trimmedEmail
        );
        if (dupe) {
          throw new Error('Email dosen ini sudah terdaftar pada undangan lain.');
        }
        this.data.lecturerInvitations[idx] = {
          ...this.data.lecturerInvitations[idx],
          ...lecturerData,
          email: trimmedEmail,
        };
        this.persistAndNotify();
        return this.data.lecturerInvitations[idx];
      }
    }

    // New lecturer
    const dupe = this.data.lecturerInvitations.find((l) => l.email.toLowerCase() === trimmedEmail);
    if (dupe) {
      throw new Error('Undangan untuk email dosen ini sudah ada.');
    }

    const num = String(this.data.lecturerInvitations.length + 1).padStart(2, '0');
    const newLec: LecturerInvitation = {
      id: `lec-${Date.now()}`,
      name: lecturerData.name.trim(),
      email: trimmedEmail,
      phone: lecturerData.phone.trim(),
      inviteCode: `DOSEN-MEM-${num}`,
      inviteToken: `undangan-dosen-${Math.random().toString(36).substring(2, 8)}`,
      checkinQrToken: `qr_dsn_memoria_${Math.random().toString(36).substring(2, 9)}`,
      active: true,
    };

    this.data.lecturerInvitations.push(newLec);
    this.persistAndNotify();
    return newLec;
  }

  public toggleLecturerActive(id: string): LecturerInvitation {
    const lec = this.data.lecturerInvitations.find((l) => l.id === id);
    if (!lec) throw new Error('Dosen tidak ditemukan.');
    lec.active = !lec.active;
    this.persistAndNotify();
    return lec;
  }

  // --- CHECK-IN (ADMIN & PETUGAS) ---
  public getCheckinRecords(): CheckinRecord[] {
    return [...this.data.checkinRecords].sort(
      (a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
    );
  }

  public getCheckinRecord(subjectType: 'MAHASISWA' | 'DOSEN', subjectId: string): CheckinRecord | undefined {
    return this.data.checkinRecords.find(
      (c) => c.subjectType === subjectType && c.subjectId === subjectId
    );
  }

  public checkInSubject(input: {
    subjectType: 'MAHASISWA' | 'DOSEN';
    subjectId: string;
    method: 'QR' | 'MANUAL';
  }): { record: CheckinRecord; alreadyCheckedIn: boolean } {
    const operator = this.getCurrentUser();
    const operatorId = operator?.id || 'acc-petugas-1';
    const operatorName = operator?.fullName || 'Petugas Check-in';

    // Verify subject existence and status
    let subjectName = '';
    let subjectIdentifier = '';
    let ticketName = '';

    if (input.subjectType === 'MAHASISWA') {
      const part = this.getParticipantById(input.subjectId);
      if (!part) throw new Error('Data mahasiswa tidak ditemukan.');
      if (part.status === 'ARCHIVED') {
        throw new Error('Peserta ini telah diarsipkan. Tiket tidak berlaku untuk check-in.');
      }
      subjectName = part.fullName;
      subjectIdentifier = part.nim;
      const t = this.getTicketById(part.ticketTypeId);
      ticketName = t ? t.name : 'Tiket MEMORIA';
    } else {
      const lec = this.data.lecturerInvitations.find((l) => l.id === input.subjectId);
      if (!lec) throw new Error('Data undangan dosen tidak ditemukan.');
      if (!lec.active) throw new Error('Undangan dosen ini tidak aktif.');
      subjectName = lec.name;
      subjectIdentifier = lec.inviteCode;
      ticketName = 'Undangan Kehormatan Dosen';
    }

    const existing = this.getCheckinRecord(input.subjectType, input.subjectId);
    if (existing) {
      return { record: existing, alreadyCheckedIn: true };
    }

    const newRecord: CheckinRecord = {
      id: `chk-${Date.now()}`,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      checkedInAt: new Date().toISOString(),
      method: input.method,
      operatorAccountId: operatorId,
      operatorName,
      subjectName,
      subjectIdentifier,
      ticketName,
    };

    this.data.checkinRecords.unshift(newRecord);

    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorAccountId: operatorId,
      actorName: operatorName,
      action: 'CHECK_IN',
      subjectId: input.subjectId,
      happenedAt: new Date().toISOString(),
      summary: `Check-in ${input.method} sukses untuk ${subjectName} (${subjectIdentifier})`,
    });

    this.persistAndNotify();
    return { record: newRecord, alreadyCheckedIn: false };
  }

  public lookupByQr(qrToken: string): {
    subjectType: 'MAHASISWA' | 'DOSEN';
    subject: Participant | LecturerInvitation;
    existingCheckin?: CheckinRecord;
  } {
    const trimmed = qrToken.trim();

    // 1. Search student ticket identities
    const ticketId = this.data.ticketIdentities.find((ti) => ti.checkinQrToken === trimmed);
    if (ticketId) {
      const student = this.getParticipantById(ticketId.participantId);
      if (!student) throw new Error('Data peserta tidak ditemukan.');
      const existing = this.getCheckinRecord('MAHASISWA', student.id);
      return { subjectType: 'MAHASISWA', subject: student, existingCheckin: existing };
    }

    // 2. Search lecturer invitations
    const lecturer = this.data.lecturerInvitations.find((l) => l.checkinQrToken === trimmed);
    if (lecturer) {
      const existing = this.getCheckinRecord('DOSEN', lecturer.id);
      return { subjectType: 'DOSEN', subject: lecturer, existingCheckin: existing };
    }

    throw new Error('QR Code tidak dikenali atau tidak terdaftar pada sistem MEMORIA.');
  }

  public lookupManualStudent(nim: string): {
    participant: Participant;
    existingCheckin?: CheckinRecord;
  } {
    const p = this.getParticipantByNim(nim.trim());
    if (!p) throw new Error('Mahasiswa dengan NIM tersebut tidak ditemukan.');
    const existing = this.getCheckinRecord('MAHASISWA', p.id);
    return { participant: p, existingCheckin: existing };
  }

  public lookupManualLecturer(identifier: string): {
    lecturer: LecturerInvitation;
    existingCheckin?: CheckinRecord;
  } {
    const clean = identifier.trim().toLowerCase();
    const l = this.data.lecturerInvitations.find(
      (item) => item.email.toLowerCase() === clean || item.inviteCode.toLowerCase() === clean
    );
    if (!l) throw new Error('Dosen dengan email atau kode undangan tersebut tidak ditemukan.');
    const existing = this.getCheckinRecord('DOSEN', l.id);
    return { lecturer: l, existingCheckin: existing };
  }

  // --- ACCOUNTS MANAGEMENT ---
  public getAccounts(): InternalAccount[] {
    return this.data.accounts;
  }

  public saveAccount(
    accountData: Omit<InternalAccount, 'id'> & { id?: string }
  ): InternalAccount {
    const email = accountData.email.trim().toLowerCase();

    if (accountData.id) {
      const idx = this.data.accounts.findIndex((a) => a.id === accountData.id);
      if (idx >= 0) {
        // Last admin active guard
        const currentAcc = this.data.accounts[idx];
        if (
          currentAcc.role === 'ADMIN_PANITIA' &&
          (accountData.role !== 'ADMIN_PANITIA' || accountData.status === 'INACTIVE')
        ) {
          const activeAdmins = this.data.accounts.filter(
            (a) => a.id !== currentAcc.id && a.role === 'ADMIN_PANITIA' && a.status === 'ACTIVE'
          );
          if (activeAdmins.length === 0) {
            throw new Error(
              'Minimal harus ada satu Admin Panitia yang tetap aktif pada sistem.'
            );
          }
        }

        this.data.accounts[idx] = {
          ...this.data.accounts[idx],
          fullName: accountData.fullName.trim(),
          email,
          role: accountData.role,
          status: accountData.status,
          password: accountData.password || this.data.accounts[idx].password,
        };
        this.persistAndNotify();
        return this.data.accounts[idx];
      }
    }

    const dupe = this.data.accounts.find((a) => a.email.toLowerCase() === email);
    if (dupe) throw new Error('Email sudah digunakan oleh akun lain.');

    const newAcc: InternalAccount = {
      id: `acc-${Date.now()}`,
      fullName: accountData.fullName.trim(),
      email,
      role: accountData.role,
      status: 'ACTIVE',
      password: accountData.password || 'panitia123',
    };
    this.data.accounts.push(newAcc);
    this.persistAndNotify();
    return newAcc;
  }

  public resetPassword(accountId: string, newPass: string): void {
    const acc = this.data.accounts.find((a) => a.id === accountId);
    if (!acc) throw new Error('Akun tidak ditemukan.');
    if (newPass.length < 8) {
      throw new Error('Password baru minimal harus 8 karakter.');
    }
    acc.password = newPass;
    this.persistAndNotify();
  }

  public toggleAccountStatus(accountId: string): InternalAccount {
    const acc = this.data.accounts.find((a) => a.id === accountId);
    if (!acc) throw new Error('Akun tidak ditemukan.');

    if (acc.status === 'ACTIVE' && acc.role === 'ADMIN_PANITIA') {
      const activeAdmins = this.data.accounts.filter(
        (a) => a.id !== acc.id && a.role === 'ADMIN_PANITIA' && a.status === 'ACTIVE'
      );
      if (activeAdmins.length === 0) {
        throw new Error('Minimal harus ada satu Admin Panitia aktif pada sistem.');
      }
    }

    acc.status = acc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.persistAndNotify();
    return acc;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }
}

export const mockStore = new MockStore();
