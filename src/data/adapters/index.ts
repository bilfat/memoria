import { mockStore } from '../mock/mockStore';
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
} from '@/types';

// Helper to simulate minor async latency for realistic loading states
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const eventAdapter = {
  async getEvent(): Promise<EventContent> {
    await delay();
    return mockStore.getEvent();
  },
  async updateEvent(changes: Partial<EventContent>): Promise<EventContent> {
    await delay();
    return mockStore.updateEvent(changes);
  },
  async listBands(): Promise<Band[]> {
    await delay();
    return mockStore.getBands();
  },
  async saveBand(band: Omit<Band, 'id'> & { id?: string }): Promise<Band> {
    await delay();
    return mockStore.saveBand(band);
  },
  async deleteBand(id: string): Promise<void> {
    await delay();
    mockStore.deleteBand(id);
  },
  async listWinners(section?: 'FASHION_SHOW' | 'AWARDING'): Promise<WinnerAnnouncement[]> {
    await delay();
    return mockStore.getWinners(section);
  },
  async listPublishedWinners(section: 'FASHION_SHOW' | 'AWARDING'): Promise<WinnerAnnouncement[]> {
    await delay();
    return mockStore.getPublishedWinners(section);
  },
  async saveWinner(winner: Omit<WinnerAnnouncement, 'id'> & { id?: string }): Promise<WinnerAnnouncement> {
    await delay();
    return mockStore.saveWinner(winner);
  },
  async deleteWinner(id: string): Promise<void> {
    await delay();
    mockStore.deleteWinner(id);
  },
  async toggleWinnerPublish(id: string): Promise<WinnerAnnouncement> {
    await delay();
    return mockStore.toggleWinnerPublish(id);
  },
};

export const ticketAdapter = {
  async listTickets(): Promise<TicketType[]> {
    await delay();
    return mockStore.getTickets();
  },
  async listPublishedTickets(): Promise<TicketType[]> {
    await delay();
    return mockStore.getPublishedTickets();
  },
  async getTicket(id: string): Promise<TicketType | undefined> {
    await delay();
    return mockStore.getTicketById(id);
  },
  async saveTicket(ticket: Omit<TicketType, 'id'> & { id?: string }): Promise<TicketType> {
    await delay();
    return mockStore.saveTicket(ticket);
  },
  getRemainingQuota(ticketId: string): number | null {
    return mockStore.getRemainingQuota(ticketId);
  },
  getTicketAvailability(ticket: TicketType) {
    return mockStore.getTicketAvailability(ticket);
  },
};

export const participantAdapter = {
  async listParticipants(status?: 'ACTIVE' | 'ARCHIVED'): Promise<Participant[]> {
    await delay();
    return mockStore.getParticipants(status);
  },
  async getParticipant(id: string): Promise<Participant | undefined> {
    await delay();
    return mockStore.getParticipantById(id);
  },
  async getTicketIdentity(participantId: string): Promise<TicketIdentity | undefined> {
    await delay();
    return mockStore.getTicketIdentity(participantId);
  },
  async register(input: {
    fullName: string;
    nim: string;
    email: string;
    phone: string;
    ticketTypeId: string;
  }): Promise<{ participant: Participant; ticketIdentity: TicketIdentity }> {
    await delay(300);
    return mockStore.registerParticipant(input);
  },
  async updateParticipant(
    id: string,
    changes: {
      fullName: string;
      nim: string;
      email: string;
      phone: string;
      ticketTypeId: string;
    },
    adminPasswordConfirm: string
  ): Promise<Participant> {
    await delay(250);
    return mockStore.updateParticipant(id, changes, adminPasswordConfirm);
  },
  async archiveParticipant(
    id: string,
    adminPasswordConfirm: string,
    reason?: string
  ): Promise<Participant> {
    await delay(250);
    return mockStore.archiveParticipant(id, adminPasswordConfirm, reason);
  },
  async restoreParticipant(id: string): Promise<Participant> {
    await delay(250);
    return mockStore.restoreParticipant(id);
  },
};

export const votingAdapter = {
  async listVotings(): Promise<Voting[]> {
    await delay();
    return mockStore.getVotings();
  },
  async getVoting(id: string): Promise<Voting | undefined> {
    await delay();
    return mockStore.getVotingById(id);
  },
  async getVotingByToken(token: string): Promise<Voting | undefined> {
    await delay();
    return mockStore.getVotingByToken(token);
  },
  async listCandidates(votingId: string): Promise<Candidate[]> {
    await delay();
    return mockStore.getCandidatesByVotingId(votingId);
  },
  async listVoteRecords(votingId: string): Promise<VoteRecord[]> {
    await delay();
    return mockStore.getVoteRecordsByVotingId(votingId);
  },
  async saveVoting(data: Omit<Voting, 'id' | 'privateToken'> & { id?: string }): Promise<Voting> {
    await delay();
    return mockStore.saveVoting(data);
  },
  async saveCandidate(data: Omit<Candidate, 'id'> & { id?: string }): Promise<Candidate> {
    await delay();
    return mockStore.saveCandidate(data);
  },
  async deleteCandidate(id: string): Promise<void> {
    await delay();
    mockStore.deleteCandidate(id);
  },
  async verifyVoter(
    token: string,
    nim: string,
    voteCode: string
  ): Promise<{ participant: Participant; voting: Voting; alreadyVoted: boolean }> {
    await delay(250);
    return mockStore.verifyVoter(token, nim, voteCode);
  },
  async castVote(votingId: string, participantId: string, candidateId: string): Promise<VoteRecord> {
    await delay(350);
    return mockStore.castVote(votingId, participantId, candidateId);
  },
  getVotingRuntimeStatus(voting: Voting) {
    return mockStore.getVotingRuntimeStatus(voting);
  },
  hasParticipantVoted(participantId: string, votingId: string): boolean {
    return mockStore.hasParticipantVoted(participantId, votingId);
  },
};

export const invitationAdapter = {
  async getTemplate(): Promise<InvitationTemplate> {
    await delay();
    return mockStore.getInvitationTemplate();
  },
  async updateTemplate(tpl: InvitationTemplate): Promise<InvitationTemplate> {
    await delay();
    return mockStore.updateInvitationTemplate(tpl);
  },
  async listLecturers(): Promise<LecturerInvitation[]> {
    await delay();
    return mockStore.getLecturerInvitations();
  },
  async getLecturerByToken(token: string): Promise<LecturerInvitation | undefined> {
    await delay();
    return mockStore.getLecturerByToken(token);
  },
  async saveLecturer(
    data: Omit<LecturerInvitation, 'id' | 'inviteCode' | 'inviteToken' | 'checkinQrToken'> & {
      id?: string;
    }
  ): Promise<LecturerInvitation> {
    await delay();
    return mockStore.saveLecturer(data);
  },
  async toggleActive(id: string): Promise<LecturerInvitation> {
    await delay();
    return mockStore.toggleLecturerActive(id);
  },
};

export const checkinAdapter = {
  async listRecords(): Promise<CheckinRecord[]> {
    await delay();
    return mockStore.getCheckinRecords();
  },
  async checkInSubject(input: {
    subjectType: 'MAHASISWA' | 'DOSEN';
    subjectId: string;
    method: 'QR' | 'MANUAL';
  }): Promise<{ record: CheckinRecord; alreadyCheckedIn: boolean }> {
    await delay(200);
    return mockStore.checkInSubject(input);
  },
  async lookupByQr(qrToken: string) {
    await delay(150);
    return mockStore.lookupByQr(qrToken);
  },
  async lookupManualStudent(nim: string) {
    await delay(150);
    return mockStore.lookupManualStudent(nim);
  },
  async lookupManualLecturer(identifier: string) {
    await delay(150);
    return mockStore.lookupManualLecturer(identifier);
  },
};

export const accountAdapter = {
  async listAccounts(): Promise<InternalAccount[]> {
    await delay();
    return mockStore.getAccounts();
  },
  async saveAccount(
    data: Omit<InternalAccount, 'id'> & { id?: string }
  ): Promise<InternalAccount> {
    await delay();
    return mockStore.saveAccount(data);
  },
  async resetPassword(accountId: string, newPass: string): Promise<void> {
    await delay();
    mockStore.resetPassword(accountId, newPass);
  },
  async toggleStatus(accountId: string): Promise<InternalAccount> {
    await delay();
    return mockStore.toggleAccountStatus(accountId);
  },
  getCurrentUser(): InternalAccount | null {
    return mockStore.getCurrentUser();
  },
  async login(email: string, password?: string): Promise<InternalAccount> {
    await delay(250);
    return mockStore.login(email, password);
  },
  logout(): void {
    mockStore.logout();
  },
};
