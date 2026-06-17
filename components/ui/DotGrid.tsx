"use client";

import React, { useEffect, useRef } from "react";

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  returnDuration?: number;
}

interface Dot {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 2,
  gap = 32,
  baseColor = "#fee2e2",
  activeColor = "#dc2626",
  proximity = 150,
  shockRadius = 200,
  shockStrength = 8,
  returnDuration = 1.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, isActive: false });
  const animationRef = useRef<number | undefined>(undefined);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 229, g: 231, b: 235 };
  };

  const baseRgb = hexToRgb(baseColor);
  const activeRgb = hexToRgb(activeColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Recreate dots
      dotsRef.current = [];
      const cols = Math.floor(rect.width / gap);
      const rows = Math.floor(rect.height / gap);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gap + gap / 2;
          const y = row * gap + gap / 2;

          dotsRef.current.push({
            x,
            y,
            originalX: x,
            originalY: y,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
          });
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const returnSpeed = 0.1;
      const damping = 0.85;

      dotsRef.current.forEach((dot) => {
        const dx = mouseRef.current.x - dot.x;
        const dy = mouseRef.current.y - dot.y;
        const distance = Math.hypot(dx, dy);

        // Apply shock wave effect
        if (mouseRef.current.isActive && distance < shockRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - distance / shockRadius) * shockStrength;

          dot.velocityX += Math.cos(angle) * force * 0.5;
          dot.velocityY += Math.sin(angle) * force * 0.5;
        }

        // Return to original position with spring physics
        dot.velocityX += (0 - dot.offsetX) * returnSpeed;
        dot.velocityY += (0 - dot.offsetY) * returnSpeed;

        // Apply damping
        dot.velocityX *= damping;
        dot.velocityY *= damping;

        // Update position
        dot.offsetX += dot.velocityX;
        dot.offsetY += dot.velocityY;

        // Calculate color based on proximity
        let color = `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`;
        let opacity = 0.4;

        if (mouseRef.current.isActive && distance < proximity) {
          const intensity = 1 - distance / proximity;
          const r = Math.round(
            baseRgb.r + (activeRgb.r - baseRgb.r) * intensity,
          );
          const g = Math.round(
            baseRgb.g + (activeRgb.g - baseRgb.g) * intensity,
          );
          const b = Math.round(
            baseRgb.b + (activeRgb.b - baseRgb.b) * intensity,
          );
          color = `rgb(${r}, ${g}, ${b})`;
          opacity = 0.4 + intensity * 0.6;
        }

        // Draw dot
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(
          dot.x + dot.offsetX,
          dot.y + dot.offsetY,
          dotSize,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isActive: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    dotSize,
    gap,
    proximity,
    shockRadius,
    shockStrength,
    returnDuration,
    baseRgb.r,
    baseRgb.g,
    baseRgb.b,
    activeRgb.r,
    activeRgb.g,
    activeRgb.b,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

export default DotGrid;
