import React from 'react';
import {
  EnquiryStatus,
  RateRequestStatus,
  QuotationStatus,
  ServiceType,
  VerificationState,
} from '@/types';
import { Plane, Ship, Truck, Package, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'green' | 'orange' | 'red' | 'blue' | 'slate' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    orange: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/10',
    red: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    blue: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset tracking-wide transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  switch (status) {
    case 'New':
      return (
        <Badge variant="blue" icon={<Clock className="w-3 h-3 text-sky-600" />}>
          New Enquiry
        </Badge>
      );
    case 'Awaiting Information':
      return (
        <Badge variant="orange" icon={<AlertCircle className="w-3 h-3 text-amber-600" />}>
          Awaiting Info
        </Badge>
      );
    case 'Verified':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Verified
        </Badge>
      );
    case 'Rate Requested':
      return (
        <Badge variant="orange" icon={<Clock className="w-3 h-3 text-amber-600" />}>
          Awaiting Rates
        </Badge>
      );
    case 'Rate Received':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Rate Received
        </Badge>
      );
    case 'Quoted':
      return (
        <Badge variant="purple" icon={<CheckCircle2 className="w-3 h-3 text-indigo-600" />}>
          Quotation Prepared
        </Badge>
      );
    case 'Accepted':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Accepted
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="red" icon={<XCircle className="w-3 h-3 text-rose-600" />}>
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
}

export function RateRequestStatusBadge({ status }: { status: RateRequestStatus }) {
  switch (status) {
    case 'Draft':
      return <Badge variant="slate">Draft</Badge>;
    case 'Ready to Send':
      return <Badge variant="blue">Ready to Send</Badge>;
    case 'Sent — Demo':
      return (
        <Badge variant="orange" icon={<Clock className="w-3 h-3 text-amber-600" />}>
          Sent — Demo
        </Badge>
      );
    case 'Rate Received':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Rate Received
        </Badge>
      );
    case 'Overdue':
      return (
        <Badge variant="red" icon={<AlertCircle className="w-3 h-3 text-rose-600" />}>
          Overdue
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
}

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  switch (status) {
    case 'Draft':
      return <Badge variant="slate">Draft</Badge>;
    case 'Ready for Review':
      return <Badge variant="blue">Ready for Review</Badge>;
    case 'Approved — Demo':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Approved — Demo
        </Badge>
      );
    case 'Sent — Demo':
      return (
        <Badge variant="orange" icon={<Clock className="w-3 h-3 text-amber-600" />}>
          Sent — Demo
        </Badge>
      );
    case 'Accepted':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Accepted by Client
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="red" icon={<XCircle className="w-3 h-3 text-rose-600" />}>
          Rejected
        </Badge>
      );
    case 'Expired':
      return (
        <Badge variant="slate" icon={<AlertCircle className="w-3 h-3 text-slate-500" />}>
          Expired
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
}

export function ServiceTypeBadge({ service }: { service: ServiceType }) {
  switch (service) {
    case 'Air Freight':
      return (
        <Badge variant="blue" icon={<Plane className="w-3.5 h-3.5 text-sky-600" />}>
          Air Freight
        </Badge>
      );
    case 'Sea Freight':
      return (
        <Badge variant="purple" icon={<Ship className="w-3.5 h-3.5 text-indigo-600" />}>
          Sea Freight
        </Badge>
      );
    case 'Road Freight':
      return (
        <Badge variant="orange" icon={<Truck className="w-3.5 h-3.5 text-amber-600" />}>
          Road Freight
        </Badge>
      );
    case 'Courier':
      return (
        <Badge variant="green" icon={<Package className="w-3.5 h-3.5 text-emerald-600" />}>
          Express Courier
        </Badge>
      );
    default:
      return <Badge variant="slate">{service}</Badge>;
  }
}

export function VerificationItemBadge({ state }: { state: VerificationState }) {
  switch (state) {
    case 'complete':
      return (
        <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
          Complete
        </Badge>
      );
    case 'missing':
      return (
        <Badge variant="red" icon={<XCircle className="w-3 h-3 text-rose-600" />}>
          Missing
        </Badge>
      );
    case 'clarification':
      return (
        <Badge variant="orange" icon={<AlertCircle className="w-3 h-3 text-amber-600" />}>
          Needs Clarification
        </Badge>
      );
    default:
      return <Badge variant="slate">{state}</Badge>;
  }
}
