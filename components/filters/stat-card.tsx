import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  readonly value: string | number;
  readonly label: string;
  readonly className?: string;
  readonly valueClassName?: string;
}

export function StatCard({
  value,
  label,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={cn("p-6 text-center", className)}>
      <div className={cn("text-4xl font-bold mb-2", valueClassName)}>
        {value}
      </div>
      <div className="text-sm text-gray-600 uppercase font-medium">{label}</div>
    </Card>
  );
}
