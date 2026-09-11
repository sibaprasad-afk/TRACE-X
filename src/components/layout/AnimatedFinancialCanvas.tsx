import React, { useEffect, useRef } from 'react';

export const AnimatedFinancialCanvas: React.FC<{ opacity?: number }> = ({ opacity = 0.4 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic financial graph line points
    const pointCount = width < 768 ? 40 : 90;
    const primaryPoints: { x: number; y: number; baseOffset: number }[] = [];
    const secondaryPoints: { x: number; y: number; baseOffset: number }[] = [];

    // Construct upward trending realistic curve with peaks, valleys, dips
    for (let i = 0; i < pointCount; i++) {
      const progress = i / (pointCount - 1);
      // Upward trend from 75% height to 25% height
      const trendY = height * (0.75 - progress * 0.48);
      // Fluctuations
      const noise =
        Math.sin(i * 0.35) * 45 +
        Math.cos(i * 0.7) * 25 +
        Math.sin(i * 1.2) * 15 -
        (i % 9 === 0 ? 35 : 0); // dips

      primaryPoints.push({
        x: progress * width,
        y: trendY + noise,
        baseOffset: i * 0.08
      });

      // Secondary trend line (slightly lagged and lower)
      const secTrendY = height * (0.82 - progress * 0.42);
      const secNoise = Math.sin(i * 0.28 + 1.2) * 35 + Math.cos(i * 0.6) * 20;
      secondaryPoints.push({
        x: progress * width,
        y: secTrendY + secNoise,
        baseOffset: i * 0.06 + 2.0
      });
    }

    // Floating blockchain wallet nodes
    const nodeCount = width < 768 ? 16 : 38;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      isRisk?: boolean;
    }[] = [];

    const palette = ['#06b6d4', '#0d9488', '#10b981', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < nodeCount; i++) {
      const isRisk = i % 12 === 0;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.2 + 1.2,
        color: isRisk ? '#ef4444' : palette[i % palette.length],
        isRisk
      });
    }

    // Traveling packet pulses
    const pulses: {
      sourceIdx: number;
      targetIdx: number;
      progress: number;
      speed: number;
    }[] = [];

    for (let p = 0; p < 8; p++) {
      pulses.push({
        sourceIdx: Math.floor(Math.random() * nodeCount),
        targetIdx: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005
      });
    }

    let tick = 0;

    const render = () => {
      tick += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Faint Financial Grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      const gridSize = width < 768 ? 80 : 100;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Micro Volume Bars along bottom
      const barWidth = width / 48;
      for (let b = 0; b < 48; b++) {
        const barHeight = 8 + Math.abs(Math.sin(b * 0.4 + tick * 0.4)) * 32;
        ctx.fillStyle = b % 5 === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.12)';
        ctx.fillRect(b * barWidth + 3, height - barHeight - 10, barWidth - 6, barHeight);
      }

      // 3. Secondary Financial Line
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)'; // subtle violet
      for (let i = 0; i < secondaryPoints.length; i++) {
        const p = secondaryPoints[i];
        const dynamicY = p.y + Math.sin(tick * 0.8 + p.baseOffset) * 12;
        if (i === 0) ctx.moveTo(p.x, dynamicY);
        else ctx.lineTo(p.x, dynamicY);
      }
      ctx.stroke();

      // 4. Primary Financial Line with subtle gradient glow
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)'; // cyan
      for (let i = 0; i < primaryPoints.length; i++) {
        const p = primaryPoints[i];
        const dynamicY = p.y + Math.sin(tick + p.baseOffset) * 16;
        if (i === 0) ctx.moveTo(p.x, dynamicY);
        else ctx.lineTo(p.x, dynamicY);
      }
      ctx.stroke();

      // Area fill under primary curve
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, height * 0.3, 0, height);
      areaGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      areaGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // 5. Blockchain Network Nodes & Connections
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = width < 768 ? 100 : 140;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = n.isRisk ? 6 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 6. Traveling transaction pulses along connections
      for (let p = 0; p < pulses.length; p++) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.sourceIdx = Math.floor(Math.random() * nodeCount);
          pulse.targetIdx = Math.floor(Math.random() * nodeCount);
        }

        const src = nodes[pulse.sourceIdx];
        const tgt = nodes[pulse.targetIdx];
        if (src && tgt) {
          const px = src.x + (tgt.x - src.x) * pulse.progress;
          const py = src.y + (tgt.y - src.y) * pulse.progress;

          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 select-none"
      style={{ opacity }}
    />
  );
};
