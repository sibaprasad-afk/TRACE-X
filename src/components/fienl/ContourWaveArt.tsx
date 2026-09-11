import React, { useEffect, useRef, useState } from 'react';

export const ContourWaveArt: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setPhase(p => (p + 0.005) % (Math.PI * 2));
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Generate 6 organic contour concentric blobbish loops
  const generateContourPath = (radiusBase: number, waveDepth: number, frequency: number, phaseOffset: number) => {
    const points: [number, number][] = [];
    const steps = 72;
    const cx = 500;
    const cy = 350;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const wave = Math.sin(angle * frequency + phase + phaseOffset) * waveDepth
                 + Math.cos(angle * 2 - phase * 0.8) * (waveDepth * 0.5);
      const r = radiusBase + wave;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * (r * 0.72); // slightly elliptical
      points.push([x, y]);
    }

    let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`;
    }
    d += ' Z';
    return d;
  };

  const layers = [
    { radius: 120, depth: 22, freq: 4, offset: 0, opacity: 0.35 },
    { radius: 180, depth: 32, freq: 5, offset: 0.8, opacity: 0.28 },
    { radius: 240, depth: 40, freq: 4, offset: 1.6, opacity: 0.22 },
    { radius: 310, depth: 48, freq: 6, offset: 2.4, opacity: 0.16 },
    { radius: 380, depth: 55, freq: 5, offset: 3.2, opacity: 0.11 },
    { radius: 460, depth: 65, freq: 4, offset: 4.0, opacity: 0.07 }
  ];

  return (
    <div className={`relative w-full h-[520px] overflow-hidden pointer-events-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 1000 700"
        className="w-[1200px] h-[800px] opacity-70 filter blur-[0.3px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="contourGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="500" cy="350" r="300" fill="url(#contourGlow)" />

        {layers.map((l, i) => (
          <path
            key={i}
            d={generateContourPath(l.radius, l.depth, l.freq, l.offset)}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.2"
            strokeOpacity={l.opacity}
            strokeDasharray={i % 2 === 1 ? '4 3' : undefined}
          />
        ))}
      </svg>
    </div>
  );
};
