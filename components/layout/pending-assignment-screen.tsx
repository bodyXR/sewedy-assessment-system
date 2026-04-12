"use client";

import { Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function PendingAssignmentScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Awaiting Role Assignment
        </h1>
        <p className="text-gray-500 mb-2">
          Hi{" "}
          <span className="font-semibold text-gray-700">{user?.fullName}</span>,
        </p>
        <p className="text-gray-500 mb-8">
          You haven't been assigned a role for the current assessment cycle yet.
          Please contact your Controller to get assigned.
        </p>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
