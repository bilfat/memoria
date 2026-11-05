import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { listAdminParticipantsAction } from '@/app/actions/participants';
import { generateParticipantsXlsxBuffer } from '@/lib/xlsxExport';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentStaffSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const tab = (searchParams.get('tab') as 'active' | 'archived') || 'active';
    const ticketTypeId = searchParams.get('ticketTypeId') || undefined;
    const attendanceFilter = (searchParams.get('attendanceFilter') as 'ALL' | 'HADIR' | 'BELUM') || 'ALL';
    const searchQuery = searchParams.get('searchQuery') || undefined;

    // Ambil seluruh data yang cocok dengan filter untuk diekspor
    const result = await listAdminParticipantsAction({
      tab,
      ticketTypeId,
      attendanceFilter,
      searchQuery,
      page: 1,
      pageSize: 5000,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gagal memuat data peserta.' },
        { status: 500 }
      );
    }

    const xlsxBuffer = generateParticipantsXlsxBuffer(result.participants);
    const dateStr = new Date().toISOString().substring(0, 10);
    const filename = `MEMORIA-Peserta-${tab.toUpperCase()}-${dateStr}.xlsx`;

    return new Response(xlsxBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[GET /api/admin/participants/export] Exception:', err);
    return NextResponse.json(
      { error: 'Gagal membuat berkas ekspor XLSX.' },
      { status: 500 }
    );
  }
}

