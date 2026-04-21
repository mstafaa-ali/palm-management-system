import PriceCalculator from "../../components/simulation/PriceCalculator";
import Link from "next/link";
import { ChevronRight, Home, Calculator } from "lucide-react";

export default function PriceCalculatorPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <Link href="/" className="hover:text-palm-primary transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">Price Calculator</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palm-dark flex items-center gap-3">
            <Calculator className="w-8 h-8 text-palm-primary" />
            Price Calculator
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            Simulasi harga FFB (Tandan Buah Segar) harian.
          </p>
        </div>
      </div>

      <PriceCalculator />
    </div>
  );
}
