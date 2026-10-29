import jsPDF from 'jspdf';
import { generateQrDataUrl } from './qrCode';
import { Participant, TicketIdentity, TicketType, EventContent } from '@/types';
import { formatWibDateTime } from './date';

export async function generateTicketPdf(data: {
  participant: Participant;
  ticketIdentity: TicketIdentity;
  ticketType: TicketType;
  event: EventContent;
}): Promise<void> {
  const { participant, ticketIdentity, ticketType, event } = data;

  // Landscape ticket card size: 210mm x 95mm (classic boarding / premiere ticket size)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 95],
  });

  // Base background: Dark Wine / Deep Velvet
  doc.setFillColor(53, 10, 16); // #350A10
  doc.rect(0, 0, 210, 95, 'F');

  // Outer border: Antique Gold (#D6B46A)
  doc.setDrawColor(214, 180, 106);
  doc.setLineWidth(1.2);
  doc.rect(4, 4, 202, 87);

  // Inner thin border
  doc.setLineWidth(0.3);
  doc.rect(5.5, 5.5, 199, 84);

  // Ticket Header Left: MEMORIA Branding
  doc.setTextColor(214, 180, 106); // Gold
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('M E M O R I A', 12, 16);

  doc.setTextColor(245, 233, 211); // Warm Ivory
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('DIESNATALIS SIKC 2026 — VELVET NIGHT', 12, 21);

  // Perforation divider line between ticket body and stub
  doc.setDrawColor(214, 180, 106);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(148, 5.5, 148, 89.5);
  doc.setLineDashPattern([], 0); // reset dash

  // Ticket Type Banner (Left)
  doc.setFillColor(137, 21, 35); // Velvet Burgundy (#891523)
  doc.rect(12, 25, 126, 7, 'F');
  doc.setTextColor(255, 249, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(ticketType.name.toUpperCase(), 15, 29.8);

  // Ticket Number & Issue Date
  doc.setTextColor(214, 180, 106);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`NO. TIKET: ${ticketIdentity.ticketNo}`, 90, 29.8);

  // Participant Details Grid
  doc.setTextColor(169, 138, 143); // Dusty Rose / Muted
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('NAMA PESERTA', 12, 38);
  doc.text('NIM', 85, 38);

  doc.setTextColor(255, 249, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(participant.fullName, 12, 43);
  doc.text(participant.nim, 85, 43);

  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PROGRAM STUDI & FAKULTAS', 12, 49);
  doc.text('KODE UNIK VOTING (RAHASIA)', 85, 49);

  doc.setTextColor(245, 233, 211);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`${participant.studyProgram} — ${participant.faculty}`, 12, 53.5);

  // Voting Code Box
  doc.setFillColor(20, 8, 9); // Midnight Black
  doc.rect(85, 50.5, 53, 6.5, 'F');
  doc.setDrawColor(214, 180, 106);
  doc.setLineWidth(0.4);
  doc.rect(85, 50.5, 53, 6.5);
  doc.setTextColor(214, 180, 106);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.text(ticketIdentity.voteCode, 88, 55);

  // Event Details Box
  doc.setDrawColor(75, 20, 30);
  doc.setLineWidth(0.3);
  doc.line(12, 59, 138, 59);

  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('WAKTU & LOKASI ACARA', 12, 64);

  doc.setTextColor(245, 233, 211);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(formatWibDateTime(event.eventStartAt), 12, 68.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${event.venueName} — ${event.venueAddress}`, 12, 73);

  // Footnote instructions
  doc.setTextColor(169, 138, 143);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text(
    '* Tunjukkan QR Code pada gate masuk teater. Simpan kode voting untuk private vote di link panitia.',
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
  doc.text(ticketIdentity.ticketNo, 154, 18.5);

  // Render QR Code in Stub
  const qrDataUrl = await generateQrDataUrl(ticketIdentity.checkinQrToken);
  if (qrDataUrl) {
    // White background box for QR code print-safety
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
  doc.text('1 Tiket / Mahasiswa', 163, 79);

  // Save / trigger browser download
  const filename = `MEMORIA-Ticket-${participant.nim}-${ticketIdentity.ticketNo}.pdf`;
  doc.save(filename);
}
