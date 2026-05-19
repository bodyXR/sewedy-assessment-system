"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import DotGrid from "@/components/ui/DotGrid";
import { MagneticButton } from "./magnetic-button";
import { motion } from "framer-motion";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center px-6 lg:px-8 overflow-hidden bg-gray-900">
      {/* React Bits Dot Grid Background */}
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={2}
          gap={32}
          baseColor="#fee2e2"
          activeColor="#dc2626"
          proximity={150}
          shockRadius={200}
          shockStrength={8}
          resistance={700}
          returnDuration={1.5}
        />
      </div>

      <div className="relative max-w-6xl mx-auto w-full text-center py-20 z-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 shadow-lg mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Engineering Education Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6"
        >
          Assessment Infrastructure
          <br />
          <span className="bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent">
            for Modern Education
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-white leading-relaxed max-w-2xl mx-auto mb-12"
        >
          Precision tools for engineering institutions. Streamline evaluations,
          track performance, and manage academic workflows with intelligent
          automation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticButton
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-10 py-4 rounded-lg border-2 border-white/90 text-white bg-white/10 hover:bg-white/20 font-semibold text-lg transition-all duration-300 shadow-lg"
          >
            View Features
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
