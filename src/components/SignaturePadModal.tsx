import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  Check,
  X,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  title: string;
  signeeName: string;
  signeeRole: 'treasurer' | 'manager';
  existingSignature?: string;
  onSaveSignature: (signatureDataUrl: string) => void;
  onClearSignature?: () => void;
  onClose: () => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  title,
  signeeName,
  signeeRole,
  existingSignature,
  onSaveSignature,
  onClearSignature,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#0f172a'); // default dark slate ink
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  // Initialize Canvas
  useEffect(() => {
    if (!isOpen) return;

    // slight delay to let modal mount and get accurate dimensions
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        // If existing signature exists, draw it as preview
        if (existingSignature) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            setHasDrawn(true);
          };
          img.src = existingSignature;
        } else {
          ctx.clearRect(0, 0, rect.width, rect.height);
          setHasDrawn(false);
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, existingSignature]);

  if (!isOpen) return null;

  // Drawing Handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left,
        y: (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Export as transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
    onClose();
  };

  const handleRemoveExisting = () => {
    if (onClearSignature) {
      onClearSignature();
    }
    handleClear();
    onClose();
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();

        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, rect.width, rect.height);
          // Draw image contained inside canvas
          const hRatio = rect.width / img.width;
          const vRatio = rect.height / img.height;
          const ratio = Math.min(hRatio, vRatio, 1);
          const centerShiftX = (rect.width - img.width * ratio) / 2;
          const centerShiftY = (rect.height - img.height * ratio) / 2;
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShiftX,
            centerShiftY,
            img.width * ratio,
            img.height * ratio
          );
          setHasDrawn(true);
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <PenTool className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                {signeeName} ({signeeRole === 'treasurer' ? 'Trésorière' : 'Responsable'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Soraty eto amin'ny efijery amin'ny rantsan-tànana (telefaonina) na souris ny sonianao :
          </p>

          {/* Canvas Signature Box */}
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-inner h-48 sm:h-52 flex flex-col items-center justify-center touch-none select-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />

            {!hasDrawn && (
              <div className="absolute pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5">
                <PenTool className="w-6 h-6 stroke-1 text-slate-300" />
                <span className="text-xs font-medium">Toerana hanasoniavana (Sonia eto)</span>
              </div>
            )}

            {/* Signature Base Baseline Line */}
            <div className="absolute bottom-6 left-8 right-8 border-b border-dashed border-slate-300 pointer-events-none" />
          </div>

          {/* Tools & Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            {/* Ink color picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Loko :</span>
              <button
                type="button"
                onClick={() => setStrokeColor('#0f172a')}
                className={`w-6 h-6 rounded-full bg-slate-900 border-2 transition-transform ${
                  strokeColor === '#0f172a' ? 'scale-110 border-blue-500' : 'border-transparent'
                }`}
                title="Mainty / Noir"
              />
              <button
                type="button"
                onClick={() => setStrokeColor('#1d4ed8')}
                className={`w-6 h-6 rounded-full bg-blue-700 border-2 transition-transform ${
                  strokeColor === '#1d4ed8' ? 'scale-110 border-blue-400' : 'border-transparent'
                }`}
                title="Manga / Bleu"
              />
            </div>

            {/* Action buttons on pad */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Fafana (Effacer)</span>
              </button>

              <label className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Hampiditra sary</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div>
            {existingSignature && onClearSignature && (
              <button
                type="button"
                onClick={handleRemoveExisting}
                className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Esory ny sonia</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Aoka ihany
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasDrawn}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Hamarina & Tehirizo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
