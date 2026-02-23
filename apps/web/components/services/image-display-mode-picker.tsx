'use client';

interface ImageDisplayModePickerProps {
  imageUrl: string;
  mode: string;
  onChange: (mode: string) => void;
  compact?: boolean;
}

export function ImageDisplayModePicker({ imageUrl, mode, onChange, compact }: ImageDisplayModePickerProps) {
  if (compact) {
    return (
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange('cover')}
          className={`flex-1 flex flex-col items-center gap-0.5 px-1 py-1 rounded border text-[9px] transition-all ${
            mode === 'cover'
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400'
              : 'border-muted bg-muted/30 text-muted-foreground'
          }`}
        >
          <div className={`w-6 h-4 rounded-sm overflow-hidden border ${mode === 'cover' ? 'border-blue-400' : 'border-muted-foreground/30'}`}>
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <span className={mode === 'cover' ? 'text-blue-600 dark:text-blue-300 font-medium' : ''}>Portada</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('contain')}
          className={`flex-1 flex flex-col items-center gap-0.5 px-1 py-1 rounded border text-[9px] transition-all ${
            mode === 'contain'
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400'
              : 'border-muted bg-muted/30 text-muted-foreground'
          }`}
        >
          <div className={`w-6 h-4 rounded-sm overflow-hidden border bg-slate-200 dark:bg-neutral-700 ${mode === 'contain' ? 'border-blue-400' : 'border-muted-foreground/30'}`}>
            <img src={imageUrl} alt="" className="w-full h-full object-contain" />
          </div>
          <span className={mode === 'contain' ? 'text-blue-600 dark:text-blue-300 font-medium' : ''}>Completa</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Cover option */}
      <button
        type="button"
        onClick={() => onChange('cover')}
        className={`flex-1 rounded-lg border-2 p-1.5 transition-all ${
          mode === 'cover'
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-muted hover:border-muted-foreground/40'
        }`}
      >
        <div className="w-full aspect-video rounded overflow-hidden bg-muted mb-1.5">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            mode === 'cover' ? 'border-blue-500' : 'border-muted-foreground/40'
          }`}>
            {mode === 'cover' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </div>
          <div className="text-left min-w-0">
            <p className={`text-xs font-medium leading-tight ${mode === 'cover' ? 'text-blue-600 dark:text-blue-400' : ''}`}>Portada</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Llena el espacio</p>
          </div>
        </div>
      </button>

      {/* Contain option */}
      <button
        type="button"
        onClick={() => onChange('contain')}
        className={`flex-1 rounded-lg border-2 p-1.5 transition-all ${
          mode === 'contain'
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-muted hover:border-muted-foreground/40'
        }`}
      >
        <div className="w-full aspect-video rounded overflow-hidden bg-slate-200 dark:bg-neutral-700 mb-1.5">
          <img src={imageUrl} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            mode === 'contain' ? 'border-blue-500' : 'border-muted-foreground/40'
          }`}>
            {mode === 'contain' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </div>
          <div className="text-left min-w-0">
            <p className={`text-xs font-medium leading-tight ${mode === 'contain' ? 'text-blue-600 dark:text-blue-400' : ''}`}>Completa</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Muestra todo</p>
          </div>
        </div>
      </button>
    </div>
  );
}
