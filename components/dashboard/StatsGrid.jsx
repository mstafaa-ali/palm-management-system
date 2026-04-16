export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      {/* Contoh Card OER */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 uppercase">
          Avg. OER (Rendemen)
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <h2 className="text-3xl font-bold text-palm-dark">23.4%</h2>
          <span className="text-yield-high text-xs font-semibold">
            +0.5% vs Yesterday
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
          <div className="bg-yield-high h-full w-[85%]" />
        </div>
      </div>

      {/* ... Card lainnya ... */}
    </div>
  );
}
