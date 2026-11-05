import { z } from 'zod';

export const TELKOM_FACULTIES = [
  'Fakultas Ilmu Terapan',
  'Fakultas Komunikasi Sosial',
  'Fakultas Ekonomi Bisnis',
  'Fakultas Industri Kreatif',
  'Fakultas Informatika',
  'Fakultas Teknik Elektro',
  'Fakultas Kedokteran',
  'Fakultas Rekayasa Industri',
] as const;

export type TelkomFaculty = (typeof TELKOM_FACULTIES)[number];

// Schema Registrasi Mahasiswa
export const participantRegistrationSchema = z.object({
  ticketTypeId: z.string().uuid('ID tiket tidak valid'),
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(150, 'Nama terlalu panjang'),
  nim: z
    .string()
    .trim()
    .regex(/^[0-9]{5,20}$/, 'NIM harus berupa 5-20 digit angka'),
  studyProgram: z.string().trim().min(2, 'Program studi wajib diisi').max(100, 'Program studi terlalu panjang'),
  faculty: z.enum(TELKOM_FACULTIES, {
    message: 'Fakultas harus dipilih dari 8 fakultas resmi Universitas Telkom',
  }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Nomor WhatsApp / HP tidak valid (minimal 10 digit angka, diawali 08, 62, atau +62)'),
  email: z.string().trim().email('Format email tidak valid (contoh: nama@domain.com)').max(200, 'Email terlalu panjang'),
  idempotencyKey: z.string().optional(),
});

// Standard API Response Envelope
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Schema Kelola Tiket (Phase 5)
export const ticketTypeInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Nama jenis tiket minimal 2 karakter')
      .max(100, 'Nama jenis tiket maksimal 100 karakter'),
    description: z
      .string()
      .trim()
      .max(500, 'Deskripsi maksimal 500 karakter')
      .optional()
      .nullable()
      .transform((val) => val || null),
    capacity: z
      .number()
      .int('Kapasitas harus berupa bilangan bulat')
      .positive('Kapasitas harus lebih besar dari 0')
      .nullable()
      .optional()
      .transform((val) => (val === undefined ? null : val)),
    registrationOpenAt: z.string().min(1, 'Waktu pendaftaran dibuka wajib diisi'),
    registrationCloseAt: z.string().min(1, 'Waktu pendaftaran ditutup wajib diisi'),
    status: z.enum(['draft', 'published', 'archived'], {
      message: 'Status tiket harus salah satu dari: draft, published, archived',
    }),
  })
  .refine(
    (data) => {
      const openDate = new Date(data.registrationOpenAt);
      const closeDate = new Date(data.registrationCloseAt);
      return closeDate.getTime() > openDate.getTime();
    },
    {
      message: 'Waktu penutupan pendaftaran harus lebih akhir dari waktu pembukaan',
      path: ['registrationCloseAt'],
    }
  );

export type TicketTypeInput = z.infer<typeof ticketTypeInputSchema>;

