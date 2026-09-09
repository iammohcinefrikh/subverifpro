import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES } from '../../config/documentTypes';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200'
            : isDragOver
            ? 'border-brand-500 bg-brand-50/80 shadow-lg ring-4 ring-brand-100 scale-[1.005]'
            : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400'
        }`}
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

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-card border border-slate-200 flex items-center justify-center text-brand-600">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Glissez et déposez vos pièces justificatives ici, ou{' '}
              <span className="text-brand-600 hover:text-brand-700 underline font-semibold">
                parcourez vos fichiers
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Formats acceptés : PDF (texte & scanné), JPG, PNG • Maximum 10 Mo par document
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Extraction OCR automatique dès le dépôt
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
