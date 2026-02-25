import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

interface DashboardProps {
  onImageCaptured: (base64Image: string, mimeType: string) => void;
  patientName: string;
  onBack: () => void;
  onLogout: () => void;
}

export function Dashboard({
  onImageCaptured,
  patientName,
  onBack,
  onLogout,
}: DashboardProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      // Fallback to file input
      cameraInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPreview(dataUrl);
        setMimeType("image/jpeg");
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (preview && mimeType) {
      onImageCaptured(preview, mimeType);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              DentoScan AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 font-medium">
              Paciente: <span className="text-slate-900">{patientName}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Captura de Imagem
          </h2>
          <p className="text-slate-500 mb-8">
            Tire uma foto clara dos dentes do paciente ou faça upload de uma
            imagem existente para análise.
          </p>

          {isCameraOpen ? (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white shadow-sm transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={capturePhoto}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <Camera className="h-5 w-5" />
                Capturar Foto
              </button>
            </div>
          ) : !preview ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="h-16 w-16 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                  <Camera className="h-8 w-8 text-slate-500 group-hover:text-blue-600" />
                </div>
                <div className="text-slate-700 font-medium">Usar Câmera</div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="h-16 w-16 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                  <Upload className="h-8 w-8 text-slate-500 group-hover:text-blue-600" />
                </div>
                <div className="text-slate-700 font-medium">Fazer Upload</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[400px] object-contain"
                />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:bg-white shadow-sm transition-colors"
                >
                  Trocar Imagem
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors shadow-sm"
              >
                Analisar Imagem com IA
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
