"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  Zap,
  Target,
  Shield,
  Users,
  BarChart3,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { AnimatedStats } from "./animated-stats";

const capabilities = [
  {
    icon: Brain,
    title: "Smart Assessment",
    description:
      "Intelligent evaluation system that adapts to different competency levels and learning patterns.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description:
      "Instant feedback and grade calculations with sub-second response times across all operations.",
  },
  {
    icon: Target,
    title: "Precision Tracking",
    description:
      "Detailed competency mapping and progress monitoring with multi-dimensional analysis.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Role-based access control with complete audit trails and data encryption.",
  },
  {
    icon: Users,
    title: "Multi-Role Support",
    description:
      "Seamless workflows for controllers, assessors, and verifiers with dedicated dashboards.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Comprehensive insights into student performance, trends, and institutional metrics.",
  },
  {
    icon: FileCheck,
    title: "Quality Assurance",
    description:
      "Built-in verification workflows ensuring assessment accuracy and consistency.",
  },
  {
    icon: TrendingUp,
    title: "Performance Insights",
    description:
      "Track progress over time with detailed reports and actionable recommendations.",
  },
];

export function Intelligence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.8, 1, 1, 0.8],
  );

  return (
    <section ref={containerRef} className="relative py-40 px-6 bg-gray-50">
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              System Capabilities
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Powerful
            <span className="bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent">
              {" "}
              Assessment Capabilities
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to manage assessments efficiently and
            effectively.
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {capabilities.map((capability) => (
            <div
              key={capability.title}
              className="group relative p-8 rounded-2xl bg-white border border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-all duration-300">
                <capability.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {capability.title}
              </h3>

              <p className="text-gray-600 leading-relaxed text-sm">
                {capability.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-32">
          <div className="relative max-w-5xl mx-auto rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200 p-16 shadow-xl">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by Institutions Worldwide
              </h3>
              <p className="text-xl text-gray-600">
                Real impact across engineering education programs
              </p>
            </div>

            <AnimatedStats />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
