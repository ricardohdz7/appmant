"use client";

import { KPI } from "@/lib/kpiCalculations";

export function KPICard({ kpi }: { kpi: KPI }) {
  const colorMap: Record<string, string> = {
    green: "#10b981",
    blue: "#0b4f9e",
    red: "#ef4444",
    gray: "#9ca3af",
  };

  const bgColorMap: Record<string, string> = {
    green: "#d1fae5",
    blue: "#dbeafe",
    red: "#fee2e2",
    gray: "#f3f4f6",
  };

  const color = colorMap[kpi.color || "gray"];
  const bgColor = bgColorMap[kpi.color || "gray"];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-medium text-gray-600">{kpi.label}</p>
      </div>

      <div className="mb-2">
        <p className="text-2xl font-bold" style={{ color }}>
          {kpi.value}
        </p>
        {kpi.total && (
          <p className="text-xs text-gray-500">
            de {kpi.total}
          </p>
        )}
      </div>

      {kpi.percentage !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(kpi.percentage, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}

      {kpi.percentage !== undefined && (
        <p className="text-xs text-gray-600 mt-2">
          {kpi.percentage}%
        </p>
      )}
    </div>
  );
}
