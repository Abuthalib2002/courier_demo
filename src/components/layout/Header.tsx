"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { enquiries, recentActivities } = useAutomation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title and breadcrumb
  const getBreadcrumbs = () => {
    if (pathname === '/' || pathname === '/dashboard') {
      return { title: 'Operations Dashboard', trail: ['Overview', 'Dashboard'] };
    }
    if (pathname === '/enquiries') {
      return { title: 'Customer Enquiries', trail: ['Enquiries', 'Management'] };
    }
    if (pathname === '/enquiries/new') {
      return { title: 'Register New Enquiry', trail: ['Enquiries', 'Create New'] };
    }
    if (pathname.startsWith('/enquiries/')) {
      return { title: 'Enquiry Details & File', trail: ['Enquiries', 'Detail View'] };
    }
    if (pathname === '/verification') {
      return { title: 'Information Verification', trail: ['Quality Control', 'Verification Checklist'] };
    }
    if (pathname.startsWith('/verification/')) {
      return { title: 'Verify Enquiry Checklist', trail: ['Verification', 'Checklist'] };
    }
    if (pathname === '/rate-requests') {
      return { title: 'Agent Rate Requests', trail: ['Sourcing', 'Carrier Rates'] };
    }
    if (pathname === '/quotations') {
      return { title: 'Commercial Quotations', trail: ['Pricing', 'Customer Quotations'] };
    }
    if (pathname === '/quotations/new') {
      return { title: 'Create Quotation', trail: ['Pricing', 'New Quotation'] };
    }
    if (pathname.startsWith('/quotations/')) {
      return { title: 'Quotation Proposal Sheet', trail: ['Pricing', 'Quotation View'] };
    }
    if (pathname === '/workflow') {
      return { title: 'Workflow Pipeline Monitor', trail: ['Automation', 'Stage Tracker'] };
    }
    if (pathname === '/settings') {
      return { title: 'System & Pricing Settings', trail: ['Administration', 'Configuration'] };
    }
    return { title: 'Automation System', trail: ['System'] };
  };

  const { title, trail } = getBreadcrumbs();

  // Search filter
  const searchResults = searchQuery.trim()
    ? enquiries.filter((e) =>
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.destination.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left Side: Mobile toggle + Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-500 rounded-lg hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400">
              {trail.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                  <span className={idx === trail.length - 1 ? 'font-medium text-slate-600' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Side: Global Search + Date + Notification + Demo user */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Search Bar */}
          <div ref={searchRef} className="relative hidden md:block w-64 lg:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search enquiries, ports, clients..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Quick search dropdown */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-2 text-[11px] font-semibold text-slate-400 bg-slate-50/80 border-b border-slate-100">
                  Quick Results ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          router.push(`/enquiries/${item.id}`);
                        }}
                        className="w-full p-2.5 text-left hover:bg-blue-50/60 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-600">{item.id}</span>
                            <span className="text-xs font-medium text-slate-800">{item.companyName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.origin} → {item.destination} ({item.serviceType})
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching enquiries found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Date Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg border border-slate-200/80">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{todayFormatted}</span>
          </div>

          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              aria-label="Workflow notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Workflow Event Feed</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 font-semibold rounded">
                      Demo Log
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Live events</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {recentActivities.slice(0, 6).map((act) => (
                    <div key={act.id} className="p-3 text-xs hover:bg-slate-50/70 transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800">{act.action}</span>
                        <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{act.details}</p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>By {act.user}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 text-center bg-slate-50 border-t border-slate-100">
                  <Link
                    href="/workflow"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Complete Workflow Monitor →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Demo User Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
              SJ
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Sarah Jenkins</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" /> Demo Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
