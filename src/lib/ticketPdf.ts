import jsPDF from 'jspdf';
import { generateQrDataUrl } from './qrCode';
import { formatWibDateTime } from './date';
import { TicketViewData } from './ticketData';

/**
 * Membuat dokumen PDF e-ticket MEMORIA berbasis jsPDF.
 */
export async function buildTicketPdfDocument(data: TicketViewData): Promise<jsPDF> {
  // Ukuran tiket klasik: 210mm x 95mm (Golden ratio theater stub)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 95],
  });

  const isArchived = data.ticketStatus === 'archived';

  // Base background: Deep Crimson / Midnight Burgundy
  if (isArchived) {
    doc.setFillColor(35, 30, 32); // Muted dark for archived
  } else {
    doc.setFillColor(53, 10, 16); // #350A10 Deep Velvet
  }
  doc.rect(0, 0, 210, 95, 'F');

  // Outer border: Antique Gold (#D6B46A)
  doc.setDrawColor(214, 180, 106);
  doc.setLineWidth(1.2);
  doc.rect(4, 4, 202, 87);

  // Inner thin border
  doc.setLineWidth(0.3);
  doc.rect(5.5, 5.5, 199, 84);

  // Carnival Marquee Bulbs along the ticket border
  doc.setFillColor(254, 240, 138); // Glowing warm yellow
  for (let x = 12; x <= 198; x += 8) {
    doc.circle(x, 4.75, 0.55, 'F');
    doc.circle(x, 90.25, 0.55, 'F');
  }
  for (let y = 12; y <= 84; y += 6) {
    doc.circle(4.75, y, 0.55, 'F');
    doc.circle(205.25, y, 0.55, 'F');
  }

  // Header Brand: Dinamis dari database event settings
  doc.setTextColor(246, 200, 108); // Gold #F6C86C
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text(data.eventName ? data.eventName.toUpperCase() : 'MEMORIA', 12, 16);

  doc.setTextColor(245, 233, 211); // Warm Ivory
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('VELVET NIGHT — GRAND THEATRICAL CARNIVAL', 12, 21);

  // Perforation divider line between main ticket and stub
  doc.setDrawColor(214, 180, 106);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(148, 5.5, 148, 89.5);
  doc.setLineDashPattern([], 0);

  // Semicircular Carnival Notch Cutouts at top & bottom of perforation
  doc.setFillColor(24, 6, 11);
  doc.circle(148, 4, 3, 'F');
  doc.circle(148, 91, 3, 'F');
  doc.setDrawColor(214, 180, 106);
  doc.setLineWidth(0.4);
  doc.circle(148, 4, 3, 'S');
  doc.circle(148, 91, 3, 'S');

  // Ticket Type Banner (Carnival Style Ribbon)
  doc.setFillColor(isArchived ? 70 : 137, isArchived ? 70 : 21, isArchived ? 70 : 35);
  doc.rect(12, 25, 126, 7, 'F');
  doc.setTextColor(255, 249, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`★ ${data.ticketTypeName.toUpperCase()} (CARNIVAL PASS) ★`, 15, 29.8);

  // Ticket Number
  doc.setTextColor(214, 180, 106);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`NO. TIKET: ${data.ticketNumber}`, 90, 29.8);

  // Participant Info
  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('NAMA PESERTA', 12, 38);
  doc.text('NIM (NOMOR INDUK MAHASISWA)', 85, 38);

  doc.setTextColor(255, 249, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.fullName, 12, 43);
  doc.text(data.nim, 85, 43);

  // Faculty & Program Studi
  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PROGRAM STUDI & FAKULTAS', 12, 50);

  doc.setTextColor(245, 233, 211);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`${data.studyProgram} — ${data.faculty}`, 12, 54.5);

  // Status Badge on Main Body
  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('STATUS IDENTITAS TIKET', 85, 50);

  doc.setFillColor(20, 8, 9);
  doc.rect(85, 51.5, 53, 6, 'F');
  doc.setDrawColor(214, 180, 106);
  doc.setLineWidth(0.3);
  doc.rect(85, 51.5, 53, 6);
  doc.setTextColor(isArchived ? 244 : 214, isArchived ? 63 : 180, isArchived ? 94 : 106);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isArchived ? 'NONAKTIF / DIARSIPKAN' : 'RESMI TERVERIFIKASI', 88, 55.7);

  // Event Details Box
  doc.setDrawColor(75, 20, 30);
  doc.setLineWidth(0.3);
  doc.line(12, 60, 138, 60);

  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('WAKTU & LOKASI ACARA', 12, 65);

  doc.setTextColor(245, 233, 211);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(formatWibDateTime(data.eventStartAt), 12, 69.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${data.venueName} — ${data.venueAddress}`, 12, 74);

  // Footnote instructions
  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text(
    '* Tiket resmi MEMORIA diterbitkan secara gratis untuk mahasiswa Universitas Telkom. 1 Tiket berlaku untuk 1 orang.',
    12,
    81
  );

  // --- STUB SECTION (RIGHT SIDE) ---
  doc.setTextColor(214, 180, 106);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('PASS CHECK-IN', 154, 14);

  doc.setTextColor(245, 233, 211);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(data.ticketNumber, 154, 18.5);

  // Render QR Code in Stub
  const qrDataUrl = await generateQrDataUrl(data.qrToken);
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(153, 22, 48, 48, 2, 2, 'F');
    doc.addImage(qrDataUrl, 'PNG', 154.5, 23.5, 45, 45);
  }

  // QR Instructions below
  doc.setTextColor(245, 233, 211);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SCAN DI PINTU MASUK', 158, 75);

  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('1 Tiket / Mahasiswa Telkom', 158, 79);

  // Watermark if archived
  if (isArchived) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('DIARSIPKAN / NONAKTIF', 25, 52, { angle: 15 });
  }

  return doc;
}

/**
 * Menghasilkan biner Uint8Array PDF untuk Route Handler HTTP GET
 */
export async function generateTicketPdfBuffer(data: TicketViewData): Promise<Uint8Array> {
  const doc = await buildTicketPdfDocument(data);
  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

/**
 * Unduh tiket PDF langsung di browser client
 */
export async function downloadTicketPdfInBrowser(data: TicketViewData): Promise<void> {
  const doc = await buildTicketPdfDocument(data);
  const filename = `MEMORIA-Ticket-${data.nim}-${data.ticketNumber}.pdf`;
  doc.save(filename);
}
