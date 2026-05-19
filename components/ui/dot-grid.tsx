"use client";

import { useEffect, useRef } from "react";

interface DotGridProps {
  className?: string;
  dotSize?: number;
  dotColor?: string;
  gap?: number;
}

export function DotGrid({
  className = "",
  dotSize = 1,
  dotColor = "rgba(0, 0, 0, 0.1)",
  gap = 24,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw dots
      ctx.fillStyle = dotColor;

      for (let x = 0; x < rect.width; x += gap) {
        for (let y = 0; y < rect.height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    updateCanvas();

    const resizeObserver = new ResizeObserver(updateCanvas);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [dotSize, dotColor, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
