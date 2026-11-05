import * as XLSX from 'xlsx';
import { formatWibDateOnly, formatWibTimeOnly } from './date';
import { ParticipantListItemDTO } from '@/app/actions/participants';

/**
 * Sanitasi string untuk mencegah Formula Injection pada aplikasi spreadsheet
 * (=, +, -, @, tab, carriage return).
 */
export function sanitizeCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Membangun objek Workbook XLSX dari data peserta resmi MEMORIA
 * (Bebas dari kolom / statistik Voting Phase 2).
 */
export function buildParticipantsWorkbook(participants: ParticipantListItemDTO[]): XLSX.WorkBook {
  const headers = [
    'No',
    'Nama Lengkap',
    'NIM',
    'Program Studi',
    'Fakultas',
    'Email',
    'Nomor WhatsApp / HP',
    'Jenis Tiket',
    'Nomor Tiket',
    'Status Kehadiran',
    'Tanggal Check-in (WIB)',
    'Jam Check-in (WIB)',
    'Status Akun Tiket',
  ];

  const rows = participants.map((p, idx) => {
    const checkinDate = p.checkedInAt ? formatWibDateOnly(p.checkedInAt) : '—';
    const checkinTime = p.checkedInAt ? formatWibTimeOnly(p.checkedInAt) : '—';

    return [
      idx + 1,
      sanitizeCellValue(p.fullName),
      sanitizeCellValue(p.nim), // NIM teks aman
      sanitizeCellValue(p.studyProgram),
      sanitizeCellValue(p.faculty),
      sanitizeCellValue(p.email),
      sanitizeCellValue(p.phone), // Kontak teks aman
      sanitizeCellValue(p.ticketTypeName),
      sanitizeCellValue(p.ticketNumber),
      p.hasCheckedIn ? 'Hadir' : 'Belum Check-in',
      checkinDate,
      checkinTime,
      p.status === 'active' ? 'Aktif' : 'Diarsipkan',
    ];
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set explicit text type for NIM (col index 2) and Phone (col index 6)
  participants.forEach((_, rowIndex) => {
    const nimCellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 2 });
    if (worksheet[nimCellRef]) {
      worksheet[nimCellRef].t = 's'; // string type
    }
    const phoneCellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 6 });
    if (worksheet[phoneCellRef]) {
      worksheet[phoneCellRef].t = 's'; // string type
    }
  });

  // Automatic column widths
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
  return workbook;
}

/**
 * Menghasilkan biner Buffer Uint8Array untuk HTTP Route Handler
 */
export function generateParticipantsXlsxBuffer(
  participants: ParticipantListItemDTO[]
): Uint8Array {
  const workbook = buildParticipantsWorkbook(participants);
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return new Uint8Array(buffer);
}

/**
 * Unduh langsung di browser client
 */
export function exportParticipantsToXlsxBrowser(
  participants: ParticipantListItemDTO[],
  filenamePrefix = 'Data-Peserta-MEMORIA-2026'
): void {
  const workbook = buildParticipantsWorkbook(participants);
  XLSX.writeFile(workbook, `${filenamePrefix}.xlsx`);
}
