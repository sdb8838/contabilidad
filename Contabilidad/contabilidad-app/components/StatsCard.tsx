"use client";

import { formatCurrency } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: "presupuesto" | "ejecutado" | "prevision" | "ampliacion" | "default";
  icon?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  variant = "default",
  icon,
}: StatsCardProps) {
  const variantClasses = {
    presupuesto: "bg-green-50 border-green-500",
    ejecutado: "bg-red-50 border-red-500",
    prevision: "bg-yellow-50 border-yellow-500",
    ampliacion: "bg-purple-50 border-purple-500",
    default: "bg-gray-50 border-gray-300",
  };

  // Si es string, lo usamos directamente; si es número, lo formateamos
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  const valueColor = numericValue < 0 ? "text-red-600" : "text-green-600";
  const displayValue = typeof value === "string" ? value : formatCurrency(value);

  return (
    <div className={`card border-l-4 ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>
            {displayValue}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
    </div>
  );
}
