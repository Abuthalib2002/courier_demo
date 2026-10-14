"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Send,
  CheckCircle2,
  XCircle,
  FileCheck,
  Ship,
  Mail,
  Phone,
  Globe,
  Building,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import { formatCurrency } from '@/lib/calculations';
import { QuotationStatusBadge, ServiceTypeBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

function QuotationProposalSheetContent() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params?.id as string;

  const {
    quotations,
    settings,
    approveQuotationDemo,
    sendQuotationDemo,
    recordCustomerDecision,
    isLoaded,
  } = useAutomation();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [decisionModal, setDecisionModal] = useState<'Accepted' | 'Rejected' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const quotation = quotations.find((q) => q.id === quoteId);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Quotation Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">ID &quot;{quoteId}&quot; does not exist.</p>
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmDecision = () => {
    if (!decisionModal) return;
    recordCustomerDecision(quotation.id, decisionModal, decisionNotes);
    setDecisionModal(null);
    setDecisionNotes('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Controls (Hidden when printed) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print / Save PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print / Save as PDF
          </button>

          {/* Approve Demo Button */}
          {(quotation.status === 'Draft' || quotation.status === 'Ready for Review') && (
            <button
              onClick={() => approveQuotationDemo(quotation.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Quotation (Demo)
            </button>
          )}

          {/* Send to Client Demo Button */}
          {quotation.status === 'Approved — Demo' && (
            <button
              onClick={() => setShowEmailModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Send className="w-4 h-4" />
              Send to Customer (Demo)
            </button>
          )}

          {/* Accept / Reject Customer Decisions */}
          {quotation.status === 'Sent — Demo' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setDecisionModal('Accepted');
                  setDecisionNotes('Customer officially confirmed acceptance and requested booking.');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Customer Accepted
              </button>
              <button
                onClick={() => {
                  setDecisionModal('Rejected');
                  setDecisionNotes('Customer declined offer due to schedule or alternative carrier choice.');
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Customer Rejected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert Banner (Hidden on Print) */}
      <div className="no-print p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <QuotationStatusBadge status={quotation.status} />
          <span className="text-slate-600">
            Linked to Enquiry:{' '}
            <Link href={`/enquiries/${quotation.enquiryId}`} className="font-bold text-blue-600 hover:underline">
              {quotation.enquiryId}
            </Link>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          {quotation.approvedBy && <span>Signed Off: {quotation.approvedBy}</span>}
          {quotation.sentDate && <span>Sent: {quotation.sentDate}</span>}
          {quotation.customerDecisionDate && (
            <span className="font-bold text-slate-800">
              Customer Decision on {quotation.customerDecisionDate}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMAL BUSINESS QUOTATION SHEET (PRINT READY) */}
      {/* ========================================================================= */}
      <div className="print-area bg-white rounded-2xl border border-slate-200/90 shadow-lg p-8 sm:p-12 space-y-8 text-slate-800 font-sans">
        {/* Header: Company Logo & Details + Quotation Title & Reference */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                <Ship className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {settings.companyName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">International Freight &amp; Logistics Automation</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-600 space-y-0.5 leading-relaxed">
              <p>{settings.companyAddress}</p>
              <p>Email: {settings.companyEmail} • Phone: {settings.companyPhone}</p>
              <p>Web: {settings.companyWebsite} • Tax TRN: {settings.taxRegistrationNumber}</p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="inline-block px-3 py-1 bg-slate-100 font-extrabold uppercase text-xs tracking-wider text-slate-700 rounded-md mb-2">
              Commercial Freight Quotation
            </span>
            <div className="text-2xl font-black text-blue-900 tracking-tight">{quotation.id}</div>
            <div className="text-xs text-slate-500 space-y-0.5 mt-2">
              <p>Date Issued: <span className="font-semibold text-slate-800">{quotation.createdDate}</span></p>
              <p>Valid Until: <span className="font-bold text-rose-600">{quotation.validUntil}</span></p>
              <p>Enquiry Reference: <span className="font-semibold text-slate-800">{quotation.enquiryId}</span></p>
            </div>
          </div>
        </div>

        {/* Customer & Route Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Customer / Consignee
            </h3>
            <p className="font-bold text-base text-slate-900">{quotation.companyName}</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Attn: {quotation.contactPerson}</p>
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              <p>Email: {quotation.customerEmail}</p>
              <p>Phone: {quotation.customerPhone}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Routing &amp; Service Modality
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Service Mode:</span>
                <span className="font-bold text-blue-900">{quotation.serviceType}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Origin Port / City:</span>
                  <span className="font-bold text-slate-900">{quotation.origin}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Destination Port / City:</span>
                  <span className="font-bold text-slate-900">{quotation.destination}</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Estimated Transit Time:</span>
                <span className="font-bold text-emerald-700">{quotation.transitTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cargo Specification Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Shipment Specifications
          </h3>
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Commodity Description</span>
              <p className="font-semibold text-slate-900 mt-0.5">{quotation.cargoDescription}</p>
            </div>

            <div className="flex items-center gap-6 text-xs shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pieces</span>
                <span className="font-bold text-slate-900">{quotation.packageCount} pkgs</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                <span className="font-bold text-slate-900">{quotation.weightKg} kg</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Volume</span>
                <span className="font-bold text-slate-900">{quotation.volumeCbm} CBM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Itemized Freight Charges &amp; Services
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Line Item / Description</th>
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-4 text-right">Amount ({quotation.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Base Freight Tariff ({quotation.serviceType})
                    <span className="block text-[11px] text-slate-400 font-normal">
                      Linehaul port/airport transit routing
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Consignment</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(quotation.costs.baseFreightRate, quotation.currency)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Bunker Adjustment Factor / Fuel Surcharge (BAF/FSC)
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Consignment</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(quotation.costs.fuelSurcharge, quotation.currency)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Terminal Handling Charge (THC) &amp; Port Security
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Origin/Dest</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(quotation.costs.handlingCharge, quotation.currency)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Export / Import Customs Formalities &amp; Documentation
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Standard Doc</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(quotation.costs.customsDocCharge, quotation.currency)}
                  </td>
                </tr>

                {quotation.costs.otherCharges > 0 && (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Special Handling &amp; Auxiliary Carrier Surcharges
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">Special</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(quotation.costs.otherCharges, quotation.currency)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary Calculation Totals */}
        <div className="flex flex-col sm:flex-row justify-end">
          <div className="w-full sm:w-80 space-y-2.5 text-xs text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span>Carrier Subtotal:</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(quotation.costs.totalCost, quotation.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-blue-900 font-semibold">
              <span>Commercial Selling Price:</span>
              <span>{formatCurrency(quotation.sellingPrice, quotation.currency)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Applicable VAT / Tax ({quotation.taxPercent}%):</span>
              <span>{formatCurrency(quotation.taxAmount, quotation.currency)}</span>
            </div>

            <div className="pt-3 border-t-2 border-slate-300 flex items-center justify-between text-slate-900">
              <span className="font-extrabold text-sm uppercase">Total Payable:</span>
              <span className="font-black text-xl text-blue-950">
                {formatCurrency(quotation.finalTotal, quotation.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Standard Terms and Conditions */}
        <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Terms &amp; Conditions
          </h4>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
            {quotation.termsAndConditions}
          </div>
        </div>

        {/* Formal Signatures Section */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-300 pb-1 mb-2">
              <span className="font-serif italic text-base text-slate-800">
                {quotation.approvedBy || 'Sarah Jenkins'}
              </span>
            </div>
            <p className="font-bold text-slate-900">Authorized Forwarder Signatory</p>
            <p className="text-[11px] text-slate-400">Apex Global Logistics Operations Directorate</p>
          </div>

          <div>
            <div className="border-b border-slate-300 pb-1 mb-2">
              <span className="font-serif italic text-base text-slate-800">
                {quotation.customerDecisionNotes ? quotation.customerName : ''}
              </span>
            </div>
            <p className="font-bold text-slate-900">Client Acceptance Signature</p>
            <p className="text-[11px] text-slate-400">Date &amp; Company Stamp</p>
          </div>
        </div>
      </div>

      {/* DISPATCH CUSTOMER EMAIL PREVIEW MODAL */}
      {showEmailModal && (
        <Modal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title="Customer Quotation Dispatch Preview"
          subtitle={`Simulated transmission to ${quotation.customerEmail}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">
                ✨ Demo Mode: No real emails will leave the system.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendQuotationDemo(quotation.id);
                    setShowEmailModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Proposal (Demo)
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">To:</span>{' '}
                <span className="font-bold text-slate-900">{quotation.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject:</span>{' '}
                <span className="font-bold text-slate-900">
                  Freight Quotation {quotation.id}: {quotation.serviceType} from {quotation.origin} to {quotation.destination}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {`Dear ${quotation.customerName},

Thank you for requesting shipping rates from Apex Global Logistics.

We are pleased to enclose quotation ${quotation.id} for your consignment:
- Route: ${quotation.origin} to ${quotation.destination}
- Service Mode: ${quotation.serviceType}
- Total Price: ${formatCurrency(quotation.finalTotal, quotation.currency)}
- Transit Time: ${quotation.transitTime}
- Validity: ${quotation.validUntil}

Please let us know if you wish to confirm the booking.

Best regards,
Commercial Pricing Team
Apex Global Logistics`}
            </div>
          </div>
        </Modal>
      )}

      {/* RECORD CUSTOMER DECISION MODAL */}
      {decisionModal && (
        <Modal
          isOpen={!!decisionModal}
          onClose={() => setDecisionModal(null)}
          title={`Confirm Customer Decision: ${decisionModal}`}
          subtitle={`Quotation ${quotation.id} • ${quotation.companyName}`}
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
                  decisionModal === 'Accepted'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-xs'
                }`}
              >
                Save {decisionModal} Decision
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Record the client&apos;s confirmation or feedback notes for this commercial proposal:
            </p>
            <textarea
              rows={3}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Enter customer feedback notes..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function QuotationProposalSheetPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuotationProposalSheetContent />
    </React.Suspense>
  );
}
