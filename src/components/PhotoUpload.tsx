'use client';

import { useRef, useState } from 'react';
import { Camera, Image, X } from 'lucide-react';

interface Props {
  onImageSelected: (base64: string, preview: string) => void;
  onClear: () => void;
  preview?: string;
}

export default function PhotoUpload({ onImageSelected, onClear, preview }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      onImageSelected(base64, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="食事写真" className="w-full h-48 object-cover" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
        dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="flex justify-center gap-4 mb-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <div className="gradient-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
            <Camera size={28} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-600">カメラで撮影</span>
        </button>
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.removeAttribute('capture');
              fileRef.current.click();
            }
          }}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <div className="gradient-green w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shadow-green-200">
            <Image size={28} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-600">ライブラリから</span>
        </button>
      </div>
      <p className="text-xs text-gray-400">写真をドラッグ＆ドロップしてもOK</p>
    </div>
  );
}
