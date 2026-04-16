"use client";

import { useState } from "react";
import PriceCalculator from "../simulation/PriceCalculator";

export default function DashboardShell({ children }) {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="flex min-h-screen bg-palm-bg">
      {/* Sidebar - Navigasi Permanen */}
      <aside className="w-64 bg-palm-dark text-white hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">
            PALM <span className="text-palm-accent">SYSTEM</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavItem 
            icon="📊" 
            label="Dashboard" 
            active={activeTab === "Dashboard"} 
            onClick={() => setActiveTab("Dashboard")}
          />
          <NavItem 
            icon="🚜" 
            label="Manajemen Kebun"
            active={activeTab === "Manajemen Kebun"} 
            onClick={() => setActiveTab("Manajemen Kebun")}
          />
          <NavItem 
            icon="🏭" 
            label="Operasional PKS"
            active={activeTab === "Operasional PKS"} 
            onClick={() => setActiveTab("Operasional PKS")}
          />
          <NavItem 
            icon="🧮" 
            label="Kalkulator Harga"
            active={activeTab === "Kalkulator Harga"} 
            onClick={() => setActiveTab("Kalkulator Harga")}
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Header - Profil & Notifikasi */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-semibold text-slate-700">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-palm-dark">Bapak User</p>
              <p className="text-xs text-slate-500">Owner / Investor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-palm-primary flex items-center justify-center text-white">
              U
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {activeTab === "Dashboard" && children}
          
          {activeTab === "Manajemen Kebun" && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-palm-dark mb-2">Modul Manajemen Kebun</h3>
              <p className="text-slate-500">Fitur pencatatan panen, perawatan blok, dan manajemen pekerja sedang dalam pengembangan.</p>
            </div>
          )}
          
          {activeTab === "Operasional PKS" && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-palm-dark mb-2">Modul Operasional PKS</h3>
              <p className="text-slate-500">Pencatatan penerimaan TBS, proses pengolahan, dan yield CPO/PK sedang dalam pengembangan.</p>
            </div>
          )}
          
          {activeTab === "Kalkulator Harga" && <PriceCalculator />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-palm-primary text-white" : "hover:bg-slate-800 text-slate-400"}`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
