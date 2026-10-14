"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  PlusCircle,
  CheckSquare,
  Send,
  FileText,
  GitFork,
  Settings,
  Ship,
  Sparkles,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { metrics } = useAutomation();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Customer Enquiries',
      href: '/enquiries',
      icon: Inbox,
      badge: metrics.newEnquiries > 0 ? `${metrics.newEnquiries} new` : null,
      badgeColor: 'bg-blue-500 text-white',
    },
    {
      name: 'Create Enquiry',
      href: '/enquiries/new',
      icon: PlusCircle,
      badge: null,
    },
    {
      name: 'Information Verification',
      href: '/verification',
      icon: CheckSquare,
      badge: metrics.awaitingInfo > 0 ? `${metrics.awaitingInfo} need info` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      name: 'Agent Rate Requests',
      href: '/rate-requests',
      icon: Send,
      badge: metrics.awaitingRates > 0 ? `${metrics.awaitingRates} pending` : null,
      badgeColor: 'bg-indigo-500 text-white',
    },
    {
      name: 'Quotations',
      href: '/quotations',
      icon: FileText,
      badge: metrics.quotesPrepared > 0 ? `${metrics.quotesPrepared}` : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      name: 'Workflow Monitor',
      href: '/workflow',
      icon: GitFork,
      badge: null,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A] text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">ApexFreight</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                  DEMO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Automation Workflow</p>
            </div>
          </Link>
        </div>

        {/* Workflow Quick Indicator */}
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" /> Demo System Active
            </span>
            <span className="text-[11px] text-slate-400">{metrics.totalEnquiries} Enquiries</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{
                width: `${(metrics.acceptedQuotes / Math.max(metrics.totalEnquiries, 1)) * 100}%`,
              }}
              title="Accepted"
            />
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{
                width: `${(metrics.quotesPrepared / Math.max(metrics.totalEnquiries, 1)) * 100}%`,
              }}
              title="Quoted"
            />
            <div
              className="bg-amber-500 transition-all duration-500"
              style={{
                width: `${(metrics.awaitingRates / Math.max(metrics.totalEnquiries, 1)) * 100}%`,
              }}
              title="Awaiting Rates"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/' || pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-md shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs border border-white/20 shadow-sm">
              SJ
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">Sarah Jenkins</p>
              <p className="text-[11px] text-slate-400 truncate">Senior Freight Specialist</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
}
