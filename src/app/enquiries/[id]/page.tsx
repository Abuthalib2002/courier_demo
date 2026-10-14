"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Scale,
  Box,
  Clock,
  CheckSquare,
  Send,
  FileText,
  History,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import {
  EnquiryStatusBadge,
  ServiceTypeBadge,
  VerificationItemBadge,
  RateRequestStatusBadge,
  QuotationStatusBadge,
} from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/calculations';
import Modal from '@/components/ui/Modal';

function EnquiryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    enquiries,
    rateRequests,
    quotations,
    sendAcknowledgement,
    updateEnquiry,
    isLoaded,
  } = useAutomation();

  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'rates' | 'quotes' | 'history'>('overview');
  const [showAckModal, setShowAckModal] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  const enquiry = enquiries.find((e) => e.id === id);
  const linkedRateRequests = rateRequests.filter((r) => r.enquiryId === id);
  const linkedQuotations = quotations.filter((q) => q.enquiryId === id);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Enquiry File Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enquiry ID &quot;{id}&quot; does not exist or has been removed.
        </p>
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Enquiries List
        </Link>
      </div>
    );
  }

  const handleSaveNotes = () => {
    updateEnquiry(enquiry.id, { notes: notesDraft });
    setIsEditingNotes(false);
  };

  const checklistItems = [
    { label: 'Customer Contact Details', state: enquiry.verification.contactDetails },
    { label: 'Service Type Selection', state: enquiry.verification.serviceType },
    { label: 'Origin & Destination Ports/Cities', state: enquiry.verification.originDestination },
    { label: 'Detailed Cargo Description', state: enquiry.verification.cargoDescription },
    { label: 'Package Quantity', state: enquiry.verification.packageQuantity },
    { label: 'Gross Weight & Cubic Volume', state: enquiry.verification.weightVolume },
    { label: 'Shipment Ready Date', state: enquiry.verification.readyDate },
    { label: 'Delivery Requirements & Timeline', state: enquiry.verification.deliveryRequirements },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Enquiries
        </Link>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {!enquiry.acknowledgementSent ? (
            <button
              onClick={() => setShowAckModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold border border-blue-200 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Prepare Acknowledgement (Demo)
            </button>
          ) : (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledgement Sent
            </span>
          )}

          <Link
            href={`/verification/${enquiry.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-semibold transition"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Verify Information
          </Link>

          {enquiry.verification.isVerified && (
            <Link
              href={`/rate-requests?createFor=${enquiry.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              Request Agent Rates
            </Link>
          )}

          {enquiry.status === 'Rate Received' && (
            <Link
              href={`/quotations/new?enquiryId=${enquiry.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Prepare Quotation
            </Link>
          )}
        </div>
      </div>

      {/* Main File Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-base font-extrabold text-blue-600">{enquiry.id}</span>
              <ServiceTypeBadge service={enquiry.serviceType} />
              <EnquiryStatusBadge status={enquiry.status} />
              {enquiry.verification.isVerified && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                  ✓ Verified Ready
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {enquiry.companyName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact: {enquiry.contactPerson} • Registered: {enquiry.receivedDate} • Assigned to: {enquiry.assignedEmployee}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Origin
              </span>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]" title={enquiry.origin}>
                {enquiry.origin}
              </p>
            </div>
            <div className="text-slate-300 font-light text-xl">→</div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Destination
              </span>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]" title={enquiry.destination}>
                {enquiry.destination}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs font-semibold">
          {[
            { key: 'overview', label: 'Overview & Cargo' },
            { key: 'verification', label: `Verification Checklist (${checklistItems.filter(i => i.state === 'complete').length}/8)` },
            { key: 'rates', label: `Rate Requests (${linkedRateRequests.length})` },
            { key: 'quotes', label: `Quotations (${linkedQuotations.length})` },
            { key: 'history', label: `Audit Trail (${enquiry.activityHistory.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & CARGO */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2 Cols: Cargo & Route Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cargo Specifications
              </h3>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Commodity Description:</span>
                {enquiry.cargoDescription}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Box className="w-4 h-4 text-blue-500" /> Packages
                  </div>
                  <p className="text-lg font-bold text-slate-900">{enquiry.packageCount} Units</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Scale className="w-4 h-4 text-emerald-500" /> Gross Weight
                  </div>
                  <p className="text-lg font-bold text-slate-900">{enquiry.weightKg} kg</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Layers className="w-4 h-4 text-purple-500" /> Total Volume
                  </div>
                  <p className="text-lg font-bold text-slate-900">{enquiry.volumeCbm} CBM</p>
                </div>
              </div>

              {/* Transit & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Shipment Ready Date
                    </span>
                    <span className="font-semibold text-slate-800">{enquiry.readyDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Target Delivery Date
                    </span>
                    <span className="font-semibold text-slate-800">{enquiry.deliveryDate}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section with Editable toggle */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Operational Notes & Handling Instructions
                  </h4>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => {
                        setNotesDraft(enquiry.notes || '');
                        setIsEditingNotes(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit Notes
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingNotes ? (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {enquiry.notes || 'No special operational instructions noted.'}
                  </p>
                ) : (
                  <textarea
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 1 Col: Customer Contact Card & Quick Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Customer Dossier
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Company</span>
                  <p className="font-bold text-slate-900">{enquiry.companyName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contact Person</span>
                  <p className="font-semibold text-slate-800">{enquiry.contactPerson}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email Address</span>
                  <a href={`mailto:${enquiry.email}`} className="text-blue-600 hover:underline">
                    {enquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Telephone</span>
                  <p className="text-slate-800">{enquiry.phone}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assigned Officer</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{enquiry.assignedEmployee}</p>
              </div>
            </div>

            {/* Quick Next Stage Card */}
            <div className="bg-blue-50/60 rounded-2xl border border-blue-200/80 p-5 space-y-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Recommended Next Action
              </span>
              {enquiry.status === 'New' && (
                <div>
                  <p className="text-xs text-blue-900 font-semibold">1. Send Customer Acknowledgement</p>
                  <p className="text-[11px] text-blue-700 mt-1">
                    Formalize receipt of this new enquiry before verifying shipment details.
                  </p>
                  <button
                    onClick={() => setShowAckModal(true)}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Draft Acknowledgement (Demo)
                  </button>
                </div>
              )}

              {enquiry.status === 'Awaiting Information' && (
                <div>
                  <p className="text-xs text-amber-900 font-semibold">2. Clarify Missing Information</p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Missing specifications must be supplied by the customer before carrier rate requests.
                  </p>
                  <Link
                    href={`/verification/${enquiry.id}`}
                    className="mt-3 block text-center w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Open Verification & Clarification
                  </Link>
                </div>
              )}

              {enquiry.status === 'Verified' && (
                <div>
                  <p className="text-xs text-emerald-900 font-semibold">3. Solicit Freight Agent Rates</p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Information verified. Dispatch RFPs to carrier partners for competitive spot rates.
                  </p>
                  <Link
                    href={`/rate-requests?createFor=${enquiry.id}`}
                    className="mt-3 block text-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Create Agent Rate Request
                  </Link>
                </div>
              )}

              {enquiry.status === 'Rate Received' && (
                <div>
                  <p className="text-xs text-indigo-900 font-semibold">4. Compile Customer Quotation</p>
                  <p className="text-[11px] text-indigo-700 mt-1">
                    Carrier rate received. Apply markup and generate final commercial proposal.
                  </p>
                  <Link
                    href={`/quotations/new?enquiryId=${enquiry.id}`}
                    className="mt-3 block text-center w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Prepare Customer Quotation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION CHECKLIST */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Information Quality Control Checklist</h3>
              <p className="text-xs text-slate-500">
                All 8 mandatory verification items must be confirmed before requesting agent rates.
              </p>
            </div>
            <Link
              href={`/verification/${enquiry.id}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Open Full Verification Screen
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                </div>
                <VerificationItemBadge state={item.state} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AGENT RATE REQUESTS */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Carrier & Freight Agent Solicitations</h3>
              <p className="text-xs text-slate-500">Spot rate requests dispatched to agents for this enquiry.</p>
            </div>
            <Link
              href={`/rate-requests?createFor=${enquiry.id}`}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
            >
              + Solicit Agent Rate
            </Link>
          </div>

          {linkedRateRequests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {linkedRateRequests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">{req.id}</span>
                      <RateRequestStatusBadge status={req.status} />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm mt-1">{req.agentCompany}</p>
                    <p className="text-slate-500 text-[11px]">
                      Agent: {req.agentName} ({req.agentEmail}) • Requested: {req.requestDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {req.rateBreakdown ? (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Cost</span>
                        <span className="text-base font-bold text-emerald-600">
                          {formatCurrency(
                            req.rateBreakdown.baseFreightRate +
                            req.rateBreakdown.fuelSurcharge +
                            req.rateBreakdown.handlingCharge +
                            req.rateBreakdown.customsDocCharge +
                            req.rateBreakdown.otherCharges,
                            req.rateBreakdown.currency
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Awaiting rate response</span>
                    )}

                    <Link
                      href={`/rate-requests?id=${req.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                    >
                      View Request
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No agent rate requests created yet for this enquiry.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: QUOTATIONS */}
      {activeTab === 'quotes' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Commercial Quotations</h3>
              <p className="text-xs text-slate-500">Official proposals generated for the customer.</p>
            </div>
            <Link
              href={`/quotations/new?enquiryId=${enquiry.id}`}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
            >
              + Prepare New Quotation
            </Link>
          </div>

          {linkedQuotations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {linkedQuotations.map((quote) => (
                <div key={quote.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">{quote.id}</span>
                      <QuotationStatusBadge status={quote.status} />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Created: {quote.createdDate} • Valid Until: {quote.validUntil}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Grand Total</span>
                      <span className="text-base font-extrabold text-blue-600">
                        {formatCurrency(quote.finalTotal, quote.currency)}
                      </span>
                    </div>

                    <Link
                      href={`/quotations/${quote.id}`}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
                    >
                      Open Quotation Sheet
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No quotations prepared yet for this enquiry.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Audit Trail History</h3>
          <div className="space-y-3">
            {enquiry.activityHistory.map((item, idx) => (
              <div key={item.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{item.action}</span>
                  <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                </div>
                <p className="text-slate-600">{item.details}</p>
                <p className="text-[10px] text-slate-400 mt-1">Logged by: {item.user}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledgement Email Preview Modal */}
      {showAckModal && (
        <Modal
          isOpen={showAckModal}
          onClose={() => setShowAckModal(false)}
          title="Customer Acknowledgement Email Preview"
          subtitle={`Simulated transmission to ${enquiry.email}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">
                ⚡ Demo Mode: No actual emails are sent.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAckModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendAcknowledgement(enquiry.id);
                    setShowAckModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Confirm & Dispatch (Demo)
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div>
                <span className="text-slate-400 font-semibold">To:</span>{' '}
                <span className="text-slate-800 font-medium">{enquiry.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject:</span>{' '}
                <span className="text-slate-900 font-bold">
                  Enquiry Received: {enquiry.serviceType} from {enquiry.origin} to {enquiry.destination} [{enquiry.id}]
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-3 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
              {`Dear ${enquiry.customerName},

Thank you for contacting Apex Global Logistics. We have successfully registered your shipping enquiry under reference number: ${enquiry.id}.

Consignment Summary:
- Service Type: ${enquiry.serviceType}
- Route: ${enquiry.origin} -> ${enquiry.destination}
- Cargo: ${enquiry.cargoDescription}
- Packages: ${enquiry.packageCount} units | Weight: ${enquiry.weightKg} kg | Volume: ${enquiry.volumeCbm} CBM
- Shipment Ready Date: ${enquiry.readyDate}

Our pricing and operations team is currently reviewing your specifications and securing competitive carrier tariffs. You will receive an official quotation shortly.

Best regards,
${enquiry.assignedEmployee}
Apex Global Logistics Operations Desk`}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function EnquiryDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EnquiryDetailContent />
    </React.Suspense>
  );
}
