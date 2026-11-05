import crypto from 'crypto';

interface ResolutionPayload {
  targetType: 'PARTICIPANT' | 'LECTURER';
  targetId: string;
  staffId: string;
  exp: number;
}

function getResolutionSecret(): string {
  const secret = process.env.CHECKIN_RESOLUTION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.trim() === '') {
    throw new Error('Konfigurasi server kritis: CHECKIN_RESOLUTION_SECRET atau SUPABASE_SERVICE_ROLE_KEY wajib tersedia.');
  }
  return secret.trim();
}

/**
 * signResolutionToken
 * Menghasilkan token resolusi bertanda tangan HMAC SHA-256 dengan masa kedaluwarsa 5 menit
 * dan terikat secara kriptografis pada ID petugas check-in yang sedang bertugas.
 */
export function signResolutionToken(
  targetType: 'PARTICIPANT' | 'LECTURER',
  targetId: string,
  staffId: string
): string {
  const secret = getResolutionSecret();
  const exp = Date.now() + 5 * 60 * 1000; // 5 menit
  const dataToSign = `${targetType}:${targetId}:${staffId}:${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

  const payload: ResolutionPayload & { sig: string } = {
    targetType,
    targetId,
    staffId,
    exp,
    sig,
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * verifyResolutionToken
 * Memvalidasi keaslian signature, masa aktif (5 menit), dan kecocokan sesi petugas.
 */
export function verifyResolutionToken(
  token: string,
  expectedStaffId?: string
): {
  valid: boolean;
  error?: string;
  targetType?: 'PARTICIPANT' | 'LECTURER';
  targetId?: string;
  staffId?: string;
} {
  try {
    const secret = getResolutionSecret();
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const payload = JSON.parse(raw);

    if (!payload.targetType || !payload.targetId || !payload.exp || !payload.sig) {
      return { valid: false, error: 'Format resolution token tidak valid.' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Sesi resolusi telah kedaluwarsa. Silakan scan ulang.' };
    }

    if (expectedStaffId && payload.staffId && payload.staffId !== expectedStaffId) {
      return { valid: false, error: 'Token resolusi hanya sah untuk sesi petugas yang memindainya.' };
    }

    const dataToSign = `${payload.targetType}:${payload.targetId}:${payload.staffId || ''}:${payload.exp}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    const actualBuffer = Buffer.from(payload.sig, 'hex');

    if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
      return { valid: false, error: 'Tanda tangan resolution token tidak sah.' };
    }

    return {
      valid: true,
      targetType: payload.targetType,
      targetId: payload.targetId,
      staffId: payload.staffId,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Gagal memproses resolution token.' };
  }
}

/**
 * maskIdentifier
 * Masking NIM atau email untuk keamanan privasi tampilan panitia
 */
export function maskIdentifier(identifier: string, isEmail = false): string {
  if (!identifier) return '-';
  if (isEmail) {
    const [local, domain] = identifier.split('@');
    if (!domain) return identifier;
    const maskedLocal = local.length <= 2 ? `${local[0]}*` : `${local.slice(0, 2)}***${local.slice(-1)}`;
    return `${maskedLocal}@${domain}`;
  } else {
    // NIM: show first 4 and last 2, mask middle
    if (identifier.length <= 5) return identifier;
    const start = identifier.slice(0, 4);
    const end = identifier.slice(-2);
    const mask = '*'.repeat(Math.max(1, identifier.length - 6));
    return `${start}${mask}${end}`;
  }
}
