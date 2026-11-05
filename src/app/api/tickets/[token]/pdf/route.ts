import { NextRequest, NextResponse } from 'next/server';
import { fetchTicketByAccessToken } from '@/lib/ticketData';
import { generateTicketPdfBuffer } from '@/lib/ticketPdf';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token akses tiket tidak disertakan.' },
        { status: 400 }
      );
    }

    const ticket = await fetchTicketByAccessToken(token);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Tiket tidak ditemukan atau token tidak valid.' },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateTicketPdfBuffer(ticket);
    const safeNim = ticket.nim.replace(/[^0-9a-zA-Z]/g, '');
    const safeTicketNumber = ticket.ticketNumber.replace(/[^0-9a-zA-Z-]/g, '');
    const filename = `MEMORIA-Ticket-${safeNim}-${safeTicketNumber}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[GET /api/tickets/[token]/pdf] Exception:', err);
    return NextResponse.json(
      { error: 'Gagal membuat berkas PDF tiket.' },
      { status: 500 }
    );
  }
}

