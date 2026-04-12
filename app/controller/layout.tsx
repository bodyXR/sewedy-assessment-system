import { RoleLayout } from "@/components/layout/role-layout";

export default function ControllerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout>{children}</RoleLayout>;
}
