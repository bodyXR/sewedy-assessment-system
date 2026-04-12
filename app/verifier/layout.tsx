import { RoleLayout } from "@/components/layout/role-layout";

export default function VerifierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout>{children}</RoleLayout>;
}
