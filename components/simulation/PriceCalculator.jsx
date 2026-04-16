// components/simulation/PriceCalculator.jsx
export default function PriceCalculator() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Kolom Input */}
      <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-palm-dark border-b pb-4">
          Parameter Harga
        </h3>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Harga CPO Global (IDR/Kg)
          </label>
          <input
            type="number"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-palm-primary outline-none"
            placeholder="Contoh: 12500"
          />

          <input
            type="range"
            className="w-full accent-palm-primary"
            min="10000"
            max="15000"
          />
        </div>
      </div>

      {/* Kolom Hasil */}
      <div className="lg:col-span-8 bg-palm-dark text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center">
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
      </div>
    </div>
  );
}
