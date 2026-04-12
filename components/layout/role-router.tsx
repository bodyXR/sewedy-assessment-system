"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { PendingAssignmentScreen } from "./pending-assignment-screen";

interface RoleRouterProps {
  children: React.ReactNode;
}

// Which path prefixes each role is allowed to access
const ROLE_PREFIXES: Record<string, string> = {
  controller: "/controller",
  assessor: "/assessor",
  verifier: "/verifier",
};

export function RoleRouter({ children }: RoleRouterProps) {
  const { user, isLoading, roleContext, isRoleLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || isRoleLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const accountRole = user.accountRole;
    const allowedPrefix = ROLE_PREFIXES[accountRole];

    // If user is on a path not belonging to their role, redirect
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      if (accountRole === "controller") router.push("/controller/dashboard");
      else if (accountRole === "assessor") router.push("/assessor/students");
      else if (accountRole === "verifier") router.push("/verifier/results");
    }
  }, [user, isLoading, isRoleLoading, pathname, router]);

  if (isLoading || isRoleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Resolving your role...</p>
      </div>
    );
  }

  if (!user) return null;

  // Non-controller users with no assignment
  if (user.accountRole !== "controller" && !roleContext) {
    return <PendingAssignmentScreen />;
  }

  return <>{children}</>;
}
