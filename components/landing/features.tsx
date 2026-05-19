"use client";

import {
  BarChart3,
  Users,
  FileCheck,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Real-time insights into student performance, competency tracking, and institutional metrics.",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Comprehensive student profiles, assessment history, and progress tracking across all competencies.",
  },
  {
    icon: FileCheck,
    title: "Assessment Workflows",
    description:
      "Streamlined evaluation processes with multi-trial grading, rubric management, and automated calculations.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Monitor individual and cohort progress with detailed analytics and performance trends over time.",
  },
  {
    icon: Shield,
    title: "Institutional Security",
    description:
      "Enterprise-grade security with role-based access control and complete audit trails.",
  },
  {
    icon: Zap,
    title: "Efficient Operations",
    description:
      "Reduce administrative overhead with automated workflows and intelligent task management.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-red-50 border border-red-100 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-gray-900">
              Core Features
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8">
            Everything You Need for
            <br />
            <span className="text-primary">Modern Assessment</span>
          </h2>
          <p className="text-xl text-gray-600">
            Powerful tools designed for engineering education excellence
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-10 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Assessment Process Section */}
        <div className="mt-40" id="Workflow">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-red-50 border border-red-100 mb-8">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-gray-900">
                Assessment Process
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Streamlined Workflow
            </h2>
            <p className="text-xl text-gray-600">
              From creation to verification, every step optimized for efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create",
                description: "Define competencies and assessment criteria",
                icon: FileCheck,
              },
              {
                step: "02",
                title: "Evaluate",
                description: "Multi-trial grading with detailed scoring",
                icon: Users,
              },
              {
                step: "03",
                title: "Analyze",
                description: "Real-time performance insights and analytics",
                icon: BarChart3,
              },
              {
                step: "04",
                title: "Verify",
                description: "Quality assurance and comprehensive reporting",
                icon: Shield,
              },
            ].map((step) => (
              <div key={step.step} className="relative group">
                <div className="relative p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="text-6xl font-bold text-primary/10 mb-6">
                    {step.step}
                  </div>
                  <step.icon className="w-10 h-10 text-primary mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
