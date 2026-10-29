import * as XLSX from 'xlsx';
import { Participant, TicketType, TicketIdentity, Voting, VoteRecord, CheckinRecord } from '@/types';
import { formatWibDateOnly, formatWibTimeOnly } from './date';

export function exportParticipantsToXlsx(data: {
  participants: Participant[];
  tickets: TicketType[];
  identities: TicketIdentity[];
  votings: Voting[];
  voteRecords: VoteRecord[];
  checkinRecords: CheckinRecord[];
  filenamePrefix?: string;
}): void {
  const { participants, tickets, identities, votings, voteRecords, checkinRecords, filenamePrefix } = data;

  // Build row headers dynamically
  const headers = [
    'No',
    'Nama Lengkap',
    'NIM',
    'Program Studi',
    'Fakultas',
    'Email',
    'Nomor HP',
    'Jenis Tiket',
    'Nomor Tiket',
    'Status Kehadiran',
    'Tanggal Check-in',
    'Jam Check-in',
    ...votings.map((v) => `Vote: ${v.title}`),
  ];

  const rows = participants.map((p, idx) => {
    const ticket = tickets.find((t) => t.id === p.ticketTypeId);
    const identity = identities.find((id) => id.participantId === p.id);
    const checkin = checkinRecords.find(
      (c) => c.subjectType === 'MAHASISWA' && c.subjectId === p.id
    );

    const hasCheckedIn = Boolean(checkin);
    const checkinDate = checkin ? formatWibDateOnly(checkin.checkedInAt) : '—';
    const checkinTime = checkin ? formatWibTimeOnly(checkin.checkedInAt) : '—';

    // Calculate voting status per voting poll
    const votingCols = votings.map((v) => {
      const hasVoted = voteRecords.some(
        (vr) => vr.participantId === p.id && vr.votingId === v.id
      );
      return hasVoted ? 'Sudah' : 'Belum';
    });

    return [
      idx + 1,
      p.fullName,
      p.nim, // string text
      p.studyProgram,
      p.faculty,
      p.email,
      p.phone, // string text
      ticket ? ticket.name : '—',
      identity ? identity.ticketNo : '—',
      hasCheckedIn ? 'Hadir' : 'Belum Check-in',
      checkinDate,
      checkinTime,
      ...votingCols,
    ];
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set explicit cell types as text for NIM and Phone to preserve leading zeroes
  participants.forEach((_, rowIndex) => {
    const nimCellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 2 }); // Col 2 = NIM
    if (worksheet[nimCellRef]) {
      worksheet[nimCellRef].t = 's'; // string type
    }
    const phoneCellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 6 }); // Col 6 = Phone
    if (worksheet[phoneCellRef]) {
      worksheet[phoneCellRef].t = 's'; // string type
    }
  });

  // Adjust column widths automatically
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    rows.forEach((row) => {
      const cellVal = String(row[i] || '');
      if (cellVal.length > maxLen) maxLen = cellVal.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peserta');

  const name = `${filenamePrefix || 'Data-Peserta-MEMORIA-2026'}.xlsx`;
  XLSX.writeFile(workbook, name);
}
