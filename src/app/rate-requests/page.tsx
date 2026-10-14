"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileSpreadsheet,
  Mail,
  DollarSign,
  Building,
  User,
  Star,
  Calendar,
  ExternalLink,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import {
  RateRequestStatusBadge,
  ServiceTypeBadge,
} from '@/components/ui/Badge';
import { RateRequest, FreightAgent, ServiceType } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import Modal from '@/components/ui/Modal';

function RateRequestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryCreateFor = searchParams?.get('createFor') || '';
  const queryHighlightId = searchParams?.get('id') || '';

  const {
    rateRequests,
    enquiries,
    agents,
    createRateRequest,
    markRateRequestSent,
    isLoaded,
  } = useAutomation();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(() => !!queryCreateFor);
  const [previewEmailReq, setPreviewEmailReq] = useState<RateRequest | null>(null);

  // Form State for New Rate Request
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(() => queryCreateFor || '');
  const [selectedAgentId, setSelectedAgentId] = useState(() => {
    if (queryCreateFor) {
      const enq = enquiries.find((e) => e.id === queryCreateFor);
      if (enq) {
        const matchingAgent = agents.find((a) => a.services.includes(enq.serviceType));
        if (matchingAgent) return matchingAgent.id;
      }
    }
    return agents[0]?.id || '';
  });
  const [expectedDate, setExpectedDate] = useState(() =>
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );

  const filteredRequests = useMemo(() => {
    return rateRequests.filter((r) => {
      const matchSearch =
        search.trim() === '' ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.enquiryId.toLowerCase().includes(search.toLowerCase()) ||
        r.agentCompany.toLowerCase().includes(search.toLowerCase()) ||
        r.agentName.toLowerCase().includes(search.toLowerCase()) ||
        r.origin.toLowerCase().includes(search.toLowerCase()) ||
        r.destination.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rateRequests, search, statusFilter]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId || !selectedAgentId) return;

    const created = createRateRequest({
      enquiryId: selectedEnquiryId,
      agentId: selectedAgentId,
      expectedResponseDate: expectedDate,
    });

    if (created) {
      setShowCreateModal(false);
      // Offer to preview and send immediately
      setPreviewEmailReq(created);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Agent Rate Requests (Carrier RFPs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Solicit, manage, and record carrier tariffs from certified logistics agents.
          </p>
        </div>

        <button
          onClick={() => {
            // Pick first verified enquiry
            const verified = enquiries.find((e) => e.verification.isVerified) || enquiries[0];
            setSelectedEnquiryId(verified ? verified.id : '');
            setSelectedAgentId(agents[0]?.id || '');
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs shadow-blue-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create Rate Request
        </button>
      </div>

      {/* Agents Roster Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contracted Freight Agent Network
            </span>
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              5 Partners Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">{agent.id}</span>
                  <div className="flex items-center text-amber-500 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    {agent.rating}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={agent.company}>
                  {agent.company}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{agent.name}</p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[90px]">{agent.services.join(', ')}</span>
                <span className="font-semibold text-blue-600">~{agent.responseTimeHours}h resp</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by RFP ID, Enquiry ID, Agent Company, or Route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition text-slate-700"
          >
            <option value="All">All Statuses ({rateRequests.length})</option>
            <option value="Draft">Draft</option>
            <option value="Ready to Send">Ready to Send</option>
            <option value="Sent — Demo">Sent — Demo</option>
            <option value="Rate Received">Rate Received</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Rate Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-3">Enquiry Reference</th>
                <th className="py-3.5 px-3">Freight Agent</th>
                <th className="py-3.5 px-3">Service & Route</th>
                <th className="py-3.5 px-3">Sent / Expected</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Cost Breakdown</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const hasRates = !!req.rateBreakdown;
                  const totalCost = hasRates
                    ? req.rateBreakdown!.baseFreightRate +
                      req.rateBreakdown!.fuelSurcharge +
                      req.rateBreakdown!.handlingCharge +
                      req.rateBreakdown!.customsDocCharge +
                      req.rateBreakdown!.otherCharges
                    : 0;

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-50/80 transition ${
                        req.id === queryHighlightId ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {/* Request ID */}
                      <td className="py-3.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                        {req.id}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {req.requestDate.split(' ')[0]}
                        </div>
                      </td>

                      {/* Linked Enquiry */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Link
                          href={`/enquiries/${req.enquiryId}`}
                          className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1"
                        >
                          {req.enquiryId} <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>

                      {/* Agent */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{req.agentCompany}</div>
                        <div className="text-[11px] text-slate-500">
                          {req.agentName} ({req.agentEmail})
                        </div>
                      </td>

                      {/* Service & Route */}
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <ServiceTypeBadge service={req.serviceType} />
                        <div className="text-[11px] text-slate-700 truncate mt-1">
                          {req.origin.split(',')[0]} → {req.destination.split(',')[0]}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                        <div>Sent: {req.sentDate ? req.sentDate.split(' ')[0] : 'Not sent'}</div>
                        <div className="text-slate-400">Due: {req.expectedResponseDate}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <RateRequestStatusBadge status={req.status} />
                      </td>

                      {/* Cost Breakdown Summary */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {hasRates ? (
                          <div>
                            <span className="font-extrabold text-sm text-emerald-600">
                              {formatCurrency(totalCost, req.rateBreakdown!.currency)}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Transit: {req.rateBreakdown!.transitTime}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No rate entered</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Email preview & Send Demo */}
                          {req.status === 'Ready to Send' || req.status === 'Draft' ? (
                            <button
                              onClick={() => setPreviewEmailReq(req)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Preview RFP and Send in Demo Mode"
                            >
                              <Mail className="w-3.5 h-3.5" /> Send (Demo)
                            </button>
                          ) : (
                            <button
                              onClick={() => setPreviewEmailReq(req)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              title="Preview Dispatched Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {/* Enter Rate / Edit Rate */}
                          <Link
                            href={`/rate-requests/${req.id}/rate`}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                              hasRates
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            {hasRates ? 'Review / Edit Rate' : 'Enter Rate'}
                          </Link>

                          {/* Convert to Quotation if rate received */}
                          {hasRates && (
                            <Link
                              href={`/quotations/new?enquiryId=${req.enquiryId}&rateRequestId=${req.id}`}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Generate Customer Quotation from this Rate"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No rate requests match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE RATE REQUEST MODAL */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Agent Rate Request (Carrier RFP)"
          subtitle="Solicit wholesale carrier spot rates for a verified customer enquiry"
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={!selectedEnquiryId || !selectedAgentId}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                Create Request & Preview Email →
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            {/* Step 1: Select Enquiry */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Select Customer Enquiry *
              </label>
              <select
                value={selectedEnquiryId}
                onChange={(e) => setSelectedEnquiryId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose verified enquiry --</option>
                {enquiries.map((enq) => (
                  <option key={enq.id} value={enq.id}>
                    {enq.id} — {enq.companyName} ({enq.serviceType}, {enq.origin} → {enq.destination})
                    {enq.verification.isVerified ? ' [✓ Verified]' : ' [⚠ Unverified]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Freight Agent */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Select Carrier / Freight Agent *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{agent.company}</span>
                          <span className="text-[10px] text-slate-500">({agent.name})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Services: {agent.services.join(', ')} • Coverage: {agent.coverage}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-amber-500 font-bold flex items-center justify-end text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                          {agent.rating}
                        </div>
                        <span className="text-[10px] text-slate-400">Avg {agent.responseTimeHours}h turnaround</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Expected Response Date */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Expected Response Deadline
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* PREVIEW REQUEST EMAIL MODAL */}
      {previewEmailReq && (
        <Modal
          isOpen={!!previewEmailReq}
          onClose={() => setPreviewEmailReq(null)}
          title="Agent Rate Request Email Preview"
          subtitle={`Simulated transmission to ${previewEmailReq.agentEmail} (${previewEmailReq.agentCompany})`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">
                ⚡ Demo Notification: No actual email is sent.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewEmailReq(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Close
                </button>
                {previewEmailReq.status !== 'Sent — Demo' && previewEmailReq.status !== 'Rate Received' && (
                  <button
                    onClick={() => {
                      markRateRequestSent(previewEmailReq.id);
                      setPreviewEmailReq(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Mark as Sent (Demo)
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">To:</span>{' '}
                <span className="font-bold text-slate-800">
                  {previewEmailReq.agentName} &lt;{previewEmailReq.agentEmail}&gt;
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject:</span>{' '}
                <span className="font-bold text-slate-900">
                  {previewEmailReq.demoEmailPreview?.subject ||
                    `Rate Request: ${previewEmailReq.serviceType} from ${previewEmailReq.origin} to ${previewEmailReq.destination} [${previewEmailReq.id}]`}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {previewEmailReq.demoEmailPreview?.body ||
                `Dear ${previewEmailReq.agentName},

Please provide your best freight rate and routing for the following shipment:
- Route: ${previewEmailReq.origin} -> ${previewEmailReq.destination}
- Service Type: ${previewEmailReq.serviceType}
- Target Response Date: ${previewEmailReq.expectedResponseDate}

Please break down base freight, fuel surcharges, handling fees, and validity.

Best regards,
Apex Global Logistics Operations`}
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 flex items-center justify-between">
              <span>Next step: After sending, you can manually enter the agent&apos;s received rate.</span>
              <Link
                href={`/rate-requests/${previewEmailReq.id}/rate`}
                onClick={() => setPreviewEmailReq(null)}
                className="text-blue-700 hover:text-blue-900 font-bold underline shrink-0 ml-2"
              >
                Go to Rate Entry →
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function RateRequestsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RateRequestsContent />
    </React.Suspense>
  );
}
