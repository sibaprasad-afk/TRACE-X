import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  isFlagged: boolean;
  pulsePhase: number;
  size: number;
  speed: number;
}

export const ParticleSphereCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight || 650;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate 3D sphere points (Fibonacci sphere distribution)
    const points: Point3D[] = [];
    const numPoints = 220;
    const radius = Math.min(width, height) * 0.38;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Make ~10% of nodes red/flagged (like the mixers/sanctions nodes in the Fienl video)
      const isFlagged = i % 14 === 3 || i % 19 === 7 || i === 42 || i === 88;

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        baseX: x * radius,
        baseY: y * radius,
        baseZ: z * radius,
        isFlagged,
        pulsePhase: Math.random() * Math.PI * 2,
        size: isFlagged ? (Math.random() * 1.5 + 2.5) : (Math.random() * 1.2 + 1.2),
        speed: 0.003 + Math.random() * 0.002
      });
    }

    // Add 45 ambient drifting dust particles inside the sphere
    const dustParticles: Point3D[] = [];
    for (let j = 0; j < 45; j++) {
      const r = radius * (0.3 + Math.random() * 0.65);
      const theta = Math.random() * Math.PI * 2;
      const phiAngle = Math.acos(Math.random() * 2 - 1);
      const x = r * Math.sin(phiAngle) * Math.cos(theta);
      const y = r * Math.sin(phiAngle) * Math.sin(theta);
      const z = r * Math.cos(phiAngle);
      dustParticles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        isFlagged: Math.random() < 0.15,
        pulsePhase: Math.random() * Math.PI * 2,
        size: Math.random() * 1.2 + 0.8,
        speed: 0.002 + Math.random() * 0.002
      });
    }

    let rotY = 0;
    let rotX = 0.2;
    let targetRotY = 0;
    let targetRotX = 0.2;
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left - width / 2;
      const clientY = e.clientY - rect.top - height / 2;
      mouseX = clientX / (width / 2);
      mouseY = clientY / (height / 2);
      targetRotY = mouseX * 0.6;
      targetRotX = 0.2 + mouseY * 0.4;
      isHovered = true;
    };

    const onMouseLeave = () => {
      isHovered = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.016;

      // Natural continuous rotation
      if (!isHovered) {
        rotY += 0.0025;
        rotX += (0.15 - rotX) * 0.02;
      } else {
        rotY += (targetRotY - rotY) * 0.04;
        rotX += (targetRotX - rotX) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 420;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Project all points
      const allPoints = [...points, ...dustParticles];
      const projected = allPoints.map((p, idx) => {
        // Rotate around Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        // Rotate around X
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Subtle pulsation
        const pulse = Math.sin(time * 2 + p.pulsePhase) * 0.3 + 1;

        const scale = fov / (fov + z2 + 300);
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;
        const alpha = Math.max(0.1, Math.min(1, (z2 + radius) / (2 * radius) * 0.85 + 0.15));

        return {
          px,
          py,
          scale,
          z: z2,
          alpha,
          isFlagged: p.isFlagged,
          size: p.size * scale * pulse,
          origIdx: idx
        };
      });

      // Sort by depth (back to front)
      projected.sort((a, b) => a.z - b.z);

      // Draw vector connecting lines between nearest points on sphere surface
      const maxConnectDist = radius * 0.38;
      const surfaceProjected = projected.filter(p => p.origIdx < numPoints);

      ctx.lineWidth = 0.8;
      for (let i = 0; i < surfaceProjected.length; i += 2) {
        const p1 = surfaceProjected[i];
        for (let j = i + 1; j < Math.min(i + 8, surfaceProjected.length); j++) {
          const p2 = surfaceProjected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist * p1.scale) {
            const lineAlpha = (1 - dist / (maxConnectDist * p1.scale)) * Math.min(p1.alpha, p2.alpha) * 0.28;
            if (lineAlpha > 0.02) {
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);

              if (p1.isFlagged || p2.isFlagged) {
                ctx.strokeStyle = `rgba(239, 68, 68, ${lineAlpha * 1.5})`;
              } else {
                ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
              }
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.px < -20 || p.px > width + 20 || p.py < -20 || p.py > height + 20) continue;

        if (p.isFlagged) {
          // Crimson / red flagged node with halo
          const haloGrad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, p.size * 4);
          haloGrad.addColorStop(0, `rgba(239, 68, 68, ${p.alpha * 0.9})`);
          haloGrad.addColorStop(0.5, `rgba(220, 38, 38, ${p.alpha * 0.35})`);
          haloGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 120, 120, ${p.alpha})`;
          ctx.fill();
        } else {
          // Clean white / silver node with subtle glow
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.85})`;
          ctx.fill();

          if (p.size > 2.2) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.15})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div className={`relative w-full h-full pointer-events-auto ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
