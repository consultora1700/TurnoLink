'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Trash2, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<{ url: string }>;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  placeholder?: string;
  disabled?: boolean;
  enableCamera?: boolean;
  /** 'default' = image fills aspect box, buttons below.
   *  'avatar' = round photo left + buttons right (horizontal). */
  variant?: 'default' | 'avatar';
  /** Initials fallback when variant="avatar" and no image */
  initials?: string;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  banner: 'aspect-[3/1]',
};

export function ImageUpload({
  value,
  onChange,
  onUpload,
  className,
  aspectRatio = 'square',
  placeholder = 'Subir imagen',
  disabled = false,
  enableCamera = true,
  variant = 'default',
  initials,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file) { setError('No se seleccionó ningún archivo'); return; }

      const isValidType = file.type.startsWith('image/') ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');
      if (!isValidType) { setError('Solo se permiten imágenes (JPG, PNG, GIF, WebP, HEIC)'); return; }

      const maxSize = isMobile ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) { setError(`La imagen no puede superar ${isMobile ? '10' : '5'}MB`); return; }

      setIsUploading(true);
      setUploadProgress('Preparando...');
      try {
        let fileToUpload = file;
        if (file.size > 2 * 1024 * 1024 || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          setUploadProgress('Comprimiendo...');
          fileToUpload = await compressImage(file);
        }
        setUploadProgress('Subiendo...');
        const result = await onUpload(fileToUpload);
        onChange(result.url);
        setUploadProgress('');
      } catch (err) {
        console.error('ImageUpload error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        // Show the real error — don't hide it behind generic messages
        setError(msg || 'Error al subir imagen');
      } finally {
        setIsUploading(false);
        setUploadProgress('');
      }
    },
    [onUpload, onChange, isMobile]
  );

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (height / width) * maxDim; width = maxDim; }
          else { width = (width / height) * maxDim; height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() }));
            } else { resolve(file); }
          },
          'image/jpeg', 0.85
        );
      };
      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };
  const executeRemove = () => { onChange(''); setConfirmingRemove(false); if (inputRef.current) inputRef.current.value = ''; };
  const openFileDialog = () => inputRef.current?.click();
  const openCamera = () => cameraInputRef.current?.click();

  const showMobileCamera = isMobile && enableCamera;

  // ─── Shared hidden file inputs ───
  const fileInputs = (
    <>
      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" onChange={handleInputChange} className="sr-only" disabled={disabled || isUploading} tabIndex={-1} />
      {enableCamera && (
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="sr-only" disabled={disabled || isUploading} tabIndex={-1} />
      )}
    </>
  );

  // ─── Shared action buttons ───
  const actionButtons = (layout: 'row' | 'col') => {
    if (disabled) return null;
    if (isUploading) {
      return <p className="text-xs text-muted-foreground">{uploadProgress || 'Subiendo...'}</p>;
    }

    const btnH = layout === 'col' ? 'h-10' : 'h-11 sm:h-8';
    const btnText = layout === 'col' ? 'text-sm' : 'text-sm sm:text-xs';
    const iconSize = layout === 'col' ? 'h-4 w-4' : 'h-4 w-4 sm:h-3.5 sm:w-3.5';

    if (confirmingRemove) {
      return (
        <div className={cn('flex items-center gap-2', layout === 'col' ? 'flex-wrap' : '')}>
          <span className={cn(btnText, 'text-destructive font-medium shrink-0')}>Eliminar foto?</span>
          <Button type="button" size="sm" variant="destructive" onClick={executeRemove} className={cn(btnH, btnText, 'px-3')}>
            Sí, eliminar
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setConfirmingRemove(false)} className={cn(btnH, btnText, 'px-3')}>
            Cancelar
          </Button>
        </div>
      );
    }

    return (
      <div className={cn('flex gap-2', layout === 'col' ? 'flex-col' : 'flex-wrap items-center')}>
        <div className="flex gap-2">
          {showMobileCamera && (
            <Button type="button" size="sm" variant="outline" onClick={openCamera} className={cn('gap-1.5', btnH, btnText)}>
              <Camera className={cn(iconSize, 'shrink-0')} />
              Cámara
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={openFileDialog} className={cn('gap-1.5', btnH, btnText)}>
            <Upload className={cn(iconSize, 'shrink-0')} />
            {showMobileCamera ? 'Galería' : value ? 'Cambiar' : 'Subir'}
          </Button>
        </div>
        {value && (
          <Button
            type="button" size="sm" variant="ghost"
            onClick={() => setConfirmingRemove(true)}
            className={cn('gap-1.5', btnH, btnText, 'text-destructive hover:text-destructive hover:bg-destructive/10', layout === 'row' && 'ml-auto')}
          >
            <Trash2 className={cn(iconSize, 'shrink-0')} />
            Eliminar
          </Button>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  VARIANT: AVATAR — round photo left, buttons right
  // ═══════════════════════════════════════════════════
  if (variant === 'avatar') {
    return (
      <div className={cn('space-y-2', className)}>
        {fileInputs}
        <div className="flex items-start gap-4">
          {/* Left: round photo or initials placeholder */}
          <div
            className={cn(
              'relative w-24 h-24 shrink-0 rounded-full overflow-hidden',
              value ? 'bg-slate-100' : '',
            )}
            onDragOver={!disabled ? handleDragOver : undefined}
            onDragLeave={!disabled ? handleDragLeave : undefined}
            onDrop={!disabled ? handleDrop : undefined}
          >
            {value ? (
              <img src={value} alt="Avatar" className={cn('w-full h-full object-cover', isUploading && 'opacity-40')} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                {initials ? (
                  <span className="text-2xl font-bold">{initials}</span>
                ) : (
                  <ImageIcon className="h-8 w-8 text-white/70" />
                )}
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            {isDragging && (
              <div className="absolute inset-0 bg-primary/30 flex items-center justify-center rounded-full">
                <Upload className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* Right: buttons stacked */}
          <div className="flex flex-col gap-1.5 pt-1 min-w-0">
            {actionButtons('col')}
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WebP{isMobile ? ' (max 10MB)' : ''}
            </p>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  VARIANT: DEFAULT — box image layout
  // ═══════════════════════════════════════
  return (
    <div className={cn('space-y-2', className)}>
      {fileInputs}

      {value ? (
        <div className="space-y-2">
          {/* Preview image */}
          <div
            className={cn(
              'relative rounded-lg overflow-hidden bg-slate-100 group',
              aspectRatioClasses[aspectRatio],
              !disabled && !isUploading && 'cursor-pointer',
            )}
            onClick={!disabled && !isUploading ? openFileDialog : undefined}
            onDragOver={!disabled ? handleDragOver : undefined}
            onDragLeave={!disabled ? handleDragLeave : undefined}
            onDrop={!disabled ? handleDrop : undefined}
          >
            <img src={value} alt="Preview" className={cn('w-full h-full object-cover transition-opacity', isUploading && 'opacity-40')} />

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                  {uploadProgress || 'Subiendo...'}
                </p>
              </div>
            )}

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-primary/20 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                <p className="text-sm font-medium text-primary bg-white/90 px-3 py-1.5 rounded-full">Soltar aquí</p>
              </div>
            )}

            {/* Mobile: always-visible tap overlay bar at bottom */}
            {!disabled && !isUploading && !isDragging && isMobile && (
              <div className="absolute bottom-0 inset-x-0 bg-black/50 py-2 flex items-center justify-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-white" />
                <span className="text-xs text-white font-medium">Tocar para cambiar</span>
              </div>
            )}

            {/* Desktop: hover overlay */}
            {!disabled && !isUploading && !isDragging && !isMobile && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Click para cambiar
                </span>
              </div>
            )}
          </div>

          {/* Action buttons below */}
          {actionButtons('row')}
        </div>
      ) : (
        /* ───── EMPTY STATE ───── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!disabled && !isUploading && !showMobileCamera ? openFileDialog : undefined}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors',
            aspectRatioClasses[aspectRatio],
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50',
            !disabled && !isUploading && !showMobileCamera && 'cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 p-4">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-slate-600 font-medium">{uploadProgress || 'Subiendo...'}</p>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 text-center">{placeholder}</p>

                {showMobileCamera ? (
                  <div className="flex gap-3 w-full max-w-[260px]">
                    <Button type="button" variant="outline" onClick={openCamera} disabled={disabled} className="gap-1.5 h-12 text-sm flex-1">
                      <Camera className="h-5 w-5 shrink-0" />
                      Cámara
                    </Button>
                    <Button type="button" variant="outline" onClick={openFileDialog} disabled={disabled} className="gap-1.5 h-12 text-sm flex-1">
                      <ImageIcon className="h-5 w-5 shrink-0" />
                      Galería
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    {isMobile ? 'Tocá para subir una imagen' : 'Arrastrá o hacé click para subir'}
                  </p>
                )}

                <p className="text-xs text-slate-400">
                  JPG, PNG, WebP, HEIC (max {isMobile ? '10' : '5'}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
