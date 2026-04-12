"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, roleContext, isRoleLoading } = useAuth();

  useEffect(() => {
    if (isLoading || isRoleLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Route to role-specific home
    switch (user.accountRole) {
      case "controller":
        router.push("/controller/dashboard");
        break;
      case "assessor":
        router.push("/assessor/students");
        break;
      case "verifier":
        router.push("/verifier/results");
        break;
      default:
        router.push("/login");
    }
  }, [user, isLoading, roleContext, isRoleLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}
