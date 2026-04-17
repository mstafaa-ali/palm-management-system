import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RefinedStats() {
  return (
    <div className="space-y-8">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Panen"
          value="1.240 Ton"
          trend="+12.5%"
          isPositive={true}
        />
        <StatCard
          title="Rata-rata OER"
          value="23.4%"
          trend="-0.4%"
          isPositive={false}
        />
        <StatCard
          title="Harga TBS Rata2"
          value="Rp 2.650"
          trend="+Rp 50"
          isPositive={true}
        />
        <StatCard
          title="Cost / Kg"
          value="Rp 1.120"
          trend="-2%"
          isPositive={true}
        />
      </div>

      {/* Row 2: Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder Grafik - Dalam riilnya gunakan Recharts */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-bold text-palm-dark">Tren Produksi 30 Hari Terakhir</CardTitle>
            <select className="text-sm border-slate-200 rounded-md p-1 outline-none font-normal">
              <option>Semua Blok</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 bg-slate-50 rounded-lg flex items-end justify-between p-4 gap-2 mt-4">
              {/* Simulasi batang grafik sederhana */}
              {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-palm-primary/20 hover:bg-palm-primary transition-colors rounded-t-sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabel Aktivitas Terakhir */}
        <Card className="border-none shadow-sm rounded-2xl flex flex-col">
          <CardHeader>
            <CardTitle className="font-bold text-palm-dark text-lg">Truk Terakhir (PKS)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <RecentActivity
                id="TKT-001"
                source="Blok Alpha"
                weight="7.2 Ton"
                status="Selesai"
              />
              <RecentActivity
                id="TKT-002"
                source="Blok Bravo"
                weight="6.8 Ton"
                status="Selesai"
              />
              <RecentActivity
                id="TKT-003"
                source="Petani Mitra"
                weight="4.5 Ton"
                status="Proses"
              />
            </div>
            <Button variant="outline" className="w-full mt-6 text-palm-primary hover:text-palm-primary hover:bg-palm-bg">
              Lihat Semua Antrean
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive }) {
  return (
    <Card className="border-none shadow-sm rounded-2xl hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-3xl font-bold text-palm-dark">{value}</h2>
        <p
          className={`text-sm mt-2 font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}
        >
          {isPositive ? "▲" : "▼"} {trend}{" "}
          <span className="text-slate-400 font-normal">vs bln lalu</span>
        </p>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ id, source, weight, status }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-bold text-palm-dark">{id}</p>
        <p className="text-xs text-slate-500">{source}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{weight}</p>
        <p
          className={`text-[10px] font-bold uppercase ${status === "Selesai" ? "text-emerald-500" : "text-palm-accent"}`}
        >
          {status}
        </p>
      </div>
    </div>
  );
}
