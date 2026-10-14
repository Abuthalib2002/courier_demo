"use client";

import React, { useState, Suspense } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '@/components/ui/ToastContainer';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resetDemoData } = useAutomation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Demo Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs z-50">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-blue-300" /> UI DEMO
          </span>
          <span className="hidden sm:inline text-slate-200">
            Enquiry & Quotation Automation System: All actions, rate requests, email previews, and quotes run locally in your browser.
          </span>
          <span className="sm:hidden text-slate-200">
            Frontend UI Demo — No live backend.
          </span>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] text-white transition shrink-0"
          title="Reset demo data to initial factory state"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden md:inline">Reset Demo Data</span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <Suspense fallback={<aside className="fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A]" />}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Suspense fallback={<header className="h-16 bg-white border-b border-slate-200" />}>
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </Suspense>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>

      {/* Global Toast Stack */}
      <ToastContainer />
    </div>
  );
}
