'use client';

interface AnnouncementBarProps {
  text: string;
  bgColor?: string;
  textColor?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

const SPEED_MAP = {
  slow: '30s',
  normal: '18s',
  fast: '10s',
};

export function AnnouncementBar({
  text,
  bgColor = '#000000',
  textColor = '#FFFFFF',
  speed = 'normal',
}: AnnouncementBarProps) {
  if (!text) return null;

  const duration = SPEED_MAP[speed] || SPEED_MAP.normal;

  // Repeat text enough times to fill the scroll
  const separator = '  \u2022  ';
  const repeatedText = Array(6).fill(text).join(separator);

  return (
    <div
      className="overflow-hidden whitespace-nowrap relative"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="inline-flex animate-marquee py-2 text-xs sm:text-sm font-medium tracking-wide"
        style={{
          color: textColor,
          animationDuration: duration,
        }}
      >
        <span className="px-4">{repeatedText}{separator}</span>
        <span className="px-4">{repeatedText}{separator}</span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}

// Preview for the admin panel
interface AnnouncementBarPreviewProps {
  text: string;
  bgColor: string;
  textColor: string;
}

export function AnnouncementBarPreview({ text, bgColor, textColor }: AnnouncementBarPreviewProps) {
  if (!text) return null;

  return (
    <div
      className="overflow-hidden whitespace-nowrap rounded-lg"
      style={{ backgroundColor: bgColor }}
    >
      <div className="py-1.5 text-[10px] font-medium tracking-wide text-center" style={{ color: textColor }}>
        {text}
      </div>
    </div>
  );
}
