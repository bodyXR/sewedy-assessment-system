"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  returnDuration?: number;
}

interface Dot {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  element: HTMLDivElement;
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 5,
  gap = 15,
  baseColor = "#E5E7EB",
  activeColor = "#C72E3D",
  proximity = 120,
  shockRadius = 250,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing dots
    container.innerHTML = "";
    dotsRef.current = [];

    const rect = container.getBoundingClientRect();
    const cols = Math.floor(rect.width / gap);
    const rows = Math.floor(rect.height / gap);

    // Create dots
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * gap + gap / 2;
        const y = row * gap + gap / 2;

        const dot = document.createElement("div");
        dot.style.position = "absolute";
        dot.style.width = `${dotSize}px`;
        dot.style.height = `${dotSize}px`;
        dot.style.borderRadius = "50%";
        dot.style.backgroundColor = baseColor;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.style.transform = "translate(-50%, -50%)";
        dot.style.pointerEvents = "none";
        dot.style.transition = "background-color 0.3s ease";

        container.appendChild(dot);

        dotsRef.current.push({
          x,
          y,
          originalX: x,
          originalY: y,
          element: dot,
        });
      }
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      dotsRef.current.forEach((dot) => {
        const dx = mouseRef.current.x - dot.x;
        const dy = mouseRef.current.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Color change based on proximity
        if (distance < proximity) {
          const intensity = 1 - distance / proximity;
          dot.element.style.backgroundColor = activeColor;
          dot.element.style.opacity = String(0.3 + intensity * 0.7);
        } else {
          dot.element.style.backgroundColor = baseColor;
          dot.element.style.opacity = "1";
        }

        // Shock wave displacement
        if (distance < shockRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - distance / shockRadius) * shockStrength;

          const offsetX = Math.cos(angle) * force;
          const offsetY = Math.sin(angle) * force;

          gsap.to(dot.element, {
            x: offsetX,
            y: offsetY,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          // Return to original position
          gsap.to(dot.element, {
            x: 0,
            y: 0,
            duration: returnDuration,
            ease: "elastic.out(1, 0.3)",
          });
        }
      });
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      dotsRef.current.forEach((dot) => {
        dot.element.style.backgroundColor = baseColor;
        dot.element.style.opacity = "1";
        gsap.to(dot.element, {
          x: 0,
          y: 0,
          duration: returnDuration,
          ease: "elastic.out(1, 0.3)",
        });
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    dotSize,
    gap,
    baseColor,
    activeColor,
    proximity,
    shockRadius,
    shockStrength,
    resistance,
    returnDuration,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    />
  );
};

export default DotGrid;
