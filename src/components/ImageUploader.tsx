import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Clipboard, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageSelected: (base64: string, mimeType: string, fileName?: string) => void;
  onClearImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  onImageSelected,
  onClearImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pastingNotice, setPastingNotice] = useState(false);

  // Global paste handler so students can just press Ctrl+V anywhere to paste screenshot
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFile(blob);
            setPastingNotice(true);
            setTimeout(() => setPastingNotice(false), 3000);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onImageSelected(result, file.type, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {imagePreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 shadow-lg group">
          <div className="max-h-80 overflow-auto flex items-center justify-center rounded-xl bg-slate-900/60 p-1">
            <img
              src={imagePreview}
              alt="Ảnh chụp màn hình Thonny/IDLE"
              className="max-h-72 w-auto object-contain rounded-lg"
            />
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur shadow">
              Đã nạp ảnh màn hình
            </span>
            <button
              type="button"
              onClick={onClearImage}
              className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition shadow"
              title="Xóa ảnh này"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-950/20'
              : 'border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-slate-950/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <div className="text-sm font-bold text-white mb-1 flex items-center justify-center gap-1.5">
              <span>Tải ảnh chụp màn hình Thonny / IDLE</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Kéo thả ảnh vào đây, nhấp để chọn tệp hoặc nhấn phím{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                Ctrl + V
              </kbd>{' '}
              để dán ảnh vừa chụp (Win + Shift + S).
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Hỗ trợ: PNG, JPG, WEBP (Ảnh chụp máy tính hoặc ảnh chụp điện thoại)</span>
          </div>
        </div>
      )}

      {pastingNotice && (
        <div className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
          <Clipboard className="w-3.5 h-3.5" />
          <span>Đã nhận ảnh chụp từ bộ nhớ tạm (Clipboard)!</span>
        </div>
      )}
    </div>
  );
};
