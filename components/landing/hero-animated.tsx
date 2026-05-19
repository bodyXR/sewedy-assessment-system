"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedDotGrid } from "@/components/ui/animated-dot-grid";

export function HeroAnimated() {
  const router = useRouter();

  return (
    <section className="relative min-h-[85vh] flex items-center px-6 lg:px-8 overflow-hidden">
      {/* Animated Dot Grid Background */}
      <div className="absolute inset-0">
        <AnimatedDotGrid
          dotSize={1}
          gap={32}
          dotColor="rgba(0, 0, 0, 0.1)"
          mouseEffect={true}
        />
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/80" />

      <div className="relative max-w-6xl mx-auto w-full text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-gray-700">
            Engineering Education Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
          Assessment Infrastructure
          <br />
          <span className="text-gray-400">for Modern Education</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
          Precision tools for engineering institutions. Streamline evaluations,
          track performance, and manage academic workflows.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="group px-8"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8"
          >
            View Features
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="inline-flex items-center gap-8 px-6 py-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
          {[
            { value: "12K+", label: "Students" },
            { value: "2.8M+", label: "Assessments" },
            { value: "99.4%", label: "Accuracy" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
