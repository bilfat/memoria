'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  VideoCamera,
  VideoCameraSlash,
  UploadSimple,
  ArrowsClockwise,
  WarningCircle,
  Sparkle,
  CheckCircle,
} from '@phosphor-icons/react';

interface CameraQrScannerProps {
  onScan: (qrToken: string) => void;
  isProcessing?: boolean;
}

/**
 * CameraQrScanner
 * Komponen pemindai QR Code berbasis kamera real-time (Webcam / HP Camera)
 * - Video stream kamera aktif dengan overlay target bidik (reticle) & laser sweep
 * - Menggunakan jsQR untuk decoding instan tiap frame tanpa latensi
 * - Audio beep feedback & visual flash saat QR terdeteksi
 * - Mendukung ganti kamera (depan/belakang/eksternal)
 * - Mendukung unggah gambar QR sebagai opsi cadangan
 */
export function CameraQrScanner({ onScan, isProcessing = false }: CameraQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [scanFlash, setScanFlash] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // Audio Beep generator via Web Audio API (tanpa butuh file mp3 eksternal)
  const playBeepSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.08); // Ramp ke 1320Hz

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio not permitted or not supported
    }
  }, []);

  // Ambil daftar kamera yang tersedia pada perangkat
  const getCameraDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        // Prioritaskan kamera belakang / environment jika ada
        const backCamera = videoInputs.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('belakang') ||
            d.label.toLowerCase().includes('environment')
        );
        setSelectedDeviceId(backCamera ? backCamera.deviceId : videoInputs[0].deviceId);
      }
    } catch {
      // Ignore device enumeration error
    }
  }, [selectedDeviceId]);

  // Hentikan video stream kamera
  const stopCameraStream = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Mulai video stream kamera
  const startCameraStream = useCallback(
    async (deviceId?: string) => {
      setCameraError(null);
      setCameraLoading(true);

      // Pastikan stream lama dihentikan dahulu
      stopCameraStream();

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Browser Anda tidak mendukung akses kamera web.');
        }

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraActive(true);
          setCameraLoading(false);
          await getCameraDevices();
        }
      } catch (err: any) {
        setCameraLoading(false);
        setIsCameraActive(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Izin akses kamera ditolak. Berikan izin di browser Anda untuk memindai QR.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('Kamera tidak ditemukan pada perangkat Anda.');
        } else {
          setCameraError(err.message || 'Gagal mengaktifkan kamera.');
        }
      }
    },
    [stopCameraStream, getCameraDevices]
  );

  // Loop deteksi frame QR dari video canvas
  useEffect(() => {
    if (!isCameraActive) return;

    let isActive = true;

    const scanFrame = () => {
      if (!isActive || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);

          // Pindai frame dengan jsQR
          const code = jsQR(imageData.data, width, height, {
            inversionAttempts: 'dontInvert',
          });

          const now = Date.now();
          // Throttling 2 detik agar tidak mendeteksi QR berulang kali sekaligus
          if (code && code.data && now - lastScanTimeRef.current > 2000) {
            lastScanTimeRef.current = now;
            setLastScannedCode(code.data);
            setScanFlash(true);
            playBeepSound();

            setTimeout(() => setScanFlash(false), 500);

            // Teruskan token hasil scan ke parent
            onScan(code.data);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isActive = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraActive, onScan, playBeepSound]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Handler unggah foto QR manual
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);

        if (code && code.data) {
          playBeepSound();
          setLastScannedCode(code.data);
          setScanFlash(true);
          setTimeout(() => setScanFlash(false), 500);
          onScan(code.data);
        } else {
          alert('Tidak ditemukan QR code yang valid pada foto tersebut. Pastikan gambar jelas dan memiliki kontras baik.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Camera Viewfinder Stage */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[420px] rounded-2xl bg-neutral-950 overflow-hidden border-2 border-neutral-800 shadow-2xl flex items-center justify-center select-none group">
        {/* Hidden video & offscreen canvas */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan Success Green Flash Overlay */}
        {scanFlash && (
          <div className="absolute inset-0 bg-emerald-500/35 border-4 border-emerald-400 z-30 pointer-events-none animate-pulse flex items-center justify-center">
            <div className="px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold tracking-wider flex items-center gap-2 shadow-2xl">
              <CheckCircle size={18} weight="fill" className="text-emerald-400" />
              <span>QR CODE TERDETEKSI!</span>
            </div>
          </div>
        )}

        {/* Viewfinder Reticle / Target Area saat kamera aktif */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-20">
            {/* Target Reticle Box */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-white/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Animated Laser Sweep Beam */}
              <div
                className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
                style={{
                  animation: 'laserSweep 2.2s ease-in-out infinite alternate',
                }}
              />
            </div>

            {/* Instruction Overlay */}
            <span className="mt-4 px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-mono tracking-wider text-emerald-300 border border-emerald-500/40 shadow-lg">
              ARAHKAN KE QR CODE TIKET / UNDANGAN
            </span>
          </div>
        )}

        {/* Idle / Camera Off State */}
        {!isCameraActive && !cameraLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-neutral-400 z-10 bg-neutral-950/95">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700/60 flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
              <Camera size={32} weight="duotone" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 tracking-tight">
              Pemindai Kamera Siap Digunakan
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-relaxed">
              Klik tombol di bawah untuk mengaktifkan kamera webcam laptop atau kamera smartphone Anda untuk memindai QR tiket peserta secara otomatis.
            </p>
            <button
              type="button"
              onClick={() => startCameraStream(selectedDeviceId)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <VideoCamera size={16} weight="fill" />
              <span>Aktifkan Kamera Scan</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {cameraLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-neutral-300 z-10 bg-neutral-950/90">
            <ArrowsClockwise size={32} className="animate-spin text-emerald-400 mb-3" />
            <span className="text-xs font-medium">Menghubungkan ke kamera...</span>
          </div>
        )}
      </div>

      {/* Inline Keyframe for Laser Sweep */}
      <style jsx>{`
        @keyframes laserSweep {
          0% {
            top: 8%;
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Error Banner jika izin kamera bermasalah */}
      {cameraError && (
        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} className="text-red-600 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            type="button"
            onClick={() => startCameraStream(selectedDeviceId)}
            className="px-2.5 py-1 text-[11px] font-bold bg-white border border-red-300 rounded hover:bg-red-50 text-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 2. Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button
              type="button"
              onClick={stopCameraStream}
              className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <VideoCameraSlash size={15} weight="bold" />
              <span>Matikan Kamera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCameraStream(selectedDeviceId)}
              disabled={cameraLoading}
              className="px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <VideoCamera size={15} weight="bold" />
              <span>Buka Kamera</span>
            </button>
          )}

          {/* Opsi Ganti Kamera jika ada lebih dari 1 kamera */}
          {videoDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDeviceId(id);
                if (isCameraActive) {
                  startCameraStream(id);
                }
              }}
              className="text-xs px-2.5 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              {videoDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  {d.label || `Kamera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Cadangan: Unggah Gambar QR dari File */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Unggah berkas foto/screenshot QR code tiket"
          >
            <UploadSimple size={15} />
            <span>Unggah Gambar QR</span>
          </button>
        </div>
      </div>

      {/* Info Token Terakhir yang Dipindai */}
      {lastScannedCode && (
        <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5 px-2">
          <Sparkle size={12} className="text-emerald-600" />
          <span>Token QR Terakhir Terbaca:</span>
          <span className="font-semibold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
            {lastScannedCode}
          </span>
        </div>
      )}
    </div>
  );
}
