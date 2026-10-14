"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Enquiry,
  FreightAgent,
  RateRequest,
  Quotation,
  AppSettings,
  ToastMessage,
  VerificationChecklist,
  RateBreakdown,
  ActivityLog,
  ServiceType,
} from '@/types';
import { StorageService } from '@/lib/storage';
import {
  calculateQuotationAmounts,
  addDaysToDate,
} from '@/lib/calculations';
import { isVerificationReadyForRates } from '@/lib/validation';

interface AutomationContextType {
  enquiries: Enquiry[];
  agents: FreightAgent[];
  rateRequests: RateRequest[];
  quotations: Quotation[];
  settings: AppSettings;
  toasts: ToastMessage[];
  isLoaded: boolean;

  // Notification helpers
  showToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Enquiry operations
  addEnquiry: (data: {
    customerName: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    serviceType: ServiceType;
    origin: string;
    destination: string;
    cargoDescription: string;
    packageCount: number;
    weightKg: number;
    volumeCbm: number;
    readyDate: string;
    deliveryDate: string;
    notes?: string;
    assignedEmployee?: string;
  }) => Enquiry;
  updateEnquiry: (id: string, updates: Partial<Enquiry>) => void;
  sendAcknowledgement: (enquiryId: string) => void;
  updateVerification: (
    enquiryId: string,
    checklistUpdates: Partial<VerificationChecklist>,
    markReadyForRates?: boolean
  ) => void;

  // Rate Request operations
  createRateRequest: (data: {
    enquiryId: string;
    agentId: string;
    expectedResponseDate: string;
  }) => RateRequest | null;
  markRateRequestSent: (requestId: string) => void;
  recordAgentRate: (requestId: string, breakdown: RateBreakdown) => void;

  // Quotation operations
  createQuotationFromRate: (
    enquiryId: string,
    rateRequestId?: string,
    customMarkup?: number,
    customTax?: number
  ) => Quotation | null;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  approveQuotationDemo: (id: string) => void;
  sendQuotationDemo: (id: string) => void;
  recordCustomerDecision: (id: string, decision: 'Accepted' | 'Rejected', notes?: string) => void;

  // Settings & Reset
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetDemoData: () => void;

  // Metrics
  metrics: {
    totalEnquiries: number;
    newEnquiries: number;
    awaitingInfo: number;
    awaitingRates: number;
    quotesPrepared: number;
    quotesAwaitingResponse: number;
    acceptedQuotes: number;
    rejectedQuotes: number;
    workflowDistribution: Record<string, number>;
  };
  recentActivities: ActivityLog[];
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export function AutomationProvider({ children }: { children: React.ReactNode }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => StorageService.getEnquiries());
  const [agents, setAgents] = useState<FreightAgent[]>(() => StorageService.getAgents());
  const [rateRequests, setRateRequests] = useState<RateRequest[]>(() => StorageService.getRateRequests());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoaded] = useState(true);

  // Save to storage when state changes
  useEffect(() => {
    if (isLoaded) {
      StorageService.saveEnquiries(enquiries);
    }
  }, [enquiries, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveAgents(agents);
    }
  }, [agents, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveRateRequests(rateRequests);
    }
  }, [rateRequests, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveQuotations(quotations);
    }
  }, [quotations, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveSettings(settings);
    }
  }, [settings, isLoaded]);

  // Toast Helpers
  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, message, type, duration: 4500 }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Add Enquiry
  const addEnquiry = (data: {
    customerName: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    serviceType: ServiceType;
    origin: string;
    destination: string;
    cargoDescription: string;
    packageCount: number;
    weightKg: number;
    volumeCbm: number;
    readyDate: string;
    deliveryDate: string;
    notes?: string;
    assignedEmployee?: string;
  }): Enquiry => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const count = enquiries.length + 1;
    const padded = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    const newId = `ENQ-2026-${padded}`;

    const newEnquiry: Enquiry = {
      ...data,
      id: newId,
      receivedDate: dateStr,
      assignedEmployee: data.assignedEmployee || 'Sarah Jenkins',
      status: 'New',
      acknowledgementSent: false,
      verification: {
        contactDetails: data.customerName && data.email ? 'complete' : 'missing',
        serviceType: data.serviceType ? 'complete' : 'missing',
        originDestination: data.origin && data.destination ? 'complete' : 'missing',
        cargoDescription: data.cargoDescription ? 'complete' : 'missing',
        packageQuantity: data.packageCount > 0 ? 'complete' : 'missing',
        weightVolume: data.weightKg > 0 && data.volumeCbm > 0 ? 'complete' : 'missing',
        readyDate: data.readyDate ? 'complete' : 'missing',
        deliveryRequirements: data.deliveryDate ? 'complete' : 'missing',
        isVerified: false,
      },
      activityHistory: [
        {
          id: `ACT-${newId}-1`,
          timestamp: dateStr,
          action: 'Enquiry Created',
          user: data.assignedEmployee || 'Sarah Jenkins',
          details: `Enquiry ${newId} created for ${data.companyName} (${data.serviceType}).`,
          badge: 'info',
        },
      ],
    };

    setEnquiries((prev) => [newEnquiry, ...prev]);
    showToast('Enquiry Created Successfully', `Created ${newId} for ${data.companyName}`, 'success');
    return newEnquiry;
  };

  // 2. Update Enquiry
  const updateEnquiry = (id: string, updates: Partial<Enquiry>) => {
    setEnquiries((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
          const history = [...item.activityHistory];
          if (updates.status && updates.status !== item.status) {
            history.unshift({
              id: `ACT-${id}-${Date.now()}`,
              timestamp: nowStr,
              action: `Status Updated to ${updates.status}`,
              user: 'User (Demo)',
              details: `Workflow updated to status "${updates.status}".`,
              badge: updates.status === 'Accepted' ? 'success' : updates.status === 'Rejected' ? 'danger' : 'info',
            });
          }
          return { ...item, ...updates, activityHistory: history };
        }
        return item;
      })
    );
  };

  // 3. Send Acknowledgement
  const sendAcknowledgement = (enquiryId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setEnquiries((prev) =>
      prev.map((item) => {
        if (item.id === enquiryId) {
          return {
            ...item,
            acknowledgementSent: true,
            acknowledgementDate: nowStr,
            activityHistory: [
              {
                id: `ACT-${enquiryId}-${Date.now()}`,
                timestamp: nowStr,
                action: 'Customer Acknowledgement Sent (Demo)',
                user: 'System Bot (Demo)',
                details: `Formal acknowledgement email logged and confirmed to ${item.email}.`,
                badge: 'success',
              },
              ...item.activityHistory,
            ],
          };
        }
        return item;
      })
    );
    showToast('Acknowledgement Sent (Demo)', `Formal receipt confirmation logged for ${enquiryId}`, 'success');
  };

  // 4. Update Verification
  const updateVerification = (
    enquiryId: string,
    checklistUpdates: Partial<VerificationChecklist>,
    markReadyForRates: boolean = false
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setEnquiries((prev) =>
      prev.map((item) => {
        if (item.id === enquiryId) {
          const updatedChecklist: VerificationChecklist = {
            ...item.verification,
            ...checklistUpdates,
          };

          const check = isVerificationReadyForRates(updatedChecklist);

          let newStatus = item.status;
          if (!check.isReady) {
            newStatus = 'Awaiting Information';
          } else if (markReadyForRates) {
            newStatus = 'Verified';
            updatedChecklist.isVerified = true;
            updatedChecklist.verifiedAt = nowStr;
            updatedChecklist.verifiedBy = 'Sarah Jenkins';
          }

          const history = [...item.activityHistory];
          if (markReadyForRates && check.isReady) {
            history.unshift({
              id: `ACT-${enquiryId}-${Date.now()}`,
              timestamp: nowStr,
              action: 'Information Fully Verified',
              user: 'Sarah Jenkins',
              details: 'Enquiry certified ready for freight rate requests.',
              badge: 'success',
            });
          } else if (!check.isReady && item.status !== 'Awaiting Information') {
            history.unshift({
              id: `ACT-${enquiryId}-${Date.now()}`,
              timestamp: nowStr,
              action: 'Missing Information Flagged',
              user: 'Information Desk',
              details: `Required fields missing: ${check.missingItems.join(', ')}`,
              badge: 'warning',
            });
          }

          return {
            ...item,
            status: newStatus,
            verification: updatedChecklist,
            activityHistory: history,
          };
        }
        return item;
      })
    );

    if (markReadyForRates) {
      showToast('Enquiry Verified', `${enquiryId} is marked Ready for Rate Request!`, 'success');
    } else {
      showToast('Verification Saved', `Checklist updated for ${enquiryId}`, 'info');
    }
  };

  // 5. Create Rate Request
  const createRateRequest = (data: {
    enquiryId: string;
    agentId: string;
    expectedResponseDate: string;
  }): RateRequest | null => {
    const enquiry = enquiries.find((e) => e.id === data.enquiryId);
    const agent = agents.find((a) => a.id === data.agentId);

    if (!enquiry || !agent) {
      showToast('Creation Failed', 'Enquiry or Freight Agent not found.', 'error');
      return null;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const count = rateRequests.length + 1;
    const padded = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    const reqId = `ARR-2026-${padded}`;

    const newRequest: RateRequest = {
      id: reqId,
      enquiryId: enquiry.id,
      agentId: agent.id,
      agentName: agent.name,
      agentCompany: agent.company,
      agentEmail: agent.email,
      serviceType: enquiry.serviceType,
      origin: enquiry.origin,
      destination: enquiry.destination,
      requestDate: nowStr,
      expectedResponseDate: data.expectedResponseDate || addDaysToDate(nowStr, 2),
      status: 'Ready to Send',
      demoEmailPreview: {
        subject: `Rate Request: ${enquiry.serviceType} from ${enquiry.origin} to ${enquiry.destination} [${enquiry.id}]`,
        body: `Dear ${agent.name},\n\nPlease provide your spot rate and schedule for the following shipment:\n\n- Customer Reference: ${enquiry.companyName}\n- Route: ${enquiry.origin} -> ${enquiry.destination}\n- Service Type: ${enquiry.serviceType}\n- Commodity: ${enquiry.cargoDescription}\n- Packages: ${enquiry.packageCount} units\n- Gross Weight: ${enquiry.weightKg} kg\n- Volume: ${enquiry.volumeCbm} CBM\n- Ready Date: ${enquiry.readyDate}\n- Target Delivery: ${enquiry.deliveryDate}\n\nPlease include itemized base freight, fuel surcharges, terminal/handling, and validity.\n\nBest regards,\nApex Global Logistics`,
      },
    };

    setRateRequests((prev) => [newRequest, ...prev]);

    // Update enquiry status
    updateEnquiry(enquiry.id, {
      status: 'Rate Requested',
    });

    showToast('Rate Request Created', `Created ${reqId} for ${agent.company}`, 'success');
    return newRequest;
  };

  // 6. Mark Rate Request Sent (Demo)
  const markRateRequestSent = (requestId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setRateRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'Sent — Demo',
            sentDate: nowStr,
          };
        }
        return req;
      })
    );

    const targetReq = rateRequests.find((r) => r.id === requestId);
    if (targetReq) {
      updateEnquiry(targetReq.enquiryId, {
        status: 'Rate Requested',
      });
    }

    showToast(
      'Rate Request Sent (Demo)',
      `Demo notification: Rate inquiry successfully transmitted to agent. No real email was dispatched.`,
      'success'
    );
  };

  // 7. Record Agent Rate
  const recordAgentRate = (requestId: string, breakdown: RateBreakdown) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let linkedEnquiryId = '';

    setRateRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          linkedEnquiryId = req.enquiryId;
          return {
            ...req,
            status: 'Rate Received',
            rateBreakdown: {
              ...breakdown,
              receivedDate: nowStr,
            },
          };
        }
        return req;
      })
    );

    if (linkedEnquiryId) {
      setEnquiries((prev) =>
        prev.map((item) => {
          if (item.id === linkedEnquiryId) {
            return {
              ...item,
              status: 'Rate Received',
              activityHistory: [
                {
                  id: `ACT-${linkedEnquiryId}-${Date.now()}`,
                  timestamp: nowStr,
                  action: 'Agent Rate Received',
                  user: 'Agent Response Desk',
                  details: `Rate captured for ${requestId}. Base: $${breakdown.baseFreightRate}, Total: $${
                    breakdown.baseFreightRate +
                    breakdown.fuelSurcharge +
                    breakdown.handlingCharge +
                    breakdown.customsDocCharge +
                    breakdown.otherCharges
                  }.`,
                  badge: 'success',
                },
                ...item.activityHistory,
              ],
            };
          }
          return item;
        })
      );
    }

    showToast('Agent Rate Recorded', `Rate breakdown saved for ${requestId}. Ready for quotation!`, 'success');
  };

  // 8. Create Quotation from Rate
  const createQuotationFromRate = (
    enquiryId: string,
    rateRequestId?: string,
    customMarkup?: number,
    customTax?: number
  ): Quotation | null => {
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) {
      showToast('Creation Failed', 'Enquiry not found.', 'error');
      return null;
    }

    const rateReq = rateRequests.find(
      (r) => (rateRequestId ? r.id === rateRequestId : r.enquiryId === enquiryId) && r.rateBreakdown
    );

    const baseCharges = rateReq?.rateBreakdown || {
      baseFreightRate: 1500,
      fuelSurcharge: 250,
      handlingCharge: 120,
      customsDocCharge: 80,
      otherCharges: 50,
      currency: settings.defaultCurrency,
      transitTime: '5-7 Days',
      validUntil: addDaysToDate(new Date().toISOString(), settings.quotationValidityDays),
      termsAndConditions: settings.defaultTerms,
      receivedDate: new Date().toISOString(),
    };

    const markup = customMarkup !== undefined ? customMarkup : settings.defaultMarkupPercent;
    const tax = customTax !== undefined ? customTax : settings.defaultTaxPercent;

    const calculations = calculateQuotationAmounts({
      baseFreightRate: baseCharges.baseFreightRate,
      fuelSurcharge: baseCharges.fuelSurcharge,
      handlingCharge: baseCharges.handlingCharge,
      customsDocCharge: baseCharges.customsDocCharge,
      otherCharges: baseCharges.otherCharges,
      markupPercent: markup,
      taxPercent: tax,
    });

    const nowStr = new Date().toISOString().substring(0, 10);
    const count = quotations.length + 1;
    const padded = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    const quoteId = `QT-2026-${padded}`;

    const newQuotation: Quotation = {
      id: quoteId,
      enquiryId: enquiry.id,
      rateRequestId: rateReq?.id,
      customerName: enquiry.customerName,
      companyName: enquiry.companyName,
      contactPerson: enquiry.contactPerson,
      customerEmail: enquiry.email,
      customerPhone: enquiry.phone,
      serviceType: enquiry.serviceType,
      origin: enquiry.origin,
      destination: enquiry.destination,
      cargoDescription: enquiry.cargoDescription,
      packageCount: enquiry.packageCount,
      weightKg: enquiry.weightKg,
      volumeCbm: enquiry.volumeCbm,
      currency: baseCharges.currency || settings.defaultCurrency,
      costs: calculations.costs,
      markupPercent: markup,
      sellingPrice: calculations.sellingPrice,
      taxPercent: tax,
      taxAmount: calculations.taxAmount,
      finalTotal: calculations.finalTotal,
      transitTime: baseCharges.transitTime || '3-5 Business Days',
      validUntil: baseCharges.validUntil || addDaysToDate(nowStr, settings.quotationValidityDays),
      createdDate: nowStr,
      status: 'Draft',
      termsAndConditions: baseCharges.termsAndConditions || settings.defaultTerms,
      activityHistory: [
        {
          id: `ACT-${quoteId}-1`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'Quotation Created (Draft)',
          user: 'Sarah Jenkins',
          details: `Draft created with ${markup}% selling margin. Total: ${calculations.finalTotal} ${baseCharges.currency}.`,
          badge: 'info',
        },
      ],
    };

    setQuotations((prev) => [newQuotation, ...prev]);

    updateEnquiry(enquiry.id, {
      status: 'Quoted',
    });

    showToast('Quotation Created', `Quotation ${quoteId} generated successfully.`, 'success');
    return newQuotation;
  };

  // 9. Update Quotation
  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return { ...q, ...updates };
        }
        return q;
      })
    );
    showToast('Quotation Updated', `Changes saved to quotation ${id}`, 'info');
  };

  // 10. Approve Quotation (Demo)
  const approveQuotationDemo = (id: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            status: 'Approved — Demo',
            approvedBy: 'Freight Ops Director (Demo)',
            approvedDate: nowStr,
            activityHistory: [
              {
                id: `ACT-${id}-${Date.now()}`,
                timestamp: nowStr,
                action: 'Quotation Approved (Demo Mode)',
                user: 'Freight Ops Director',
                details: 'Commercial margin, validity, and credit parameters approved.',
                badge: 'success',
              },
              ...q.activityHistory,
            ],
          };
        }
        return q;
      })
    );
    showToast('Quotation Approved (Demo)', `Quotation ${id} has been signed off for client transmission.`, 'success');
  };

  // 11. Send Quotation (Demo)
  const sendQuotationDemo = (id: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let linkedEnquiryId = '';

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          linkedEnquiryId = q.enquiryId;
          return {
            ...q,
            status: 'Sent — Demo',
            sentDate: nowStr,
            activityHistory: [
              {
                id: `ACT-${id}-${Date.now()}`,
                timestamp: nowStr,
                action: 'Quotation Dispatched to Customer (Demo)',
                user: 'Sarah Jenkins',
                details: `Commercial quote transmitted to ${q.customerEmail}. Demonstration mode - no live emails sent.`,
                badge: 'warning',
              },
              ...q.activityHistory,
            ],
          };
        }
        return q;
      })
    );

    if (linkedEnquiryId) {
      updateEnquiry(linkedEnquiryId, {
        status: 'Quoted',
      });
    }

    showToast(
      'Quotation Sent (Demo)',
      `Customer quotation proposal successfully logged as sent to client.`,
      'success'
    );
  };

  // 12. Record Customer Decision (Accepted / Rejected)
  const recordCustomerDecision = (id: string, decision: 'Accepted' | 'Rejected', notes?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let linkedEnquiryId = '';

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          linkedEnquiryId = q.enquiryId;
          return {
            ...q,
            status: decision,
            customerDecisionDate: nowStr,
            customerDecisionNotes: notes || (decision === 'Accepted' ? 'Client accepted all terms.' : 'Declined by customer.'),
            activityHistory: [
              {
                id: `ACT-${id}-${Date.now()}`,
                timestamp: nowStr,
                action: `Customer Decision: ${decision}`,
                user: q.customerName,
                details: notes || `Customer formally selected ${decision}.`,
                badge: decision === 'Accepted' ? 'success' : 'danger',
              },
              ...q.activityHistory,
            ],
          };
        }
        return q;
      })
    );

    if (linkedEnquiryId) {
      updateEnquiry(linkedEnquiryId, {
        status: decision,
      });
    }

    showToast(
      `Quotation ${decision}`,
      `Quotation ${id} has been marked as ${decision}. Workflow updated.`,
      decision === 'Accepted' ? 'success' : 'error'
    );
  };

  // 13. Update Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Settings Saved', 'System defaults updated successfully.', 'success');
  };

  // 14. Reset Demo Data
  const resetDemoData = () => {
    StorageService.resetAllData();
    setEnquiries(StorageService.getEnquiries());
    setAgents(StorageService.getAgents());
    setRateRequests(StorageService.getRateRequests());
    setQuotations(StorageService.getQuotations());
    setSettings(StorageService.getSettings());
    showToast('Demo Data Reset', 'All enquiries, rates, and quotes reset to original sample state.', 'info');
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalEnquiries = enquiries.length;
    const newEnquiries = enquiries.filter((e) => e.status === 'New').length;
    const awaitingInfo = enquiries.filter((e) => e.status === 'Awaiting Information').length;
    const awaitingRates = enquiries.filter((e) => e.status === 'Rate Requested').length;
    const quotesPrepared = quotations.filter((q) => q.status === 'Draft' || q.status === 'Ready for Review' || q.status === 'Approved — Demo').length;
    const quotesAwaitingResponse = quotations.filter((q) => q.status === 'Sent — Demo').length;
    const acceptedQuotes = quotations.filter((q) => q.status === 'Accepted').length;
    const rejectedQuotes = quotations.filter((q) => q.status === 'Rejected').length;

    const workflowDistribution: Record<string, number> = {
      'New': newEnquiries,
      'Awaiting Info': awaitingInfo,
      'Verified': enquiries.filter((e) => e.status === 'Verified').length,
      'Rate Requested': awaitingRates,
      'Rate Received': enquiries.filter((e) => e.status === 'Rate Received').length,
      'Quoted': enquiries.filter((e) => e.status === 'Quoted').length,
      'Accepted': acceptedQuotes,
      'Rejected': rejectedQuotes,
    };

    return {
      totalEnquiries,
      newEnquiries,
      awaitingInfo,
      awaitingRates,
      quotesPrepared,
      quotesAwaitingResponse,
      acceptedQuotes,
      rejectedQuotes,
      workflowDistribution,
    };
  }, [enquiries, quotations]);

  // Combined Recent Activities
  const recentActivities = useMemo(() => {
    const logs: ActivityLog[] = [];
    enquiries.forEach((e) => {
      e.activityHistory?.forEach((act) => {
        logs.push({
          ...act,
          details: `[${e.id}] ${act.details}`,
        });
      });
    });
    // Sort descending by timestamp
    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 15);
  }, [enquiries]);

  return (
    <AutomationContext.Provider
      value={{
        enquiries,
        agents,
        rateRequests,
        quotations,
        settings,
        toasts,
        isLoaded,
        showToast,
        removeToast,
        addEnquiry,
        updateEnquiry,
        sendAcknowledgement,
        updateVerification,
        createRateRequest,
        markRateRequestSent,
        recordAgentRate,
        createQuotationFromRate,
        updateQuotation,
        approveQuotationDemo,
        sendQuotationDemo,
        recordCustomerDecision,
        updateSettings,
        resetDemoData,
        metrics,
        recentActivities,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const context = useContext(AutomationContext);
  if (!context) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
}
