"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  Sparkles,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import {
  QuotationStatusBadge,
  ServiceTypeBadge,
} from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/calculations';
import { Quotation, QuotationStatus } from '@/types';
import Modal from '@/components/ui/Modal';

function QuotationsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || 'All';

  const {
    quotations,
    enquiries,
    approveQuotationDemo,
    sendQuotationDemo,
    recordCustomerDecision,
    isLoaded,
  } = useAutomation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    quote: Quotation;
    type: 'Accepted' | 'Rejected';
  } | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Email Preview Modal State
  const [previewEmailQuote, setPreviewEmailQuote] = useState<Quotation | null>(null);

  const filteredQuotes = useMemo(() => {
    return quotations.filter((q) => {
      const matchSearch =
        search.trim() === '' ||
        q.id.toLowerCase().includes(search.toLowerCase()) ||
        q.enquiryId.toLowerCase().includes(search.toLowerCase()) ||
        q.customerName.toLowerCase().includes(search.toLowerCase()) ||
        q.companyName.toLowerCase().includes(search.toLowerCase()) ||
        q.origin.toLowerCase().includes(search.toLowerCase()) ||
        q.destination.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotations, search, statusFilter]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleConfirmDecision = () => {
    if (!decisionModal) return;
    recordCustomerDecision(decisionModal.quote.id, decisionModal.type, decisionNotes);
    setDecisionModal(null);
    setDecisionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Commercial Quotations Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage customer proposals, approvals, client transmissions, and final acceptance outcomes.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs shadow-blue-500/20 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Quotation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotations by Quote ID, Enquiry ID, Customer, or Route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="w-full sm:w-52 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition text-slate-700"
          >
            <option value="All">All Quotations ({quotations.length})</option>
            <option value="Draft">Draft</option>
            <option value="Ready for Review">Ready for Review</option>
            <option value="Approved — Demo">Approved — Demo</option>
            <option value="Sent — Demo">Sent — Demo</option>
            <option value="Accepted">Accepted by Client</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Quotations Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Quote ID</th>
                <th className="py-3.5 px-3">Enquiry Ref</th>
                <th className="py-3.5 px-3">Customer & Company</th>
                <th className="py-3.5 px-3">Service & Route</th>
                <th className="py-3.5 px-3">Cost Basis</th>
                <th className="py-3.5 px-3">Selling Price</th>
                <th className="py-3.5 px-3">Grand Total</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/70 transition group">
                    {/* Quote ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/quotations/${quote.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {quote.id}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Created: {quote.createdDate}
                      </div>
                    </td>

                    {/* Enquiry Link */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Link
                        href={`/enquiries/${quote.enquiryId}`}
                        className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                      >
                        {quote.enquiryId} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{quote.companyName}</div>
                      <div className="text-[11px] text-slate-500">{quote.customerName}</div>
                    </td>

                    {/* Service & Route */}
                    <td className="py-3.5 px-3 max-w-[160px]">
                      <ServiceTypeBadge service={quote.serviceType} />
                      <div className="text-[11px] text-slate-700 truncate mt-1">
                        {quote.origin.split(',')[0]} → {quote.destination.split(',')[0]}
                      </div>
                    </td>

                    {/* Cost Basis */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {formatCurrency(quote.costs.totalCost, quote.currency)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(quote.sellingPrice, quote.currency)}
                      </div>
                      <span className="text-[10px] text-blue-600 font-medium">
                        +{quote.markupPercent}% margin
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-extrabold text-sm text-blue-700">
                        {formatCurrency(quote.finalTotal, quote.currency)}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Valid: {quote.validUntil}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <QuotationStatusBadge status={quote.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Open Proposal Sheet */}
                        <Link
                          href={`/quotations/${quote.id}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                        </Link>

                        {/* Approve Button (Demo) */}
                        {quote.status === 'Draft' || quote.status === 'Ready for Review' ? (
                          <button
                            onClick={() => approveQuotationDemo(quote.id)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="Sign-off & Approve Quotation in Demo Mode"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        ) : null}

                        {/* Send Button (Demo) */}
                        {quote.status === 'Approved — Demo' ? (
                          <button
                            onClick={() => setPreviewEmailQuote(quote)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="Preview and Send to Customer (Demo)"
                          >
                            <Send className="w-3.5 h-3.5" /> Send (Demo)
                          </button>
                        ) : null}

                        {/* Record Accept / Reject */}
                        {quote.status === 'Sent — Demo' ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setDecisionModal({ quote, type: 'Accepted' });
                                setDecisionNotes('Customer formally accepted offer.');
                              }}
                              className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold transition"
                              title="Customer Accepts"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setDecisionModal({ quote, type: 'Rejected' });
                                setDecisionNotes('Customer selected competitor or alternative routing.');
                              }}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                              title="Customer Rejects"
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER EMAIL PREVIEW & SEND MODAL */}
      {previewEmailQuote && (
        <Modal
          isOpen={!!previewEmailQuote}
          onClose={() => setPreviewEmailQuote(null)}
          title="Customer Quotation Email Transmission"
          subtitle={`Simulated dispatch to ${previewEmailQuote.customerEmail}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">
                🚀 Demo Mode: No real emails are sent to clients.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewEmailQuote(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendQuotationDemo(previewEmailQuote.id);
                    setPreviewEmailQuote(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Quotation to Client (Demo)
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">To:</span>{' '}
                <span className="font-bold text-slate-900">{previewEmailQuote.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject:</span>{' '}
                <span className="font-bold text-slate-900">
                  Freight Quotation {previewEmailQuote.id}: {previewEmailQuote.serviceType} from {previewEmailQuote.origin} to {previewEmailQuote.destination}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {`Dear ${previewEmailQuote.customerName},

We are pleased to provide you with our official freight quotation for your upcoming consignment:

Quotation Reference: ${previewEmailQuote.id}
Customer Reference: ${previewEmailQuote.companyName}
Route: ${previewEmailQuote.origin} -> ${previewEmailQuote.destination}
Service Mode: ${previewEmailQuote.serviceType}
Transit Time Estimate: ${previewEmailQuote.transitTime}

Grand Total: ${formatCurrency(previewEmailQuote.finalTotal, previewEmailQuote.currency)} (Inclusive of applicable taxes)
Rate Validity: Valid until ${previewEmailQuote.validUntil}

Please find the itemized commercial proposal attached. To confirm booking or ask any questions, please reply directly to this notice.

Best regards,
Apex Global Logistics Commercial Team`}
            </div>
          </div>
        </Modal>
      )}

      {/* RECORD CUSTOMER DECISION MODAL */}
      {decisionModal && (
        <Modal
          isOpen={!!decisionModal}
          onClose={() => setDecisionModal(null)}
          title={`Record Customer Decision: ${decisionModal.type}`}
          subtitle={`Quotation ${decisionModal.quote.id} (${decisionModal.quote.companyName})`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition ${
                  decisionModal.type === 'Accepted'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-500/25'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-xs shadow-rose-500/25'
                }`}
              >
                Confirm {decisionModal.type} Decision
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Record the client&apos;s feedback. This will advance the workflow stage to{' '}
              <span className="font-bold">{decisionModal.type}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Reason / Booking Notes:
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter client comments, booking reference, or competitor price feedback..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuotationsContent />
    </React.Suspense>
  );
}
