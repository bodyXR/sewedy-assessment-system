"use client";

import { useEffect, useRef } from "react";

interface AnimatedDotGridProps {
  className?: string;
  dotSize?: number;
  dotColor?: string;
  gap?: number;
  mouseEffect?: boolean;
}

export function AnimatedDotGrid({
  className = "",
  dotSize = 1,
  dotColor = "rgba(0, 0, 0, 0.1)",
  gap = 32,
  mouseEffect = true,
}: AnimatedDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const updateCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      for (let x = 0; x < rect.width; x += gap) {
        for (let y = 0; y < rect.height; y += gap) {
          let size = dotSize;
          let opacity = 0.1;

          if (mouseEffect) {
            const distance = Math.sqrt(
              Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2),
            );
            const maxDistance = 200;

            if (distance < maxDistance) {
              const effect = 1 - distance / maxDistance;
              size = dotSize + effect * 2;
              opacity = 0.1 + effect * 0.3;
            }
          }

          ctx.fillStyle = dotColor.replace(/[\d.]+\)$/g, `${opacity})`);
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    updateCanvas();
    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const resizeObserver = new ResizeObserver(updateCanvas);
    resizeObserver.observe(canvas);

    if (mouseEffect) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (mouseEffect) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [dotSize, dotColor, gap, mouseEffect]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
