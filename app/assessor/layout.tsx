import { RoleLayout } from "@/components/layout/role-layout";

export default function AssessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout>{children}</RoleLayout>;
}
