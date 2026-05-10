import { cn } from "../lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "orange" | "blue" | "green" | "red" | "purple" | "teal" | "amber";
  description?: string;
  className?: string;
}

const colorMap = {
  orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  green: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100" },
  red: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
  teal: { bg: "bg-teal-50", icon: "text-teal-500", border: "border-teal-100" },
  amber: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
};

export function StatsCard({ title, value, icon: Icon, color = "orange", description, className }: StatsCardProps) {
  const colors = colorMap[color];
  return (
    <div className={cn("bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", colors.bg)}>
          <Icon size={22} className={colors.icon} />
        </div>
      </div>
    </div>
  );
}
