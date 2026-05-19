"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CTA() {
  const router = useRouter();

  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl bg-gray-900 overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative px-8 py-16 lg:px-16 lg:py-20">
            <div className="max-w-3xl">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Start Assessing with Precision
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Join engineering institutions using Assessor to streamline
                evaluations, track performance, and maintain academic
                excellence.
              </p>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  "Instant setup",
                  "No credit card required",
                  "Full feature access",
                  "Enterprise support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="border-gray-700 text-black hover:bg-gray-800"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-50" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500">
          Trusted by engineering departments worldwide
        </p>
      </div>
    </section>
  );
}
