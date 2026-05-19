"use client";

export function Stats() {
  const stats = [
    {
      value: "12,000+",
      label: "Students Assessed",
      description: "Across engineering programs",
    },
    {
      value: "2.8M+",
      label: "Evaluations",
      description: "Completed with precision",
    },
    {
      value: "99.4%",
      label: "Accuracy Rate",
      description: "In grade calculations",
    },
    {
      value: "40%",
      label: "Time Saved",
      description: "On administrative tasks",
    },
  ];

  return (
    <section id="stats" className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 mb-6">
            <span className="text-xs font-medium text-gray-700">
              Performance
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Engineering Institutions
          </h2>
          <p className="text-lg text-gray-600">
            Real impact across technical education programs worldwide.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Real-time Sync",
              description:
                "Instant updates across all roles and dashboards with sub-second latency.",
            },
            {
              title: "Audit Trail",
              description:
                "Complete history of all assessments, changes, and approvals for compliance.",
            },
            {
              title: "Role-Based Access",
              description:
                "Granular permissions for controllers, assessors, and verifiers.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-200 bg-white"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
