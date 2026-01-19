'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
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
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar 5MB');
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const result = await onUpload(file);
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir imagen');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className={cn('relative rounded-lg overflow-hidden bg-slate-100', aspectRatioClasses[aspectRatio])}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={openFileDialog}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="ml-1">Cambiar</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            aspectRatioClasses[aspectRatio],
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                <p className="text-sm text-slate-500">Subiendo...</p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 text-center">{placeholder}</p>
                <p className="text-xs text-slate-400">
                  Arrastrá o hacé click para subir
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
