import { NextRequest, NextResponse } from 'next/server';
import { processEmailJobsBatch } from '@/lib/brevo';
import crypto from 'crypto';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.trim() === '') {
    return false;
  }

  const expectedSecretBuffer = Buffer.from(secret.trim());

  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const tokenBuffer = Buffer.from(token);
    if (
      tokenBuffer.length === expectedSecretBuffer.length &&
      crypto.timingSafeEqual(tokenBuffer, expectedSecretBuffer)
    ) {
      return true;
    }
  }

  // 2. Check x-cron-secret header
  const xSecret = request.headers.get('x-cron-secret');
  if (xSecret) {
    const xSecretBuffer = Buffer.from(xSecret.trim());
    if (
      xSecretBuffer.length === expectedSecretBuffer.length &&
      crypto.timingSafeEqual(xSecretBuffer, expectedSecretBuffer)
    ) {
      return true;
    }
  }

  // Strictly NO query param ?secret= and NO localhost bypass without secret
  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: CRON_SECRET wajib disertakan melalui header Authorization Bearer atau x-cron-secret.' },
      { status: 401 }
    );
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10))) : 10;

  const result = await processEmailJobsBatch(limit);
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    worker: 'memoria_email_jobs_worker',
    ...result,
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
