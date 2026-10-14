"use client";

import React from 'react';
import Link from 'next/link';
import {
  Inbox,
  AlertTriangle,
  Clock,
  FileCheck2,
  Send,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  CheckSquare,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import {
  EnquiryStatusBadge,
  ServiceTypeBadge,
} from '@/components/ui/Badge';

export default function DashboardPage() {
  const { enquiries, metrics, recentActivities, isLoaded } = useAutomation();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading demo operations workspace...</p>
        </div>
      </div>
    );
  }

  // 6 Primary Summary Cards
  const summaryCards = [
    {
      title: 'Total Enquiries',
      value: metrics.totalEnquiries,
      subtext: 'All active & closed logs',
      icon: Inbox,
      color: 'blue',
      href: '/enquiries',
      bgColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'New Enquiries',
      value: metrics.newEnquiries,
      subtext: 'Requires acknowledgement',
      icon: TrendingUp,
      color: 'sky',
      href: '/enquiries?status=New',
      bgColor: 'bg-sky-50 text-sky-700',
    },
    {
      title: 'Awaiting Customer Info',
      value: metrics.awaitingInfo,
      subtext: 'Missing mandatory fields',
      icon: AlertTriangle,
      color: 'amber',
      href: '/verification',
      bgColor: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Awaiting Agent Rates',
      value: metrics.awaitingRates,
      subtext: 'Carrier RFP in transit',
      icon: Clock,
      color: 'indigo',
      href: '/rate-requests',
      bgColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Quotations Prepared',
      value: metrics.quotesPrepared,
      subtext: 'Drafts & approved proposals',
      icon: FileCheck2,
      color: 'emerald',
      href: '/quotations',
      bgColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Quotes Awaiting Response',
      value: metrics.quotesAwaitingResponse,
      subtext: 'Sent to client (Demo)',
      icon: Send,
      color: 'purple',
      href: '/quotations?status=Sent — Demo',
      bgColor: 'bg-purple-50 text-purple-700',
    },
  ];

  // 5 Most Recent Enquiries
  const recentEnquiries = enquiries.slice(0, 6);

  // Workflow stages list for overview
  const stages = [
    { name: '1. New Enquiry', count: metrics.workflowDistribution['New'] || 0, color: 'bg-sky-500' },
    { name: '2. Info Verification', count: metrics.workflowDistribution['Awaiting Info'] || 0, color: 'bg-amber-500' },
    { name: '3. Verified (Ready)', count: metrics.workflowDistribution['Verified'] || 0, color: 'bg-emerald-500' },
    { name: '4. Rate Requested', count: metrics.workflowDistribution['Rate Requested'] || 0, color: 'bg-indigo-500' },
    { name: '5. Rate Received', count: metrics.workflowDistribution['Rate Received'] || 0, color: 'bg-teal-500' },
    { name: '6. Quoted', count: metrics.workflowDistribution['Quoted'] || 0, color: 'bg-blue-600' },
    { name: '7. Accepted', count: metrics.acceptedQuotes, color: 'bg-emerald-600' },
    { name: '8. Rejected', count: metrics.rejectedQuotes, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome / Action Hero Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Live Operations Feed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Enquiry & Quotation Automation Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Simulate end-to-end logistics lifecycle from customer enquiry to rate solicitation, pricing calculation, quotation dispatch, and customer decision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/enquiries/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            New Customer Enquiry
          </Link>
          <Link
            href="/verification"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <CheckSquare className="w-4 h-4 text-slate-500" />
            Verify Enquiries
          </Link>
        </div>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${card.bgColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition flex items-center">
                    View <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
                  {card.value}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{card.title}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-2 truncate">
                {card.subtext}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Workflow Stage Distribution Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enquiry Pipeline Distribution</h3>
            <p className="text-xs text-slate-500">Distribution of enquiries across all 8 operational stages</p>
          </div>
          <Link
            href="/workflow"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Open Interactive Workflow Monitor <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Multi-segmented bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex my-3">
          {stages.map((stage) => {
            const percentage = (stage.count / Math.max(metrics.totalEnquiries, 1)) * 100;
            if (percentage === 0) return null;
            return (
              <div
                key={stage.name}
                className={`${stage.color} h-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
                title={`${stage.name}: ${stage.count}`}
              />
            );
          })}
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {stages.map((stage) => (
            <div key={stage.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className={`w-2.5 h-2.5 rounded-full ${stage.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 truncate">{stage.name}</p>
                <p className="text-xs font-bold text-slate-800">{stage.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Recent Enquiries Table & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Enquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Enquiries</h3>
              <p className="text-xs text-slate-500">Latest logistics and courier enquiries received</p>
            </div>
            <Link
              href="/enquiries"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All {metrics.totalEnquiries} Enquiries <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-4">Enquiry ID</th>
                  <th className="py-3 px-3">Customer / Company</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Received</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                      <Link href={`/enquiries/${enq.id}`} className="hover:underline">
                        {enq.id}
                      </Link>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{enq.companyName}</div>
                      <div className="text-[11px] text-slate-400">{enq.customerName}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <ServiceTypeBadge service={enq.serviceType} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                      <div className="font-medium text-slate-700 truncate max-w-[130px]" title={enq.origin}>
                        {enq.origin.split('(')[0].split(',')[0]}
                      </div>
                      <div className="text-slate-400 truncate max-w-[130px]" title={enq.destination}>
                        → {enq.destination.split('(')[0].split(',')[0]}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                      {enq.receivedDate.split(' ')[0]}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <EnquiryStatusBadge status={enq.status} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                      {enq.assignedEmployee}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/enquiries/${enq.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
              <p className="text-xs text-slate-500">Chronological audit stream</p>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Automated
            </span>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[480px] space-y-4">
            {recentActivities.slice(0, 7).map((act, idx) => (
              <div key={act.id || idx} className="relative flex gap-3 text-xs">
                {idx < 6 && (
                  <span
                    className="absolute left-[13px] top-6 bottom-[-16px] w-[2px] bg-slate-100"
                    aria-hidden="true"
                  />
                )}
                <div className="mt-0.5 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white ${
                      act.badge === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : act.badge === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : act.badge === 'danger'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                </div>

                <div className="flex-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{act.details}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">Logged by: {act.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
