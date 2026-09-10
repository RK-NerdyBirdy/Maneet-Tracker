import { useRef, useEffect, useCallback, ReactNode } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children?: ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children,
}: ClickSparkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>(0);

  // Keep a stable ref to props used inside the rAF loop so the loop
  // never needs to be restarted when props change.
  const propsRef = useRef({ sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale });
  propsRef.current = { sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale };

  const ease = useCallback((t: number, fn: string): number => {
    switch (fn) {
      case 'linear': return t;
      case 'ease-in': return t * t;
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default: return t * (2 - t); // ease-out
    }
  }, []);

  // Sync canvas dimensions to the viewport on mount and resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sync = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    };

    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // Single persistent rAF draw loop — started once, never torn down.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = (ts: number) => {
      const { sparkColor, sparkSize, sparkRadius, duration, easing, extraScale } = propsRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = ts - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = ease(progress, easing);
        const distance = eased * sparkRadius * extraScale;
        const lineLen = sparkSize * (1 - eased);
        const alpha = 1 - eased;

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLen) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLen) * Math.sin(spark.angle);

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ease]);

  // Global click listener — fires for every click in the document,
  // regardless of which element was clicked or whether pointer capture is active.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const { sparkCount } = propsRef.current;
      const now = performance.now();
      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }));
      sparksRef.current.push(...newSparks);
    };

    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <>
      {/* Fixed full-viewport canvas — sits above everything, blocks nothing */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 99999,
        }}
      />
      {children}
    </>
  );
};

export default ClickSpark;
