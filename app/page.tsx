"use client";

import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { Stats } from "@/components/landing/stats";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <main className="relative bg-white">
      <Navigation />
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
