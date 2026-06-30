"use client";

import { KPI } from "@/lib/kpiCalculations";

export function KPICard({ kpi }: { kpi: KPI }) {
  // Mapas de colores modernos con gradientes y mejor contraste
  const themeMap: Record<
    string,
    {
      gradient: string;
      accentColor: string;
      textColor: string;
      bgLight: string;
      progressBg: string;
      icon: string;
    }
  > = {
    green: {
      gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      accentColor: "#059669",
      textColor: "#065f46",
      bgLight: "#a7f3d0",
      progressBg: "#d1fae5",
      icon: "✅",
    },
    blue: {
      gradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      accentColor: "#2563eb",
      textColor: "#1e40af",
      bgLight: "#93c5fd",
      progressBg: "#dbeafe",
      icon: "📊",
    },
    red: {
      gradient: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
      accentColor: "#dc2626",
      textColor: "#991b1b",
      bgLight: "#fca5a5",
      progressBg: "#fecaca",
      icon: "⚠️",
    },
    gray: {
      gradient: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
      accentColor: "#4b5563",
      textColor: "#1f2937",
      bgLight: "#9ca3af",
      progressBg: "#e5e7eb",
      icon: "📋",
    },
  };

  const theme = themeMap[kpi.color || "gray"];

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group"
      style={{
        background: theme.gradient,
        border: `1px solid ${theme.bgLight}60`,
        boxShadow: `0 4px 16px ${theme.accentColor}12, 0 1px 4px ${theme.accentColor}08`,
      }}
    >
      {/* Decorative accent circle */}
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-125"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: theme.accentColor }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: theme.textColor }}
        >
          {kpi.label}
        </p>
        <span className="text-lg opacity-80">{theme.icon}</span>
      </div>

      {/* Value */}
      <div className="mb-3 relative z-10">
        <p
          className="text-4xl font-extrabold tracking-tight leading-none"
          style={{ color: theme.accentColor }}
        >
          {kpi.label === "Cumplimiento General" && kpi.percentage !== undefined
            ? `${kpi.value}%`
            : kpi.value}
        </p>
        {kpi.total && (
          <p
            className="text-sm font-semibold mt-1 opacity-70"
            style={{ color: theme.textColor }}
          >
            de {kpi.total} total
          </p>
        )}
      </div>

      {/* Progress bar */}
      {kpi.percentage !== undefined && (
        <div className="relative z-10">
          <div
            className="w-full rounded-full h-2.5 overflow-hidden"
            style={{ backgroundColor: `${theme.accentColor}15` }}
          >
            <div
              className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(kpi.percentage, 100)}%`,
                background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.bgLight})`,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span
              className="text-sm font-bold"
              style={{ color: theme.accentColor }}
            >
              {kpi.percentage}%
            </span>
            {kpi.percentage >= 80 && (
              <span className="text-xs font-medium opacity-60" style={{ color: theme.textColor }}>
                Excelente
              </span>
            )}
            {kpi.percentage >= 50 && kpi.percentage < 80 && (
              <span className="text-xs font-medium opacity-60" style={{ color: theme.textColor }}>
                En progreso
              </span>
            )}
            {kpi.percentage < 50 && kpi.percentage > 0 && (
              <span className="text-xs font-medium opacity-60" style={{ color: theme.textColor }}>
                Atención
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
