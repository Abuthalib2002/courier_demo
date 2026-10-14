"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import { VerificationChecklist, VerificationState } from '@/types';
import { isVerificationReadyForRates } from '@/lib/validation';
import { EnquiryStatusBadge, ServiceTypeBadge, VerificationItemBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

function VerificationContent({ initialEnquiryId }: { initialEnquiryId?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryEnquiryId = initialEnquiryId || searchParams?.get('enquiryId') || '';

  const { enquiries, updateVerification, isLoaded } = useAutomation();

  const [selectedId, setSelectedId] = useState<string>('');
  const [internalNote, setInternalNote] = useState('');
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationDraft, setClarificationDraft] = useState('');

  const activeId =
    selectedId ||
    queryEnquiryId ||
    enquiries.find((e) => e.status === 'Awaiting Information')?.id ||
    enquiries.find((e) => e.status === 'New')?.id ||
    enquiries[0]?.id ||
    '';

  const activeEnquiry = enquiries.find((e) => e.id === activeId) || enquiries[0];
  const checklist = activeEnquiry?.verification;

  if (!isLoaded || !activeEnquiry || !checklist) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Verification readiness check
  const readiness = isVerificationReadyForRates(checklist);

  const handleStateChange = (field: keyof VerificationChecklist, newState: VerificationState) => {
    updateVerification(activeEnquiry.id, { [field]: newState, notes: internalNote }, false);
  };

  const handleSaveNotes = () => {
    updateVerification(activeEnquiry.id, { notes: internalNote }, false);
  };

  const handleMarkAllComplete = () => {
    const allComplete: Partial<VerificationChecklist> = {
      contactDetails: 'complete',
      serviceType: 'complete',
      originDestination: 'complete',
      cargoDescription: 'complete',
      packageQuantity: 'complete',
      weightVolume: 'complete',
      readyDate: 'complete',
      deliveryRequirements: 'complete',
      notes: internalNote || 'All items manually checked and verified by operator.',
    };
    updateVerification(activeEnquiry.id, allComplete, false);
  };

  const handleConfirmReadyForRates = () => {
    if (!readiness.isReady) return;
    updateVerification(activeEnquiry.id, { notes: internalNote }, true);
    router.push(`/rate-requests?createFor=${activeEnquiry.id}`);
  };

  const handleOpenClarificationModal = () => {
    if (!clarificationDraft) {
      setClarificationDraft(
        activeEnquiry.verification.clarificationMessage ||
          `Dear ${activeEnquiry.customerName},\n\nThank you for choosing Apex Global Logistics for your shipping enquiry ${activeEnquiry.id}.\n\nBefore we can obtain the most competitive spot rates from our carriers, please provide clarification on the following mandatory details:\n- Exact package dimensions and gross weight (kg)\n- Confirmation of delivery site unloading equipment availability\n\nPlease let us know at your earliest convenience so we can proceed immediately.\n\nBest regards,\n${activeEnquiry.assignedEmployee}\nApex Global Logistics`
      );
    }
    setShowClarificationModal(true);
  };

  const handleSendClarificationDemo = () => {
    updateVerification(
      activeEnquiry.id,
      {
        clarificationMessage: clarificationDraft,
        notes: internalNote,
      },
      false
    );
    setShowClarificationModal(false);
  };

  // 8 Mandatory Verification Fields
  const verificationFields: {
    key: keyof VerificationChecklist;
    title: string;
    description: string;
    currentValue: string;
  }[] = [
    {
      key: 'contactDetails',
      title: '1. Customer Contact Details',
      description: 'Verified business email, contact person name, and valid direct dial phone number.',
      currentValue: `${activeEnquiry.customerName} (${activeEnquiry.email}, ${activeEnquiry.phone})`,
    },
    {
      key: 'serviceType',
      title: '2. Service Type Selection',
      description: 'Modal carrier mode confirmed (Air Freight, Sea Freight, Road Freight, or Courier).',
      currentValue: activeEnquiry.serviceType,
    },
    {
      key: 'originDestination',
      title: '3. Origin & Destination Locations',
      description: 'Accurate departure and destination port/city, terminal codes, or postal zones.',
      currentValue: `${activeEnquiry.origin} → ${activeEnquiry.destination}`,
    },
    {
      key: 'cargoDescription',
      title: '4. Cargo Description & Nature',
      description: 'Commodity type, classification, dangerous goods declaration, or special fragility notes.',
      currentValue: activeEnquiry.cargoDescription || 'No description provided',
    },
    {
      key: 'packageQuantity',
      title: '5. Package Quantity & Packing Type',
      description: 'Explicit piece count, pallet count, cartons, or crates.',
      currentValue:
        activeEnquiry.packageCount > 0
          ? `${activeEnquiry.packageCount} Packages / Units`
          : 'MISSING: No package count specified',
    },
    {
      key: 'weightVolume',
      title: '6. Gross Weight & Cubic Volume (CBM)',
      description: 'Accurate scale gross weight (kg) and total dimensional volume (m³).',
      currentValue:
        activeEnquiry.weightKg > 0 && activeEnquiry.volumeCbm > 0
          ? `${activeEnquiry.weightKg} kg | ${activeEnquiry.volumeCbm} CBM`
          : 'MISSING: Weight or volume is 0 or unassigned',
    },
    {
      key: 'readyDate',
      title: '7. Shipment Ready Date',
      description: 'Date cargo is manufactured, packed, and available for carrier collection/gate-in.',
      currentValue: activeEnquiry.readyDate || 'MISSING: Ready date not specified',
    },
    {
      key: 'deliveryRequirements',
      title: '8. Delivery Timeline & Requirements',
      description: 'Target consignee arrival date, liftgate requirement, temperature control, or customs readiness.',
      currentValue: `Target: ${activeEnquiry.deliveryDate || 'Not specified'}${
        activeEnquiry.notes ? ` (Notes: ${activeEnquiry.notes})` : ''
      }`,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <CheckSquare className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Core Quality Control Stage
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Information Verification Checklist
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Strictly validate all 8 mandatory data parameters before soliciting freight agent tariffs.
            </p>
          </div>

          {/* Quick Selector Dropdown */}
          <div className="w-full md:w-80">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Enquiry to Verify:
            </label>
            <select
              value={activeId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                router.push(`/verification?enquiryId=${e.target.value}`);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              {enquiries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.companyName} ({e.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Enquiry Dossier Strip */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-bold text-blue-600">{activeEnquiry.id}</span>
            <span className="font-semibold text-slate-900">{activeEnquiry.companyName}</span>
            <ServiceTypeBadge service={activeEnquiry.serviceType} />
            <EnquiryStatusBadge status={activeEnquiry.status} />
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>
              {activeEnquiry.origin.split(',')[0]} → {activeEnquiry.destination.split(',')[0]}
            </span>
            <span>•</span>
            <Link
              href={`/enquiries/${activeEnquiry.id}`}
              className="text-blue-600 hover:underline font-semibold"
            >
              View Full File →
            </Link>
          </div>
        </div>
      </div>

      {/* READINESS STATUS BANNER */}
      {!readiness.isReady ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Mandatory Shipment Information Incomplete ({readiness.missingItems.length + readiness.clarificationItems.length} items flagged)
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Agent Rate Requests are disabled until all items are marked Complete. Outstanding items:{' '}
                <span className="font-semibold underline">
                  {[...readiness.missingItems, ...readiness.clarificationItems].join(', ')}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenClarificationModal}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              Prepare Clarification Message
            </button>
            <button
              onClick={handleMarkAllComplete}
              className="px-3.5 py-2 bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-800 rounded-xl text-xs font-semibold transition"
              title="Quick demo override: set all 8 items to Complete"
            >
              Mark All Complete (Demo)
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                All 8 Verification Criteria Satisfied!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                This enquiry is fully qualified and ready for freight agent rate solicitation.
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmReadyForRates}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shadow-emerald-500/25 transition flex items-center gap-2 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            Mark as Ready for Rate Request →
          </button>
        </div>
      )}

      {/* Verification Checklist Items */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Required Parameter Verification
          </h3>
          <span className="text-xs text-slate-500">
            Completed:{' '}
            <span className="font-bold text-slate-800">
              {verificationFields.filter((f) => checklist[f.key] === 'complete').length}
            </span>{' '}
            / 8
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {verificationFields.map((field) => {
            const state = checklist[field.key] as VerificationState;
            const isMissing = state === 'missing';
            const isClarification = state === 'clarification';
            const isComplete = state === 'complete';

            return (
              <div
                key={field.key}
                className={`p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isMissing
                    ? 'bg-rose-50/40 border-l-4 border-l-rose-500'
                    : isClarification
                    ? 'bg-amber-50/40 border-l-4 border-l-amber-500'
                    : 'hover:bg-slate-50/70 border-l-4 border-l-emerald-500'
                }`}
              >
                {/* Field Details */}
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{field.title}</span>
                    <VerificationItemBadge state={state} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{field.description}</p>
                  <p
                    className={`text-xs font-semibold mt-1 p-2 rounded-lg ${
                      isMissing
                        ? 'bg-rose-100/60 text-rose-900 border border-rose-200/80'
                        : isClarification
                        ? 'bg-amber-100/60 text-amber-900 border border-amber-200/80'
                        : 'bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    Current value: {field.currentValue}
                  </p>
                </div>

                {/* State Segmented Toggle Controls */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleStateChange(field.key, 'complete')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isComplete
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStateChange(field.key, 'missing')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isMissing
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Missing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStateChange(field.key, 'clarification')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isClarification
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Clarification
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Internal Verification Notes Card */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Internal Verification Audit Note
            </label>
            <button
              onClick={handleSaveNotes}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Save Notes
            </button>
          </div>
          <textarea
            rows={2}
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Add internal remarks about customs documents, cargo verification notes, or customer calls..."
            className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Clarification Message Preview Modal */}
      {showClarificationModal && (
        <Modal
          isOpen={showClarificationModal}
          onClose={() => setShowClarificationModal(false)}
          title="Customer Clarification Message Preview"
          subtitle={`Simulated clarification email to ${activeEnquiry.email}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">
                🔒 Demo Mode: No live emails are sent.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClarificationModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendClarificationDemo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Save & Log Clarification (Demo)
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">Recipient:</span>{' '}
                <span className="text-slate-800 font-bold">{activeEnquiry.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject:</span>{' '}
                <span className="text-slate-900 font-bold">
                  Clarification Required: Shipment Enquiry [{activeEnquiry.id}]
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Editable Message Content:
              </label>
              <textarea
                rows={9}
                value={clarificationDraft}
                onChange={(e) => setClarificationDraft(e.target.value)}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Once logged, the enquiry status will reflect &quot;Awaiting Information&quot; with the customer clarification note logged in the activity trail.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function VerificationPage({ initialEnquiryId }: { initialEnquiryId?: string }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerificationContent initialEnquiryId={initialEnquiryId} />
    </React.Suspense>
  );
}
