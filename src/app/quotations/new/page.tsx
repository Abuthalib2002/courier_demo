"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import { calculateQuotationAmounts, calculateTotalCost, formatCurrency } from '@/lib/calculations';
import { ServiceTypeBadge } from '@/components/ui/Badge';

function CreateQuotationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryEnquiryId = searchParams?.get('enquiryId') || '';
  const queryRateId = searchParams?.get('rateRequestId') || '';

  const {
    enquiries,
    rateRequests,
    settings,
    createQuotationFromRate,
    isLoaded,
  } = useAutomation();

  const [userSelectedEnquiryId, setUserSelectedEnquiryId] = useState('');
  const [userSelectedRateId, setUserSelectedRateId] = useState('');
  const [markupPercent, setMarkupPercent] = useState<number>(() => settings?.defaultMarkupPercent ?? 18);
  const [taxPercent, setTaxPercent] = useState<number>(() => settings?.defaultTaxPercent ?? 5);
  const [customValidityDays] = useState<number>(() => settings?.quotationValidityDays ?? 14);

  const selectedEnquiryId =
    userSelectedEnquiryId ||
    queryEnquiryId ||
    enquiries.find((e) => e.status === 'Rate Received')?.id ||
    enquiries.find((e) => e.verification.isVerified)?.id ||
    enquiries[0]?.id ||
    '';

  const availableRatesForEnquiry = useMemo(() => {
    return rateRequests.filter((r) => r.enquiryId === selectedEnquiryId && r.rateBreakdown);
  }, [rateRequests, selectedEnquiryId]);

  const selectedRateId =
    userSelectedRateId ||
    queryRateId ||
    availableRatesForEnquiry[0]?.id ||
    '';

  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];
  const matchedRate = rateRequests.find((r) => r.id === selectedRateId);

  const baseCost = useMemo(() => {
    return (
      matchedRate?.rateBreakdown || {
        baseFreightRate: 2200,
        fuelSurcharge: 300,
        handlingCharge: 150,
        customsDocCharge: 100,
        otherCharges: 50,
        currency: settings.defaultCurrency,
      }
    );
  }, [matchedRate, settings.defaultCurrency]);

  const calculations = useMemo(() => {
    return calculateQuotationAmounts({
      baseFreightRate: baseCost.baseFreightRate,
      fuelSurcharge: baseCost.fuelSurcharge,
      handlingCharge: baseCost.handlingCharge,
      customsDocCharge: baseCost.customsDocCharge,
      otherCharges: baseCost.otherCharges,
      markupPercent,
      taxPercent,
    });
  }, [baseCost, markupPercent, taxPercent]);

  if (!isLoaded || !selectedEnquiry) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote = createQuotationFromRate(
      selectedEnquiry.id,
      selectedRateId,
      markupPercent,
      taxPercent
    );

    if (newQuote) {
      router.push(`/quotations/${newQuote.id}`);
    } else {
      router.push('/quotations');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </Link>
      </div>

      <form onSubmit={handleCreateQuotation} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Prepare Commercial Quotation</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Convert received carrier tariffs into a customer proposal with customized margins and taxes.
          </p>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Select Enquiry */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Select Customer Enquiry *
            </label>
            <select
              value={selectedEnquiryId}
              onChange={(e) => setUserSelectedEnquiryId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {enquiries.map((enq) => (
                <option key={enq.id} value={enq.id}>
                  {enq.id} — {enq.companyName} ({enq.serviceType}: {enq.origin} → {enq.destination}) [{enq.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Enquiry Summary Pill */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">{selectedEnquiry.companyName}</span>
                <ServiceTypeBadge service={selectedEnquiry.serviceType} />
              </div>
              <p className="text-slate-600">
                Route: {selectedEnquiry.origin} → {selectedEnquiry.destination}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Specification: {selectedEnquiry.packageCount} pkgs • {selectedEnquiry.weightKg} kg • {selectedEnquiry.volumeCbm} CBM
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Client Email</span>
              <span className="font-semibold text-slate-800">{selectedEnquiry.email}</span>
            </div>
          </div>

          {/* Matched Carrier Rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                2. Carrier Cost Basis
              </label>
              {availableRatesForEnquiry.length > 1 && (
                <span className="text-[10px] text-blue-600 font-semibold">
                  {availableRatesForEnquiry.length} Carrier Rates Available
                </span>
              )}
            </div>

            {availableRatesForEnquiry.length > 1 && (
              <div className="mb-2">
                <select
                  value={selectedRateId}
                  onChange={(e) => setUserSelectedRateId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {availableRatesForEnquiry.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.id} — {rate.agentCompany} ({rate.agentName}) — {formatCurrency(rate.rateBreakdown ? calculateTotalCost(rate.rateBreakdown) : 0, rate.rateBreakdown?.currency || settings.defaultCurrency)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {matchedRate?.rateBreakdown ? (
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-emerald-950 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs">Linked RFP: {matchedRate.id}</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Agent: {matchedRate.agentCompany} ({matchedRate.agentName})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Cost</span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {formatCurrency(calculations.costs.totalCost, baseCost.currency || settings.defaultCurrency)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-amber-950 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs">Standard Tariff Applied</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    No custom RFP rate on file. Using default baseline forwarding rate.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-800">
                    {formatCurrency(calculations.costs.totalCost, settings.defaultCurrency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Markup & Taxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Selling Markup Margin (%) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(Number(e.target.value))}
                  className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-500 font-semibold text-xs">
                  = Selling Price: {formatCurrency(calculations.sellingPrice, settings.defaultCurrency)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Applicable Tax / VAT (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-500 font-semibold text-xs">
                  = Tax: {formatCurrency(calculations.taxAmount, settings.defaultCurrency)}
                </span>
              </div>
            </div>
          </div>

          {/* Grand Total Calculation Banner */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                Quotation Grand Total
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
                {formatCurrency(calculations.finalTotal, settings.defaultCurrency)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculated as Cost ({formatCurrency(calculations.costs.totalCost, settings.defaultCurrency)}) + {markupPercent}% Markup + {taxPercent}% Tax
              </p>
            </div>

            <div className="text-right text-xs text-slate-300">
              <span className="block text-slate-400">Validity Period</span>
              <span className="font-bold">{customValidityDays} Days</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/quotations"
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shadow-blue-500/25 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Generate &amp; Review Quotation Sheet →
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateQuotationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateQuotationContent />
    </React.Suspense>
  );
}
