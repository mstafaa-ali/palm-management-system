"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeighbridgeSummaryData } from "@/types/weighbridge";

export default function WeighbridgeSummary() {
  const [summary, setSummary] = useState<WeighbridgeSummaryData | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/weighbridge/summary`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch weighbridge summary:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Total Truk Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{summary?.totalTruk || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Total Netto (T)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">
            {summary?.totalNetto_ton ? summary.totalNetto_ton.toFixed(2) : "0.00"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Internal Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{summary?.internalCount || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Eksternal Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{summary?.eksternalCount || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
