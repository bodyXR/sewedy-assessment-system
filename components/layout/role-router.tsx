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

    console.log("🎯 RoleRouter - user:", user);
    console.log("🎯 RoleRouter - roleContext:", roleContext);

    const accountRole = user.accountRole;

    // For controller, always allow controller routes
    if (accountRole === "controller") {
      if (!pathname.startsWith("/controller")) {
        router.push("/controller/dashboard");
      }
      return;
    }

    // For assessors and verifiers, check their assigned role from roleContext
    if (roleContext && roleContext.assignedRole) {
      const assignedRole = roleContext.assignedRole;

      console.log(
        "Role Router - assigned role:",
        assignedRole,
        "current path:",
        pathname,
      );

      // Redirect to the correct dashboard based on assigned role
      if (assignedRole === "assessor" && !pathname.startsWith("/assessor")) {
        router.push("/assessor/students");
      } else if (
        assignedRole === "verifier" &&
        !pathname.startsWith("/verifier")
      ) {
        router.push("/verifier/results");
      }
    } else {
      console.warn("⚠️ RoleRouter - No roleContext or assignedRole found");
    }
  }, [user, isLoading, isRoleLoading, roleContext, pathname, router]);

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
