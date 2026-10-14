"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GitFork,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import { ServiceTypeBadge, EnquiryStatusBadge } from '@/components/ui/Badge';

export default function WorkflowMonitorPage() {
  const {
    enquiries,
    rateRequests,
    quotations,
    sendAcknowledgement,
    approveQuotationDemo,
    sendQuotationDemo,
    recordCustomerDecision,
    isLoaded,
  } = useAutomation();

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');

  const activeEnquiryId =
    selectedEnquiryId ||
    enquiries.find((e) => e.status === 'Rate Received')?.id ||
    enquiries.find((e) => e.status === 'Awaiting Information')?.id ||
    enquiries[0]?.id ||
    '';

  const activeEnquiry = enquiries.find((e) => e.id === activeEnquiryId) || enquiries[0];

  const linkedRate = useMemo(() => {
    return rateRequests.find((r) => r.enquiryId === activeEnquiry?.id);
  }, [rateRequests, activeEnquiry]);

  const linkedQuote = useMemo(() => {
    return quotations.find((q) => q.enquiryId === activeEnquiry?.id);
  }, [quotations, activeEnquiry]);

  if (!isLoaded || !activeEnquiry) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

interface StageData {
  completed: boolean;
  timestamp: string | null;
  blocker: string | null;
  decision?: string | null;
  isApplicable?: boolean;
}

  // Determine stage completion for the 11-step pipeline
  // 1. Enquiry Received
  const stage1: StageData = { completed: true, timestamp: activeEnquiry.receivedDate, blocker: null };

  // 2. Acknowledgement Prepared
  const stage2: StageData = {
    completed: activeEnquiry.acknowledgementSent,
    timestamp: activeEnquiry.acknowledgementDate || (activeEnquiry.acknowledgementSent ? 'Logged' : null),
    blocker: !activeEnquiry.acknowledgementSent ? 'Acknowledgement not dispatched' : null,
  };

  // 3. Information Verification
  const verificationComplete = activeEnquiry.verification.isVerified;
  const stage3: StageData = {
    completed: verificationComplete,
    timestamp: activeEnquiry.verification.verifiedAt || null,
    blocker: !verificationComplete ? '8-point checklist verification incomplete' : null,
  };

  // 4. Customer Clarification, if needed
  const needsClarification = activeEnquiry.status === 'Awaiting Information';
  const stage4: StageData = {
    completed: !needsClarification,
    isApplicable: needsClarification || !!activeEnquiry.verification.clarificationMessage,
    timestamp: activeEnquiry.verification.clarificationMessage ? 'Clarification Logged' : null,
    blocker: needsClarification ? 'Waiting for customer clarification response' : null,
  };

  // 5. Ready for Rate Request
  const readyForRates = activeEnquiry.verification.isVerified;
  const stage5: StageData = {
    completed: readyForRates,
    timestamp: activeEnquiry.verification.verifiedAt || null,
    blocker: !readyForRates ? 'Enquiry must be certified complete before RFPs' : null,
  };

  // 6. Agent Rate Request
  const rateRequestSent = linkedRate && (linkedRate.status === 'Sent — Demo' || linkedRate.status === 'Rate Received');
  const stage6: StageData = {
    completed: !!rateRequestSent,
    timestamp: linkedRate?.sentDate || null,
    blocker: !readyForRates
      ? 'Cannot request rate before information verification'
      : !linkedRate
      ? 'No agent rate request created'
      : linkedRate.status === 'Ready to Send'
      ? 'Rate request not yet sent to agent'
      : null,
  };

  // 7. Agent Rate Received
  const rateReceived = linkedRate && !!linkedRate.rateBreakdown;
  const stage7: StageData = {
    completed: !!rateReceived,
    timestamp: linkedRate?.rateBreakdown?.receivedDate || null,
    blocker: !rateRequestSent
      ? 'Rate request has not been sent to agent'
      : !rateReceived
      ? 'Waiting for agent to submit rate breakdown'
      : null,
  };

  // 8. Quotation Preparation
  const quotePrepared = !!linkedQuote;
  const stage8: StageData = {
    completed: quotePrepared,
    timestamp: linkedQuote?.createdDate || null,
    blocker: !rateReceived ? 'Requires agent received rate before quote preparation' : null,
  };

  // 9. Quote Approval
  const quoteApproved = linkedQuote && (linkedQuote.status === 'Approved — Demo' || linkedQuote.status === 'Sent — Demo' || linkedQuote.status === 'Accepted' || linkedQuote.status === 'Rejected');
  const stage9: StageData = {
    completed: !!quoteApproved,
    timestamp: linkedQuote?.approvedDate || null,
    blocker: !quotePrepared
      ? 'Quotation not yet prepared'
      : linkedQuote?.status === 'Draft' || linkedQuote?.status === 'Ready for Review'
      ? 'Quotation awaiting manager approval'
      : null,
  };

  // 10. Quote Sent to Customer
  const quoteSent = linkedQuote && (linkedQuote.status === 'Sent — Demo' || linkedQuote.status === 'Accepted' || linkedQuote.status === 'Rejected');
  const stage10: StageData = {
    completed: !!quoteSent,
    timestamp: linkedQuote?.sentDate || null,
    blocker: !quoteApproved ? 'Quotation not approved for client dispatch' : null,
  };

  // 11. Accepted or Rejected
  const isDecided = linkedQuote && (linkedQuote.status === 'Accepted' || linkedQuote.status === 'Rejected');
  const stage11: StageData = {
    completed: !!isDecided,
    decision: linkedQuote?.status === 'Accepted' ? 'Accepted' : linkedQuote?.status === 'Rejected' ? 'Rejected' : null,
    timestamp: linkedQuote?.customerDecisionDate || null,
    blocker: !quoteSent ? 'Customer proposal not yet sent' : 'Awaiting customer response',
  };

  // Full 11-step stage sequence
  const pipelineSteps = [
    {
      num: 1,
      title: 'Enquiry Received',
      desc: 'Customer request captured with initial routing and cargo details',
      data: stage1,
      action: null,
    },
    {
      num: 2,
      title: 'Acknowledgement Prepared',
      desc: 'Formal receipt confirmation sent to client',
      data: stage2,
      action: !stage2.completed ? (
        <button
          onClick={() => sendAcknowledgement(activeEnquiry.id)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold"
        >
          Send Acknowledgement (Demo)
        </button>
      ) : null,
    },
    {
      num: 3,
      title: 'Information Verification',
      desc: 'Quality check of 8 mandatory shipment parameters',
      data: stage3,
      action: !stage3.completed ? (
        <Link
          href={`/verification/${activeEnquiry.id}`}
          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold"
        >
          Verify Checklist →
        </Link>
      ) : null,
    },
    {
      num: 4,
      title: 'Customer Clarification',
      desc: 'Address missing specs, dimensions, or packaging requirements',
      data: stage4,
      action: needsClarification ? (
        <Link
          href={`/verification/${activeEnquiry.id}`}
          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold"
        >
          Review Clarification →
        </Link>
      ) : null,
    },
    {
      num: 5,
      title: 'Ready for Rate Request',
      desc: 'Shipment specifications certified for carrier solicitation',
      data: stage5,
      action: !stage5.completed ? (
        <span className="text-[11px] text-slate-400 italic">Locked until verified</span>
      ) : null,
    },
    {
      num: 6,
      title: 'Agent Rate Request',
      desc: 'Carrier RFP dispatched to selected freight forwarder/agent',
      data: stage6,
      action:
        stage5.completed && !stage6.completed ? (
          <Link
            href={`/rate-requests?createFor=${activeEnquiry.id}`}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold"
          >
            Create Agent Request →
          </Link>
        ) : null,
    },
    {
      num: 7,
      title: 'Agent Rate Received',
      desc: 'Itemized base freight, fuel, THC, and doc charges recorded',
      data: stage7,
      action:
        stage6.completed && !stage7.completed && linkedRate ? (
          <Link
            href={`/rate-requests/${linkedRate.id}/rate`}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold"
          >
            Enter Carrier Rate →
          </Link>
        ) : null,
    },
    {
      num: 8,
      title: 'Quotation Preparation',
      desc: 'Selling markup applied, tax computed, commercial proposal formatted',
      data: stage8,
      action:
        stage7.completed && !stage8.completed ? (
          <Link
            href={`/quotations/new?enquiryId=${activeEnquiry.id}&rateRequestId=${linkedRate?.id}`}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold"
          >
            Create Quotation →
          </Link>
        ) : null,
    },
    {
      num: 9,
      title: 'Quote Approval',
      desc: 'Internal managerial review and commercial sign-off',
      data: stage9,
      action:
        stage8.completed && !stage9.completed && linkedQuote ? (
          <button
            onClick={() => approveQuotationDemo(linkedQuote.id)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold"
          >
            Approve (Demo)
          </button>
        ) : null,
    },
    {
      num: 10,
      title: 'Quote Sent to Customer',
      desc: 'Official quotation sheet dispatched to customer email (Demo)',
      data: stage10,
      action:
        stage9.completed && !stage10.completed && linkedQuote ? (
          <button
            onClick={() => sendQuotationDemo(linkedQuote.id)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold"
          >
            Send to Client (Demo)
          </button>
        ) : null,
    },
    {
      num: 11,
      title: 'Accepted or Rejected',
      desc: 'Customer confirmation or rejection recording with feedback audit',
      data: stage11,
      action:
        stage10.completed && !stage11.completed && linkedQuote ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => recordCustomerDecision(linkedQuote.id, 'Accepted')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold"
            >
              Accept
            </button>
            <button
              onClick={() => recordCustomerDecision(linkedQuote.id, 'Rejected')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold"
            >
              Reject
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header & Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <GitFork className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                End-to-End Orchestration
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Workflow Stage Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Inspect current stage, chronological milestones, and execute valid forward actions.
            </p>
          </div>

          {/* Enquiry Selector */}
          <div className="w-full md:w-80">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Enquiry to Track:
            </label>
            <select
              value={activeEnquiryId}
              onChange={(e) => setSelectedEnquiryId(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              {enquiries.map((enq) => (
                <option key={enq.id} value={enq.id}>
                  {enq.id} — {enq.companyName} ({enq.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Enquiry File Card */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-extrabold text-blue-600">{activeEnquiry.id}</span>
            <span className="font-bold text-slate-900">{activeEnquiry.companyName}</span>
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
              View Full Enquiry File →
            </Link>
          </div>
        </div>
      </div>

      {/* 11-Step Interactive Stepper Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Standard 11-Stage Workflow Pipeline
          </h3>
          <span className="text-xs text-slate-500">
            Current Stage:{' '}
            <span className="font-bold text-slate-800">{activeEnquiry.status}</span>
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-slate-200 -z-0" />

          {pipelineSteps.map((step) => {
            const isCompleted = step.data.completed;
            const isRejected = step.num === 11 && step.data.decision === 'Rejected';
            const hasBlocker = !!step.data.blocker && !isCompleted;

            return (
              <div key={step.num} className="relative flex items-start gap-4 text-xs group">
                {/* Step Circle Indicator */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white z-10 transition ${
                    isRejected
                      ? 'bg-rose-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : hasBlocker
                      ? 'bg-slate-100 text-slate-400 border border-slate-300'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isRejected ? (
                    <XCircle className="w-4 h-4" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.num
                  )}
                </div>

                {/* Content Card */}
                <div
                  className={`flex-1 p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRejected
                      ? 'bg-rose-50/50 border-rose-200'
                      : isCompleted
                      ? 'bg-emerald-50/30 border-emerald-200/80'
                      : hasBlocker
                      ? 'bg-slate-50 border-slate-200/80 opacity-90'
                      : 'bg-blue-50/40 border-blue-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {step.num}. {step.title}
                      </span>
                      {isCompleted && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          Completed
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                          Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>

                    {/* Timestamp or blocker notice */}
                    {step.data.timestamp && (
                      <p className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Timestamp: {step.data.timestamp}
                      </p>
                    )}
                    {hasBlocker && (
                      <p className="text-[10px] text-amber-600 font-medium pt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Pending: {step.data.blocker}
                      </p>
                    )}
                  </div>

                  {/* Valid Next Action Button */}
                  {step.action && <div className="shrink-0 pt-2 sm:pt-0">{step.action}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
