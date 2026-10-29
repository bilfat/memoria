export type UUID = string;
export type ISODateTime = string; // e.g. 2026-11-12T08:00:00+07:00

export type AccountRole = 'ADMIN_PANITIA' | 'PETUGAS_CHECKIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';
export type ParticipantStatus = 'ACTIVE' | 'ARCHIVED';
export type CheckinSubject = 'MAHASISWA' | 'DOSEN';
export type CheckinMethod = 'QR' | 'MANUAL';
export type WinnerStatus = 'DRAFT' | 'PUBLISHED';
export type VotingStatus = 'DRAFT' | 'TERJADWAL' | 'AKTIF' | 'SELESAI';
export type TicketAvailabilityStatus = 'BELUM_DIBUKA' | 'TERSEDIA' | 'PENUH' | 'DITUTUP';

export interface EventContent {
  id: UUID;
  eventName: string;
  tagline: string;
  description: string;
  eventStartAt: ISODateTime;
  eventEndAt?: ISODateTime;
  venueName: string;
  venueAddress: string;
  heroImage?: string;
  footerText: string;
  fashionTeaser: {
    title: string;
    description: string;
    image?: string;
  };
  awardingTeaser: {
    title: string;
    description: string;
    image?: string;
  };
}

export interface Band {
  id: UUID;
  name: string;
  description: string;
  photo?: string;
  sortOrder: number;
}

export interface WinnerAnnouncement {
  id: UUID;
  section: 'FASHION_SHOW' | 'AWARDING';
  categoryName: string;
  winnerName: string;
  winnerPhoto?: string;
  winnerDescription: string;
  status: WinnerStatus;
  sortOrder: number;
  publishedAt?: ISODateTime;
}

export interface TicketType {
  id: UUID;
  name: string;
  description?: string;
  price: 0;
  capacity: number | null; // null = unlimited
  registrationOpensAt: ISODateTime;
  registrationClosesAt: ISODateTime;
  publication: 'DRAFT' | 'PUBLISHED';
}

export interface Participant {
  id: UUID;
  fullName: string;
  nim: string; // string so leading zero is preserved
  email: string;
  phone: string;
  studyProgram: 'D4 Sistem Informasi Kota Cerdas';
  faculty: 'Fakultas Ilmu Terapan';
  ticketTypeId: UUID;
  status: ParticipantStatus;
  registeredAt: ISODateTime;
  archivedAt?: ISODateTime;
  archivedByAccountId?: UUID;
  archiveReason?: string;
}

export interface TicketIdentity {
  participantId: UUID;
  ticketNo: string;
  voteCode: string; // unique secret ticket code for voting
  checkinQrToken: string; // opaque token for checkin QR
  issuedAt: ISODateTime;
}

export interface Candidate {
  id: UUID;
  votingId: UUID;
  name: string;
  photo?: string; // transparent background PNG/WebP
  description: string;
  sortOrder: number;
}

export interface Voting {
  id: UUID;
  title: string;
  description: string;
  privateToken: string;
  mode: 'DRAFT' | 'SCHEDULED';
  startsAt: ISODateTime;
  endsAt: ISODateTime;
}

export interface VoteRecord {
  id: UUID;
  votingId: UUID;
  participantId: UUID;
  candidateId: UUID;
  votedAt: ISODateTime;
}

export interface InvitationTemplate {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  senderName: string;
}

export interface LecturerInvitation {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  inviteCode: string;
  inviteToken: string;
  checkinQrToken: string;
  active: boolean;
}

export interface CheckinRecord {
  id: UUID;
  subjectType: CheckinSubject;
  subjectId: UUID; // Participant.id or LecturerInvitation.id
  checkedInAt: ISODateTime;
  method: CheckinMethod;
  operatorAccountId: UUID;
  operatorName?: string;
  subjectName?: string;
  subjectIdentifier?: string; // NIM for student, email/code for lecturer
  ticketName?: string;
}

export type Role = AccountRole;

export interface InternalAccount {
  id: UUID;
  fullName: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  password?: string; // demo mock credential
}

export interface AuditLog {
  id: UUID;
  actorAccountId: UUID;
  actorName: string;
  action: 'EDIT_PARTICIPANT' | 'ARCHIVE_PARTICIPANT' | 'RESTORE_PARTICIPANT' | 'CHECK_IN' | 'UPDATE_EVENT';
  subjectId: UUID;
  happenedAt: ISODateTime;
  summary: string;
}
