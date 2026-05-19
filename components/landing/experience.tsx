"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Instant Recognition",
    description:
      "The system identifies patterns and competencies in milliseconds, understanding context beyond surface metrics.",
  },
  {
    title: "Adaptive Analysis",
    description:
      "Neural pathways adjust assessment strategies based on individual learning signatures and behavioral patterns.",
  },
  {
    title: "Precision Feedback",
    description:
      "Multi-dimensional insights delivered with surgical accuracy, revealing growth opportunities invisible to traditional methods.",
  },
  {
    title: "Continuous Evolution",
    description:
      "Every interaction refines the model, creating an ever-improving intelligence that grows with your organization.",
  },
];

export function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative py-40 px-6 bg-white">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              The Journey
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Experience
            <span className="bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent">
              {" "}
              Intelligent Assessment
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A seamless flow from data to insight, powered by cognitive
            architecture.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 hidden md:block" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-8">
                  {/* Number indicator */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-[3px] border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Glow */}
                    <div className="absolute inset-0 bg-primary/30 blur-xl" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                      {step.description}
                    </p>

                    {/* Animated progress bar */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-0.5 bg-gradient-to-r from-primary to-transparent mt-6 origin-left"
                      style={{ width: "100%", maxWidth: "400px" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mt-24"
        >
          <div className="relative max-w-4xl mx-auto rounded-[3px] border-2 border-primary/20 bg-gradient-to-br from-[#1A0F0F]/90 to-[#0A0505]/90 backdrop-blur-xl p-12 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                  linear-gradient(to right, rgba(199, 46, 61, 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(199, 46, 61, 0.3) 1px, transparent 1px)
                `,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />

              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Experience the Future?
              </h3>

              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join organizations already leveraging cognitive assessment
                intelligence.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                {[
                  { label: "Active Users", value: "12,000+" },
                  { label: "Assessments", value: "2.8M+" },
                  { label: "Accuracy", value: "99.4%" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent blur-2xl -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
