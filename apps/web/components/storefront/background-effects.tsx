'use client';

import React from 'react';

interface BackgroundEffectLayerProps {
  effect: string;
  color: string;
  opacity: number;
  isDarkBg: boolean;
}

export function BackgroundEffectLayer({ effect, color, opacity: o, isDarkBg }: BackgroundEffectLayerProps) {
  if (effect === 'none') return null;

  const hexToRgb = (hex: string) => {
    const c = hex.replace('#', '');
    return `${parseInt(c.substring(0, 2), 16)},${parseInt(c.substring(2, 4), 16)},${parseInt(c.substring(4, 6), 16)}`;
  };
  const rgb = hexToRgb(color);

  const effectContent: Record<string, React.ReactNode> = {

    particles: (
      <>
        <style>{`
          @keyframes bge-rise {
            0%   { transform: translate3d(0, 0, 0) scale(0); opacity: 0; }
            8%   { opacity: 1; transform: translate3d(0, -5vh, 0) scale(1); }
            100% { transform: translate3d(var(--dx), -120vh, 0) scale(0.3); opacity: 0; }
          }
          @keyframes bge-glow-pulse {
            0%, 100% { filter: blur(var(--blur)) brightness(1); }
            50% { filter: blur(var(--blur)) brightness(1.6); }
          }
        `}</style>
        {[...Array(30)].map((_, i) => {
          const size = 6 + (i % 6) * 10;
          const left = ((i * 13 + 7) % 94) + 3;
          const dur = 12 + (i % 5) * 4;
          const delay = (i * 0.8) % 10;
          const dx = ((i % 2 === 0 ? 1 : -1) * ((i * 7) % 60)) + 'px';
          const blur = Math.max(1, size / 8) + 'px';
          const glow = size * 3;
          return (
            <div key={i} style={{
              position: 'fixed', left: `${left}%`, bottom: '-8%',
              willChange: 'transform, opacity',
              ['--dx' as string]: dx, ['--blur' as string]: blur,
              animation: `bge-rise ${dur}s ${delay}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            }}>
              <div style={{
                width: size, height: size, borderRadius: '50%',
                background: `rgba(${rgb},${0.7 * o / 0.15})`,
                boxShadow: `0 0 ${glow}px ${glow / 2}px rgba(${rgb},${0.3 * o / 0.15}), inset 0 0 ${size / 2}px rgba(255,255,255,0.3)`,
                animation: `bge-glow-pulse ${2 + (i % 3)}s ${delay}s infinite ease-in-out`,
              }} />
            </div>
          );
        })}
      </>
    ),

    dots: (
      <>
        <style>{`
          @keyframes bge-ripple {
            0%   { transform: scale(0); opacity: 0.8; }
            100% { transform: scale(4); opacity: 0; }
          }
          @keyframes bge-dot-breathe {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(2); opacity: 1; }
          }
        `}</style>
        {[
          { x: 15, y: 20 }, { x: 75, y: 15 }, { x: 50, y: 50 },
          { x: 25, y: 75 }, { x: 80, y: 70 }, { x: 45, y: 30 },
          { x: 10, y: 50 }, { x: 90, y: 40 },
        ].map((pt, pi) => (
          <div key={`e-${pi}`} style={{ position: 'fixed', left: `${pt.x}%`, top: `${pt.y}%` }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', position: 'absolute',
              transform: 'translate(-50%, -50%)',
              backgroundColor: `rgba(${rgb},${0.8 * o / 0.15})`,
              boxShadow: `0 0 12px 4px rgba(${rgb},${0.4 * o / 0.15})`,
              animation: `bge-dot-breathe 3s ${pi * 0.4}s infinite ease-in-out`,
              willChange: 'transform, opacity',
            }} />
            {[0, 1, 2].map((ri) => (
              <div key={ri} style={{
                position: 'absolute', transform: 'translate(-50%, -50%)',
                width: 40, height: 40, borderRadius: '50%',
                border: `1.5px solid rgba(${rgb},${0.5 * o / 0.15})`,
                animation: `bge-ripple 4s ${pi * 0.5 + ri * 1.3}s infinite ease-out`,
                willChange: 'transform, opacity',
              }} />
            ))}
          </div>
        ))}
        <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}>
          {[
            [15,20,75,15], [75,15,50,50], [50,50,25,75], [25,75,80,70],
            [15,20,50,50], [50,50,80,70], [45,30,10,50], [90,40,80,70],
          ].map(([x1,y1,x2,y2], li) => (
            <line key={li}
              x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
              stroke={`rgba(${rgb},${0.12 * o / 0.15})`} strokeWidth="0.5"
              strokeDasharray="4 8"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="3s" repeatCount="indefinite" />
            </line>
          ))}
        </svg>
      </>
    ),

    grid: (
      <>
        <style>{`
          @keyframes bge-scan {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes bge-grid-flash {
            0%, 92%, 100% { opacity: 1; }
            94% { opacity: 0.4; }
            96% { opacity: 1; }
            98% { opacity: 0.6; }
          }
          @keyframes bge-cross-pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
            50% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          }
        `}</style>
        <div style={{ position: 'fixed', inset: 0, animation: 'bge-grid-flash 8s infinite' }}>
          <svg style={{ width: '100%', height: '100%', position: 'absolute' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="bge-g1" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke={`rgba(${rgb},${0.18 * o / 0.15})`} strokeWidth="0.5" />
              </pattern>
              <pattern id="bge-g2" width="250" height="250" patternUnits="userSpaceOnUse">
                <path d="M 250 0 L 0 0 0 250" fill="none" stroke={`rgba(${rgb},${0.35 * o / 0.15})`} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bge-g1)" />
            <rect width="100%" height="100%" fill="url(#bge-g2)" />
          </svg>
        </div>
        <div style={{
          position: 'fixed', left: 0, right: 0, height: 200,
          background: `linear-gradient(180deg, transparent 0%, rgba(${rgb},${0.15 * o / 0.15}) 45%, rgba(${rgb},${0.25 * o / 0.15}) 50%, rgba(${rgb},${0.15 * o / 0.15}) 55%, transparent 100%)`,
          animation: 'bge-scan 5s infinite linear',
          willChange: 'transform', filter: 'blur(1px)',
        }} />
        {[
          { x: 20, y: 25 }, { x: 50, y: 50 }, { x: 80, y: 75 },
          { x: 35, y: 60 }, { x: 65, y: 30 },
        ].map((p, ci) => (
          <div key={ci} style={{
            position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
            width: 20, height: 20,
            background: `radial-gradient(circle, rgba(${rgb},${0.6 * o / 0.15}) 0%, transparent 70%)`,
            animation: `bge-cross-pulse ${3 + ci * 0.5}s ${ci * 0.7}s infinite ease-out`,
            willChange: 'transform, opacity',
          }} />
        ))}
      </>
    ),

    waves: (
      <>
        <style>{`
          @keyframes bge-wv { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes bge-wv-v {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        `}</style>
        {[
          { bottom: 0, h: '35%', speed: 18, opMul: 0.2, amp: 40, freq: 8 },
          { bottom: 0, h: '30%', speed: 14, opMul: 0.15, amp: 35, freq: 6 },
          { bottom: 0, h: '25%', speed: 22, opMul: 0.1, amp: 30, freq: 10 },
          { bottom: '40%', h: '20%', speed: 25, opMul: 0.06, amp: 20, freq: 12 },
          { bottom: '65%', h: '15%', speed: 30, opMul: 0.04, amp: 15, freq: 14 },
        ].map((wave, wi) => (
          <div key={wi} style={{
            position: 'fixed', left: 0, right: 0,
            bottom: typeof wave.bottom === 'number' ? wave.bottom : wave.bottom,
            height: wave.h,
            animation: `bge-wv-v ${4 + wi * 0.5}s ${wi * 0.3}s infinite ease-in-out`,
            willChange: 'transform',
          }}>
            <svg style={{
              width: '200%', height: '100%', position: 'absolute', left: 0,
              animation: `bge-wv ${wave.speed}s infinite linear`,
              willChange: 'transform',
            }} viewBox="0 0 200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d={`M0,50 ${Array.from({ length: wave.freq * 2 }, (_, i) => {
                  const seg = 200 / (wave.freq * 2);
                  const x = (i + 1) * seg;
                  const cp1x = i * seg + seg * 0.5;
                  const cp1y = i % 2 === 0 ? 50 - wave.amp : 50 + wave.amp;
                  return `Q${cp1x},${cp1y} ${x},50`;
                }).join(' ')} L200,100 L0,100 Z`}
                fill={`rgba(${rgb},${wave.opMul * o / 0.15})`}
              />
            </svg>
          </div>
        ))}
      </>
    ),

    'gradient-mesh': (
      <>
        <style>{`
          @keyframes bge-lava1 {
            0%   { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
            20%  { transform: translate3d(25vw, -30vh, 0) scale(1.3) rotate(72deg); }
            40%  { transform: translate3d(-15vw, -60vh, 0) scale(0.8) rotate(144deg); }
            60%  { transform: translate3d(30vw, -20vh, 0) scale(1.2) rotate(216deg); }
            80%  { transform: translate3d(-20vw, -50vh, 0) scale(0.9) rotate(288deg); }
            100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
          }
          @keyframes bge-lava2 {
            0%   { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
            25%  { transform: translate3d(-30vw, 20vh, 0) scale(1.4) rotate(90deg); }
            50%  { transform: translate3d(20vw, 40vh, 0) scale(0.7) rotate(180deg); }
            75%  { transform: translate3d(-10vw, -30vh, 0) scale(1.1) rotate(270deg); }
            100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
          }
          @keyframes bge-lava3 {
            0%   { transform: translate3d(10vw, 5vh, 0) scale(0.9); }
            33%  { transform: translate3d(-25vw, -40vh, 0) scale(1.3); }
            66%  { transform: translate3d(35vw, 25vh, 0) scale(0.8); }
            100% { transform: translate3d(10vw, 5vh, 0) scale(0.9); }
          }
          @keyframes bge-lava4 {
            0%   { transform: translate3d(-5vw, 10vh, 0) scale(1.1); }
            50%  { transform: translate3d(20vw, -35vh, 0) scale(0.7); }
            100% { transform: translate3d(-5vw, 10vh, 0) scale(1.1); }
          }
        `}</style>
        {[
          { x: '10%', y: '20%', size: 'min(70vw, 500px)', anim: 'bge-lava1 30s infinite ease-in-out', op: 0.22, blur: 80 },
          { x: '60%', y: '60%', size: 'min(60vw, 450px)', anim: 'bge-lava2 36s infinite ease-in-out', op: 0.18, blur: 90 },
          { x: '30%', y: '80%', size: 'min(50vw, 400px)', anim: 'bge-lava3 24s infinite ease-in-out', op: 0.15, blur: 70 },
          { x: '70%', y: '10%', size: 'min(45vw, 350px)', anim: 'bge-lava4 28s infinite ease-in-out', op: 0.12, blur: 100 },
        ].map((blob, i) => (
          <div key={i} style={{
            position: 'fixed', left: blob.x, top: blob.y,
            width: blob.size, height: blob.size,
            borderRadius: '40% 60% 55% 45% / 55% 40% 60% 45%',
            background: `radial-gradient(circle at 30% 30%, rgba(${rgb},${blob.op * o / 0.15}) 0%, rgba(${rgb},${blob.op * 0.2 * o / 0.15}) 60%, transparent 80%)`,
            filter: `blur(${blob.blur}px)`,
            animation: blob.anim,
            willChange: 'transform',
            mixBlendMode: isDarkBg ? 'screen' : 'multiply',
          }} />
        ))}
      </>
    ),

    bokeh: (
      <>
        <style>{`
          @keyframes bge-bk-drift {
            0%   { transform: translate3d(0, 0, 0) scale(var(--s)); }
            25%  { transform: translate3d(var(--dx1), var(--dy1), 0) scale(calc(var(--s) * 1.15)); }
            50%  { transform: translate3d(var(--dx2), var(--dy2), 0) scale(var(--s)); }
            75%  { transform: translate3d(var(--dx3), var(--dy3), 0) scale(calc(var(--s) * 0.9)); }
            100% { transform: translate3d(0, 0, 0) scale(var(--s)); }
          }
        `}</style>
        {[...Array(20)].map((_, i) => {
          const size = 30 + (i % 7) * 30;
          const x = ((i * 19 + 5) % 90) + 5;
          const y = ((i * 31 + 8) % 85) + 5;
          const dur = 15 + (i % 5) * 5;
          const delay = (i * 1.1) % 8;
          const layer = i % 3;
          const blurVal = layer === 0 ? 1 : layer === 1 ? 3 : 6;
          const opBase = layer === 0 ? 0.25 : layer === 1 ? 0.15 : 0.08;
          return (
            <div key={i} style={{
              position: 'fixed', left: `${x}%`, top: `${y}%`,
              width: size, height: size, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, rgba(${rgb},${opBase * 1.5 * o / 0.15}) 0%, rgba(${rgb},${opBase * 0.5 * o / 0.15}) 50%, transparent 72%)`,
              border: `1px solid rgba(${rgb},${0.15 * o / 0.15})`,
              boxShadow: `0 0 ${size}px ${size / 3}px rgba(${rgb},${opBase * 0.4 * o / 0.15}), inset 0 0 ${size / 3}px rgba(255,255,255,${0.1 * o / 0.15})`,
              filter: `blur(${blurVal}px)`,
              ['--s' as string]: '1',
              ['--dx1' as string]: `${(i % 2 === 0 ? 1 : -1) * (20 + i * 3)}px`,
              ['--dy1' as string]: `${(i % 3 === 0 ? -1 : 1) * (15 + i * 2)}px`,
              ['--dx2' as string]: `${(i % 2 === 0 ? -1 : 1) * (30 + i * 2)}px`,
              ['--dy2' as string]: `${(i % 3 === 0 ? 1 : -1) * (25 + i * 3)}px`,
              ['--dx3' as string]: `${(i % 2 === 0 ? 1 : -1) * (10 + i * 4)}px`,
              ['--dy3' as string]: `${(i % 3 === 0 ? -1 : 1) * (20 + i)}px`,
              animation: `bge-bk-drift ${dur}s ${delay}s infinite ease-in-out`,
              willChange: 'transform',
            }} />
          );
        })}
      </>
    ),

    aurora: (
      <>
        <style>{`
          @keyframes bge-aur-shift1 {
            0%   { transform: translateX(-20%) skewX(-8deg) scaleY(1); }
            20%  { transform: translateX(10%) skewX(5deg) scaleY(1.4); }
            40%  { transform: translateX(-5%) skewX(-3deg) scaleY(0.8); }
            60%  { transform: translateX(15%) skewX(8deg) scaleY(1.2); }
            80%  { transform: translateX(-10%) skewX(-5deg) scaleY(0.9); }
            100% { transform: translateX(-20%) skewX(-8deg) scaleY(1); }
          }
          @keyframes bge-aur-shift2 {
            0%   { transform: translateX(15%) skewX(6deg) scaleY(1); }
            33%  { transform: translateX(-20%) skewX(-8deg) scaleY(1.5); }
            66%  { transform: translateX(10%) skewX(4deg) scaleY(0.7); }
            100% { transform: translateX(15%) skewX(6deg) scaleY(1); }
          }
          @keyframes bge-aur-shift3 {
            0%   { transform: translateX(0) skewX(0) scaleY(1) rotate(0deg); }
            25%  { transform: translateX(-15%) skewX(-10deg) scaleY(1.3) rotate(-2deg); }
            50%  { transform: translateX(10%) skewX(6deg) scaleY(0.8) rotate(1deg); }
            75%  { transform: translateX(-8%) skewX(-4deg) scaleY(1.1) rotate(-1deg); }
            100% { transform: translateX(0) skewX(0) scaleY(1) rotate(0deg); }
          }
          @keyframes bge-aur-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          @keyframes bge-aur-travel {
            0%   { transform: translateY(0) translateX(0); }
            50%  { transform: translateY(-30vh) translateX(5vw); }
            100% { transform: translateY(0) translateX(0); }
          }
        `}</style>
        <div style={{
          position: 'fixed', top: '-30%', left: '-20%', right: '-20%', height: '70%',
          background: `linear-gradient(175deg, rgba(${rgb},${0.28 * o / 0.15}) 0%, rgba(${rgb},${0.12 * o / 0.15}) 30%, rgba(${rgb},${0.05 * o / 0.15}) 60%, transparent 100%)`,
          filter: 'blur(60px)',
          animation: 'bge-aur-shift1 16s infinite ease-in-out',
          willChange: 'transform',
        }} />
        <div style={{
          position: 'fixed', top: '-10%', left: '-25%', right: '-25%', height: '55%',
          background: `linear-gradient(185deg, transparent 0%, rgba(${rgb},${0.08 * o / 0.15}) 20%, rgba(${rgb},${0.2 * o / 0.15}) 50%, rgba(${rgb},${0.04 * o / 0.15}) 80%, transparent 100%)`,
          filter: 'blur(80px)',
          animation: 'bge-aur-shift2 22s infinite ease-in-out',
          willChange: 'transform',
        }} />
        <div style={{
          position: 'fixed', top: '20%', left: '-15%', right: '-15%', height: '45%',
          background: `linear-gradient(170deg, transparent 0%, rgba(${rgb},${0.06 * o / 0.15}) 30%, rgba(${rgb},${0.14 * o / 0.15}) 55%, transparent 100%)`,
          filter: 'blur(100px)',
          animation: 'bge-aur-shift3 28s infinite ease-in-out',
          willChange: 'transform',
        }} />
        {[
          { x: '10%', y: '5%', size: 300, dur: 18, delay: 0 },
          { x: '60%', y: '15%', size: 250, dur: 22, delay: 4 },
          { x: '30%', y: '40%', size: 200, dur: 15, delay: 2 },
          { x: '75%', y: '55%', size: 280, dur: 20, delay: 6 },
        ].map((spot, si) => (
          <div key={si} style={{
            position: 'fixed', left: spot.x, top: spot.y,
            width: spot.size, height: spot.size, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${rgb},${0.2 * o / 0.15}) 0%, transparent 65%)`,
            filter: 'blur(50px)',
            animation: `bge-aur-travel ${spot.dur}s ${spot.delay}s infinite ease-in-out, bge-aur-glow ${spot.dur / 2}s ${spot.delay}s infinite ease-in-out`,
            willChange: 'transform, opacity',
            mixBlendMode: isDarkBg ? 'screen' : 'soft-light',
          }} />
        ))}
      </>
    ),
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {effectContent[effect]}
    </div>
  );
}
