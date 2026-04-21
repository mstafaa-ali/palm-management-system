import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Home, Factory, HardHat, Settings } from "lucide-react";

export default function MillOperationsPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <Link href="/" className="hover:text-palm-primary transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">Mill Operations</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palm-dark flex items-center gap-3">
            <Factory className="w-8 h-8 text-palm-primary" />
            Mill Operations
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            FFB receiving, processing, and CPO/PK yield tracking module.
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
          <HardHat className="w-16 h-16 text-slate-300 mb-4" />
          <CardTitle className="text-xl font-bold text-slate-700">Data Processing</CardTitle>
          <CardDescription className="mt-2 text-base">
            This module is currently being integrated with the weighbridge systems.
          </CardDescription>
        </Card>

        <Card className="border-dashed border-2 border-slate-200 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
          <Settings className="w-16 h-16 text-slate-300 mb-4 animate-[spin_4s_linear_infinite]" />
          <CardTitle className="text-xl font-bold text-slate-700">Yield Analytics</CardTitle>
          <CardDescription className="mt-2 text-base">
            CPO & PK extraction rate analytics are under active development.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
