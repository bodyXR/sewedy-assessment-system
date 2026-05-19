"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "./magnetic-button";

export function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const router = useRouter();

  return (
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-red-950/30 to-gray-950" />

      {/* Massive radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-primary/30 rounded-full blur-[250px]" />

      {/* Animated grid */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(199, 46, 61, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(199, 46, 61, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main CTA Card */}
          <div className="relative rounded-[3px] border-2 border-primary/30 bg-gradient-to-br from-[#1A0F0F]/95 to-[#0A0505]/95 backdrop-blur-2xl p-16 overflow-hidden">
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at center, rgba(199, 46, 61, 0.5) 1px, transparent 1px)`,
                  backgroundSize: "50px 50px",
                }}
              />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Join the Evolution
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
              >
                <span className="text-white">Enter the</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent">
                  Cognitive Era
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Experience assessment intelligence that thinks, adapts, and
                evolves.
                <br />
                <span className="text-gray-500">
                  The future is already here.
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <MagneticButton
                  onClick={() => router.push("/login")}
                  className="px-10 py-4 rounded-lg border-2 border-white/90 text-gray-900 bg-white hover:bg-gray-50 font-semibold text-lg transition-all duration-300 shadow-lg"
                >
                  Sign In
                </MagneticButton>
              </motion.div>

              {/* Features list */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 text-sm"
              >
                {[
                  "Multi-Role Support",
                  "Real-Time Analytics",
                  "Enterprise Security",
                  "Quality Assurance",
                ].map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-gray-400 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-8 left-8 w-32 h-32 border border-primary/10 rounded-[3px]" />
            <div className="absolute top-10 left-10 w-32 h-32 border border-primary/5 rounded-[3px]" />
            <div className="absolute bottom-8 right-8 w-32 h-32 border border-primary/10 rounded-[3px]" />
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-primary/5 rounded-[3px]" />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-primary/10 blur-3xl -z-10" />
          </div>

          {/* Card shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent blur-[100px] -z-10" />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">
            Trusted by leading organizations worldwide
          </p>

          {/* Logo placeholders */}
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-30">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-24 h-8 rounded-[3px] bg-gradient-to-r from-gray-700 to-gray-600"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0505] to-transparent" />
    </section>
  );
}
