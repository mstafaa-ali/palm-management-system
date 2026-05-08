import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplet, Factory, Scale, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

interface SummaryData {
  total_tbs_olah_kg: number;
  total_cpo_kg: number;
  total_pk_kg: number;
  rata_oer: number;
  rata_ker: number;
  jumlah_hari_produksi: number;
}

interface ChartData {
  tanggal: string;
  oer: number;
  ker: number;
  tbs: number;
  cpo: number;
  pk: number;
}

export default function RendemenDashboard({ refreshTrigger }: { refreshTrigger: number }) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      // Fetch Summary
      const summaryRes = await fetch(`${apiUrl}/api/mill-production/summary`);
      const summaryResult = await summaryRes.json();
      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

      // Fetch Data for Chart
      const dataRes = await fetch(`${apiUrl}/api/mill-production`);
      const dataResult = await dataRes.json();
      if (dataResult.success) {
        const formattedData = dataResult.data.map((item: any) => ({
          tanggal: format(new Date(item.tanggal_produksi), "dd MMM"),
          oer: Number(item.oer_persen),
          ker: Number(item.ker_persen),
          tbs: Number(item.tbs_olah_kg),
          cpo: Number(item.cpo_dihasilkan_kg),
          pk: Number(item.pk_dihasilkan_kg),
        })).reverse(); // Reverse for chronological order on chart
        setChartData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching rendemen dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-700 font-medium">OER: {payload[0].value}%</p>
            <p className="text-blue-700 font-medium">KER: {payload[1].value}%</p>
            <div className="border-t pt-1 mt-1 border-slate-100">
              <p className="text-slate-600">TBS Olah: {payload[0].payload.tbs.toLocaleString("id-ID")} kg</p>
              <p className="text-slate-600">CPO: {payload[0].payload.cpo.toLocaleString("id-ID")} kg</p>
              <p className="text-slate-600">PK: {payload[0].payload.pk.toLocaleString("id-ID")} kg</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Total TBS Olah</CardTitle>
            <Scale className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-slate-800">
                {((summary?.total_tbs_olah_kg || 0) / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Ton
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Total CPO</CardTitle>
            <Droplet className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-slate-800">
                {((summary?.total_cpo_kg || 0) / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Ton
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Rata-rata OER</CardTitle>
            <Target className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-emerald-600">
                  {summary?.rata_oer?.toFixed(2) || "0.00"}%
                </div>
                {summary && summary.rata_oer >= 22 ? (
                  <span className="text-xs font-medium text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">Sesuai Target</span>
                ) : (
                  <span className="text-xs font-medium text-red-500 mb-1 bg-red-50 px-2 py-0.5 rounded-full">Di Bawah Target</span>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Target industri: 22%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Rata-rata KER</CardTitle>
            <Factory className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-blue-600">
                  {summary?.rata_ker?.toFixed(2) || "0.00"}%
                </div>
                {summary && summary.rata_ker >= 5 ? (
                  <span className="text-xs font-medium text-blue-600 mb-1 bg-blue-50 px-2 py-0.5 rounded-full">Sesuai Target</span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 mb-1 bg-slate-50 px-2 py-0.5 rounded-full">Di Bawah Target</span>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Target industri: 5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Tren OER & KER</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-[250px]" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Belum ada data produksi untuk ditampilkan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={10} domain={[0, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  <ReferenceLine yAxisId="left" y={22} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Target OER (22%)', fill: '#eab308', fontSize: 12 }} />
                  <ReferenceLine yAxisId="right" y={5} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'Target KER (5%)', fill: '#eab308', fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="oer" name="OER (%)" stroke="#059669" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="ker" name="KER (%)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
