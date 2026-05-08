"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Factory } from "lucide-react";
import WeighbridgeSummary from "@/components/mill/WeighbridgeSummary";
import WeighbridgeTable from "@/components/mill/WeighbridgeTable";
import WeighbridgeEntryDialog from "@/components/mill/WeighbridgeEntryDialog";
import RendemenDashboard from "@/components/mill/RendemenDashboard";
import ProductionTable from "@/components/mill/ProductionTable";
import ProductionFormDialog from "@/components/mill/ProductionFormDialog";
import LossesDashboard from "@/components/mill/LossesDashboard";
import LossesTable from "@/components/mill/LossesTable";
import LossesFormDialog from "@/components/mill/LossesFormDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MillOperationsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
            Operasional PKS
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            Manajemen operasional Pabrik Kelapa Sawit (Jembatan Timbang, Produksi & Losses)
          </p>
        </div>
      </div>

      <Tabs defaultValue="weighbridge" className="mt-8 space-y-6">
        <TabsList className="bg-slate-100/80 p-1 border border-slate-200">
          <TabsTrigger value="weighbridge" className="data-[state=active]:bg-white data-[state=active]:text-palm-primary data-[state=active]:shadow-sm">
            Jembatan Timbang
          </TabsTrigger>
          <TabsTrigger value="rendemen" className="data-[state=active]:bg-white data-[state=active]:text-palm-primary data-[state=active]:shadow-sm">
            Produksi & Rendemen
          </TabsTrigger>
          <TabsTrigger value="losses" className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">
            Tracking Losses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weighbridge" className="space-y-6 animate-in fade-in-50 duration-500 mt-0">
          <div className="flex justify-end">
            <WeighbridgeEntryDialog onEntryCreated={handleRefresh} />
          </div>
          <WeighbridgeSummary key={`summary-${refreshTrigger}`} />
          <WeighbridgeTable refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="rendemen" className="space-y-6 animate-in fade-in-50 duration-500 mt-0">
          <div className="flex justify-end">
            <ProductionFormDialog onSuccess={handleRefresh} />
          </div>
          <RendemenDashboard refreshTrigger={refreshTrigger} />
          <ProductionTable refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="losses" className="space-y-6 animate-in fade-in-50 duration-500 mt-0">
          <div className="flex justify-end">
            <LossesFormDialog onSuccess={handleRefresh} />
          </div>
          <LossesDashboard refreshTrigger={refreshTrigger} />
          <LossesTable refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

