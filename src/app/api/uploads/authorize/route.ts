import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { createAdminClient } from '@/lib/supabase/admin';

interface AuthorizeUploadBody {
  purpose: 'band' | 'fashion' | 'cms';
  fileName: string;
  contentType: string;
  fileSize: number;
}

/**
 * POST /api/uploads/authorize
 * Memverifikasi hak akses Admin Panitia dan menghasilkan signed upload URL Supabase Storage.
 * Mencegah pengiriman payload biner besar langsung melewati Next.js Vercel Function.
 */
export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaffSession();
    if (!staff || staff.role !== 'ADMIN_PANITIA') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Hanya Admin Panitia yang berhak mengunggah media CMS.',
          },
        },
        { status: 403 }
      );
    }

    const body = (await req.json()) as AuthorizeUploadBody;
    const { purpose, fileName, contentType, fileSize } = body;

    const allowedPurposes = ['band', 'fashion', 'cms'];
    if (!allowedPurposes.includes(purpose)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PURPOSE',
            message: 'Tujuan upload tidak didukung.',
          },
        },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: 'Format konten hanya mengizinkan JPEG, PNG, atau WebP.',
          },
        },
        { status: 400 }
      );
    }

    // Maksimal 5 MB setelah dikompresi di browser
    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'Ukuran file hasil kompresi melebihi batas 5 MB.',
          },
        },
        { status: 400 }
      );
    }

    const extension = contentType === 'image/webp' ? 'webp' : contentType === 'image/png' ? 'png' : 'jpg';
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const objectPath = `${purpose}/${uniqueFileName}`;

    const adminClient = createAdminClient();
    const bucketName = 'memoria-media';

    // Buat signed upload URL berjangka 120 detik
    const { data, error } = await adminClient.storage
      .from(bucketName)
      .createSignedUploadUrl(objectPath);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STORAGE_AUTHORIZATION_FAILED',
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // Dapatkan public URL permanen
    const { data: publicUrlData } = adminClient.storage.from(bucketName).getPublicUrl(objectPath);

    return NextResponse.json(
      {
        success: true,
        data: {
          signedUrl: data.signedUrl,
          token: data.token,
          objectPath,
          publicUrl: publicUrlData.publicUrl,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err.message || 'Gagal mengotorisasi upload media.',
        },
      },
      { status: 500 }
    );
  }
}

