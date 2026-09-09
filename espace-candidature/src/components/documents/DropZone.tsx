import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES } from '../../config/documentTypes';
import { useMoroccanTheme } from '../moroccan/MoroccanPatterns';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { primaryColor } = useMoroccanTheme();

  const validateAndProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Vérification de la taille (10 Mo)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`Le fichier "${file.name}" dépasse la limite maximale autorisée de 10 Mo (${(file.size / (1024 * 1024)).toFixed(1)} Mo).`);
        continue;
      }

      // Vérification du format
      const hasValidExt = /\.(pdf|png|jpe?g)$/i.test(file.name);
      if (!allowedMimeTypes.includes(file.type) && !hasValidExt) {
        setErrorMessage(`Format non supporté pour "${file.name}". Formats acceptés : PDF, PNG, JPG, JPEG.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full space-y-3 text-left">
      {/* Cadre ajouré d'inspiration Moucharabieh */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer border-2 border-dashed ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-sand-200/50 border-sand-300'
            : isDragOver
            ? 'border-terracotta-500 bg-terracotta-50/60 shadow-lg ring-4 ring-gold-300/40 scale-[1.005]'
            : 'border-sand-400/90 bg-white/80 hover:bg-sand-50/70 hover:border-terracotta-400 shadow-sm'
        }`}
        style={isDragOver ? { borderColor: primaryColor } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          disabled={disabled}
          onChange={(e) => validateAndProcessFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div
            className="w-14 h-14 rounded-2xl bg-sand-100 shadow-card border border-sand-300 flex items-center justify-center text-terracotta-600 transition-transform group-hover:scale-105"
            style={{ color: primaryColor }}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-indigo-950">
              Glissez et déposez vos pièces justificatives ici, ou{' '}
              <span
                className="text-terracotta-600 hover:text-terracotta-700 underline font-semibold cursor-pointer"
                style={{ color: primaryColor }}
              >
                parcourez vos fichiers
              </span>
            </p>
            <p className="text-xs text-sand-500">
              Formats acceptés : PDF (texte vectoriel & scanné), JPG, PNG • Maximum 10 Mo par document
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-ink-800/70 pt-2 border-t border-sand-200">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-gold-600" />
              Reconnaissance optique (OCR) en mémoire locale
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Conforme CNDP & Zéro transmission de brouillon
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
