import { useEffect, useRef } from 'react';

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const lineWidth = 1;
    const gridSize = 60;
    const offset = { x: 0, y: 0 };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    function draw() {
      offset.x -= 0.5;
      offset.y += 0.3;

      ctx!.clearRect(0, 0, w, h);
      const diag = Math.sqrt(w * w + h * h);
      const count = Math.ceil(diag / gridSize) * 2;

      ctx!.save();
      ctx!.translate(w / 2, h / 2);
      ctx!.rotate(-Math.PI / 6);
      ctx!.translate(-w / 2, -h / 2);

      ctx!.strokeStyle = '#1a1a1c';
      ctx!.lineWidth = lineWidth;

      // First set of lines
      ctx!.beginPath();
      for (let i = 0; i <= count; i++) {
        const x = (i * gridSize + offset.x) % (diag * 2) - diag + w / 2 - diag / 2;
        const y = -diag;
        const len = diag * 2 + h;
        ctx!.moveTo(x, y);
        ctx!.lineTo(x, y + len);
      }
      ctx!.stroke();

      // Second set of lines
      offset.x += gridSize;
      ctx!.beginPath();
      for (let i = 0; i <= count; i++) {
        const x = (i * gridSize + offset.x) % (diag * 2) - diag + w / 2 - diag / 2;
        const y = -diag;
        const len = diag * 2 + h;
        ctx!.moveTo(x, y);
        ctx!.lineTo(x, y + len);
      }
      ctx!.stroke();
      offset.x -= gridSize;

      ctx!.restore();
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* Radial gradient overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, #050507 85%)',
        }}
      />
    </>
  );
}
