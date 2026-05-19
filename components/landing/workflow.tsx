"use client";

import { ClipboardList, UserCheck, BarChart, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Create Assessments",
    description:
      "Define competencies, tasks, and grading rubrics with precision controls.",
  },
  {
    icon: UserCheck,
    title: "Evaluate Students",
    description:
      "Multi-trial grading system with detailed scoring and performance tracking.",
  },
  {
    icon: BarChart,
    title: "Analyze Performance",
    description:
      "Real-time analytics and insights across students, classes, and competencies.",
  },
  {
    icon: CheckCircle,
    title: "Verify & Report",
    description:
      "Quality assurance workflows and comprehensive reporting for stakeholders.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="py-24 px-6 lg:px-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 mb-6">
            <span className="text-xs font-medium text-gray-300">Workflow</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Streamlined Assessment Process
          </h2>
          <p className="text-lg text-gray-400">
            From evaluation to insights, every step is designed for efficiency
            and precision.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(100%+1rem)] w-8 h-0.5 bg-gray-800" />
              )}

              {/* Step card */}
              <div className="relative">
                {/* Number badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                  <step.icon className="w-8 h-8 text-gray-400" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-lg bg-gray-900 border border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to streamline your assessments?
              </h3>
              <p className="text-gray-400">
                Join institutions already using Assessor for engineering
                education.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button className="px-6 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors">
                Get Started
              </button>
              <button className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
