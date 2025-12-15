import { useEffect, useRef } from 'react';
import { GeoTag } from '@/types';
import { cn } from '@/lib/utils';
interface CanvasPinsProps {
  geoData: GeoTag[];
  hoverPinId?: string | null;
  className?: string;
  title?: string;
  ariaLabel?: string;
}
function drawPins(ctx: CanvasRenderingContext2D, geoData: GeoTag[], width: number, height: number, hoverPinId: string | null | undefined) {
    ctx.clearRect(0, 0, width, height);
    const minLon = -75.8, maxLon = -75.2, minLat = 40.45, maxLat = 40.75;
    geoData.forEach(geo => {
      if (geo.lat === undefined || geo.lon === undefined) return;
      const x = ((geo.lon - minLon) / (maxLon - minLon)) * width;
      const y = ((maxLat - geo.lat) / (maxLat - minLat)) * height;
      let color = 'rgba(239, 68, 68, 0.7)'; // Red < 0.4
      if (geo.confidence > 0.7) color = 'rgba(34, 197, 94, 0.7)'; // Green > 0.7
      else if (geo.confidence >= 0.4) color = 'rgba(59, 130, 246, 0.7)'; // Blue >= 0.4
      const isHovered = hoverPinId === geo.id;
      const radius = (2 + geo.confidence * 4) * (isHovered ? 1.5 : 1);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      if (isHovered) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
}
export function CanvasPins({ geoData, hoverPinId, className, title, ariaLabel }: CanvasPinsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
            drawPins(ctx, geoData, width, height, hoverPinId);
        }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [geoData, hoverPinId]);
  return (
    <canvas
      ref={canvasRef}
      className={cn("bg-slate-200/20 dark:bg-slate-900/50 w-full h-full", className)}
      title={title}
      aria-label={ariaLabel}
    />
  );
}