import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CircleDollarSign, Percent, TrendingUp } from "lucide-react";

export default function PriceCalculator() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Input */}
      <Card className="lg:col-span-4 border-slate-100 shadow-sm rounded-xl transition-all">
        <CardHeader className="border-b border-slate-50 pb-4 mb-4">
          <CardTitle className="text-lg font-bold text-palm-dark flex items-center gap-2">
            <SettingsIcon />
            Parameter Harga
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Harga CPO Global (IDR/Kg)
            </label>
            <Input
              type="number"
              placeholder="Contoh: 12500"
              defaultValue={12500}
              className="text-lg font-medium border-slate-200 focus-visible:ring-palm-primary transition-shadow h-12"
            />
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-4 text-sm font-semibold text-slate-500">
              <span>Rp 10.000</span>
              <span className="text-palm-primary font-bold">12.500</span>
              <span>Rp 15.000</span>
            </div>
            <Slider
              defaultValue={[12500]}
              max={15000}
              min={10000}
              step={100}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kolom Hasil */}
      <Card className="lg:col-span-8 bg-gradient-to-br from-palm-dark to-slate-900 text-white rounded-xl shadow-md flex flex-col justify-center items-center p-10 border-none relative overflow-hidden">
        {/* Dekorasi Visual */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-palm-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-palm-accent/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 w-full text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/5">
            <CircleDollarSign className="w-8 h-8 text-palm-accent" />
          </div>
          <p className="text-palm-accent uppercase tracking-widest text-sm font-bold opacity-90">
            Harga TBS Wajar Hari Ini
          </p>
          <h1 className="text-6xl md:text-7xl font-black my-4 tracking-tight drop-shadow-sm">
            Rp 2.650<span className="text-2xl md:text-3xl text-slate-300 font-bold">/Kg</span>
          </h1>

          <div className="mt-12 grid grid-cols-2 gap-8 w-full border-t border-slate-700/50 pt-8 max-w-lg mx-auto">
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-slate-300 text-xs uppercase tracking-wider mb-1">Margin PKS Est.</p>
              <p className="text-xl font-bold text-emerald-400">Rp 150/Kg</p>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-center mb-2">
                <Percent className="w-5 h-5 text-palm-primary group-hover:text-white transition-colors" color="#4ade80" />
              </div>
              <p className="text-slate-300 text-xs uppercase tracking-wider mb-1">Indeks K</p>
              <p className="text-xl font-bold text-slate-100">87.5%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-palm-primary"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
}
