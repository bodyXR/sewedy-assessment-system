"use client";

import { useState, useMemo } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockResults, mockStudents, mockCycles } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

const COMPETENCIES = [
  "Structural",
  "Civil",
  "Electrical",
  "Mechanical",
  "Software",
];
const CLASSES = ["Junior", "Wheeler", "Senior", "Lead"];

export default function VerifierReportPage() {
  const { toast } = useToast();
  const activeCycle = mockCycles.find((c) => c.status === "active");

  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const allResults = useMemo(
    () => mockResults.filter((r) => r.status !== "draft"),
    [],
  );

  const byCompetency = useMemo(
    () =>
      COMPETENCIES.map((comp) => {
        const compResults = allResults.filter((r) => r.competency === comp);
        return {
          comp,
          total: compResults.length,
          approved: compResults.filter((r) => r.status === "approved").length,
          submitted: compResults.filter((r) => r.status === "submitted").length,
        };
      }).filter((c) => c.total > 0),
    [allResults],
  );

  const byClass = useMemo(
    () =>
      CLASSES.map((cls) => {
        const classStudents = mockStudents.filter((s) => s.gradeLevel === cls);
        const classResults = allResults.filter((r) =>
          classStudents.some((s) => s.id === r.studentId),
        );
        return {
          cls,
          students: classStudents.length,
          assessed: classResults.length,
          approved: classResults.filter((r) => r.status === "approved").length,
        };
      }).filter((c) => c.students > 0),
    [allResults],
  );

  const handleSend = () => {
    if (!notes.trim()) {
      toast({
        title: "Required",
        description: "Please add report notes before sending.",
        variant: "destructive",
      });
      return;
    }
    setSent(true);
    toast({
      title: "Report Sent",
      description: "Your monitoring report has been sent to the Controller.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Send Report to Controller</h1>
        <p className="text-red-100 text-sm">
          {activeCycle ? activeCycle.name : "No active cycle"} · End-of-round
          monitoring summary
        </p>
      </div>

      {/* By Competency */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Progress by Competency
        </h2>
        <div className="space-y-3">
          {byCompetency.length === 0 ? (
            <p className="text-sm text-gray-400">No submitted results yet.</p>
          ) : (
            byCompetency.map((c) => (
              <div key={c.comp} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-28 shrink-0 font-medium">
                  {c.comp}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{
                      width:
                        c.total > 0 ? `${(c.approved / c.total) * 100}%` : "0%",
                    }}
                  />
                </div>
                <div className="flex gap-3 text-xs text-gray-500 w-48 shrink-0">
                  <span className="text-green-600 font-medium">
                    {c.approved} approved
                  </span>
                  <span className="text-amber-500">{c.submitted} pending</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* By Class */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Progress by Class</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {byClass.map((c) => (
            <div key={c.cls} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="font-semibold text-gray-900">{c.cls}</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {c.assessed}
              </p>
              <p className="text-xs text-gray-400">of {c.students} assessed</p>
              <p className="text-xs text-green-600 mt-1">
                {c.approved} approved
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Notes */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Report Notes</h2>
        <p className="text-sm text-gray-500 mb-3">
          Summarize your observations for this cycle. This will be sent to the
          Controller.
        </p>
        <Textarea
          placeholder="e.g. Overall progress is on track. Structural competency has 2 pending results. Civil class shows strong performance..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          disabled={sent}
          className="resize-none"
        />
      </Card>

      {sent ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700">
            Report sent to Controller successfully.
          </p>
        </div>
      ) : (
        <Button
          onClick={handleSend}
          className="bg-red-500 hover:bg-red-600 gap-2"
          size="lg"
        >
          <Send className="w-5 h-5" />
          Send Report to Controller
        </Button>
      )}
    </div>
  );
}
