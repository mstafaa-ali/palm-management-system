import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function PriceCalculator() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Kolom Input */}
      <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
        <CardHeader className="border-b mb-4">
          <CardTitle className="text-lg font-bold text-palm-dark">
            Parameter Harga
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Harga CPO Global (IDR/Kg)
            </label>
            <Input
              type="number"
              placeholder="Contoh: 12500"
              defaultValue={12500}
            />
          </div>
          
          <div className="pt-4">
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
      <Card className="lg:col-span-8 bg-palm-dark text-white rounded-2xl shadow-xl flex flex-col justify-center items-center p-8 border-none">
        <p className="text-palm-accent uppercase tracking-widest text-sm font-bold">
          Harga TBS Wajar Hari Ini
        </p>
        <h1 className="text-7xl font-black my-4">
          Rp 2.650<span className="text-2xl text-slate-400">/Kg</span>
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-slate-700 pt-8">
          <div className="text-center">
            <p className="text-slate-400 text-xs">Margin PKS Est.</p>
            <p className="text-xl font-bold text-yield-high">Rp 150/Kg</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs">Indeks K</p>
            <p className="text-xl font-bold">87.5%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
