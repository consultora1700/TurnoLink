'use client';

import { useState, useEffect, useRef } from 'react';

export const WHATSAPP_URL = 'https://wa.me/5491100000000?text=Hola%2C%20quiero%20info%20sobre%20TurnoLink';

export function WordReveal({
  text,
  className = '',
  muted = false,
}: {
  text: string;
  className?: string;
  muted?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(' ');
  const color = muted ? 'text-white/60' : 'text-white';

  return (
    <span ref={ref} className={`${color} ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`lv2-word inline-block mr-[0.3em] ${revealed ? 'revealed' : ''}`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export function SectionTag({ text }: { text: string }) {
  return (
    <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80 tracking-tight">
      {text}
    </span>
  );
}

export function SectionH2({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}) {
  return (
    <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[54px] font-normal leading-[1.0] lg:leading-[50px] tracking-[-1.9px]">
      <WordReveal text={line1} />
      <br />
      <WordReveal text={line2} muted />
    </h2>
  );
}

export function GlassLine() {
  return <div className="lv2-glass-line w-full" />;
}
