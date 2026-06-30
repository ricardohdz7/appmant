"use client";

import { KPI } from "@/lib/kpiCalculations";
import { KPICard } from "./KPICard";

export function KPIDashboard({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} kpi={kpi} />
      ))}
    </div>
  );
}
