/**
 * clientImageCompressor
 * Utility kompresi gambar di sisi browser sebelum diunggah ke Supabase Storage.
 * - Membatasi file asli maksimum 10 MB.
 * - Melakukan resize jika dimensi melebihi batas (maks 2000px).
 * - Mempertahankan transparansi (alpha channel) untuk PNG & WebP.
 * - Mengembalikan Blob hasil kompresi berkualitas tinggi.
 */

export interface CompressionResult {
  blob: Blob;
  fileName: string;
  contentType: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressClientImage(
  file: File,
  maxDimension = 2000,
  quality = 0.88
): Promise<CompressionResult> {
  const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_ORIGINAL_SIZE) {
    throw new Error('Ukuran file asli melebihi batas maksimum 10 MB.');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WebP.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar rusak atau tidak valid.'));
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Resize jika melebihi maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Tidak dapat menginisialisasi context canvas grafis.'));
          return;
        }

        // Tentukan output MIME & pertahankan alpha jika PNG/WebP
        const isTransparent = file.type === 'image/png' || file.type === 'image/webp';
        const outputMime = isTransparent ? 'image/webp' : 'image/jpeg';

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal melakukan kompresi gambar.'));
              return;
            }

            const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
            const extension = outputMime === 'image/webp' ? 'webp' : 'jpg';
            const fileName = `${cleanBaseName}.${extension}`;

            resolve({
              blob,
              fileName,
              contentType: outputMime,
              originalSize: file.size,
              compressedSize: blob.size,
              width,
              height,
            });
          },
          outputMime,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

