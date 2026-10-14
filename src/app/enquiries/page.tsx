"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  CheckSquare,
  FileText,
  Send,
  History,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Inbox,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import {
  EnquiryStatusBadge,
  ServiceTypeBadge,
} from '@/components/ui/Badge';
import { Enquiry, ServiceType, EnquiryStatus } from '@/types';
import Modal from '@/components/ui/Modal';

function EnquiriesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || 'All';

  const { enquiries, sendAcknowledgement, isLoaded } = useAutomation();

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [sortField, setSortField] = useState<'receivedDate' | 'id' | 'companyName'>('receivedDate');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer / History Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<Enquiry | null>(null);

  // Filtered & Sorted Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries
      .filter((e) => {
        const matchesSearch =
          search.trim() === '' ||
          e.id.toLowerCase().includes(search.toLowerCase()) ||
          e.companyName.toLowerCase().includes(search.toLowerCase()) ||
          e.customerName.toLowerCase().includes(search.toLowerCase()) ||
          e.origin.toLowerCase().includes(search.toLowerCase()) ||
          e.destination.toLowerCase().includes(search.toLowerCase()) ||
          e.cargoDescription.toLowerCase().includes(search.toLowerCase());

        const matchesService = serviceFilter === 'All' || e.serviceType === serviceFilter;
        const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

        return matchesSearch && matchesService && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
  }, [enquiries, search, serviceFilter, statusFilter, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage) || 1;
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEnquiries.slice(start, start + itemsPerPage);
  }, [filteredEnquiries, currentPage, itemsPerPage]);

  const handleSort = (field: 'receivedDate' | 'id' | 'companyName') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Enquiries Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, search, filter, and track all incoming shipping and courier enquiries.
          </p>
        </div>

        <Link
          href="/enquiries/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs shadow-blue-500/20 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Enquiry
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, client, cargo, origin, or destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Service Filter */}
          <div className="w-full sm:w-48">
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700"
            >
              <option value="All">All Services</option>
              <option value="Air Freight">Air Freight</option>
              <option value="Sea Freight">Sea Freight</option>
              <option value="Road Freight">Road Freight</option>
              <option value="Courier">Express Courier</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-52">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Awaiting Information">Awaiting Information</option>
              <option value="Verified">Verified</option>
              <option value="Rate Requested">Rate Requested</option>
              <option value="Rate Received">Rate Received</option>
              <option value="Quoted">Quoted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Filter Stats Pill Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Showing</span>
            <span className="font-bold text-slate-800">{filteredEnquiries.length}</span>
            <span>of {enquiries.length} enquiries</span>
            {(search || serviceFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setServiceFilter('All');
                  setStatusFilter('All');
                  setCurrentPage(1);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Sort by:</span>
            <button
              onClick={() => handleSort('receivedDate')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                sortField === 'receivedDate' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Date {sortField === 'receivedDate' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => handleSort('id')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                sortField === 'id' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              ID {sortField === 'id' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => handleSort('companyName')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                sortField === 'companyName' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Client {sortField === 'companyName' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {/* Enquiries Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/90 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Enquiry ID</th>
                <th className="py-3.5 px-3">Company & Contact</th>
                <th className="py-3.5 px-3">Service</th>
                <th className="py-3.5 px-3">Route (Origin → Destination)</th>
                <th className="py-3.5 px-3">Cargo Spec</th>
                <th className="py-3.5 px-3">Ready Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Assigned</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEnquiries.length > 0 ? (
                paginatedEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-blue-50/40 transition group">
                    {/* Enquiry ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/enquiries/${enq.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {enq.id}
                      </Link>
                      <div className="text-[10px] text-slate-400 mt-0.5">{enq.receivedDate}</div>
                    </td>

                    {/* Customer & Company */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {enq.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <span>{enq.customerName}</span>
                      </div>
                    </td>

                    {/* Service Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <ServiceTypeBadge service={enq.serviceType} />
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <div className="font-medium text-slate-800 truncate" title={enq.origin}>
                        {enq.origin}
                      </div>
                      <div className="text-slate-500 truncate" title={enq.destination}>
                        → {enq.destination}
                      </div>
                    </td>

                    {/* Cargo Spec */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                      <div>
                        {enq.packageCount > 0 ? `${enq.packageCount} pkgs` : <span className="text-rose-500 font-bold">Qty missing</span>}
                        {' · '}
                        {enq.weightKg > 0 ? `${enq.weightKg} kg` : <span className="text-rose-500 font-bold">Weight missing</span>}
                      </div>
                      <div className="text-slate-400">
                        {enq.volumeCbm > 0 ? `${enq.volumeCbm} CBM` : ''}
                      </div>
                    </td>

                    {/* Ready Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                      <div>{enq.readyDate || <span className="text-rose-500">Not set</span>}</div>
                      <div className="text-[10px] text-slate-400">Target: {enq.deliveryDate}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <EnquiryStatusBadge status={enq.status} />
                    </td>

                    {/* Assigned Employee */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                      {enq.assignedEmployee}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick View Button */}
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Quick View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Verify Button */}
                        <Link
                          href={`/verification/${enq.id}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Verify Information"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Link>

                        {/* Rate / Quotation shortcut */}
                        {enq.status === 'Rate Received' ? (
                          <Link
                            href={`/quotations/new?enquiryId=${enq.id}`}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Create Quotation"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        ) : enq.status === 'Verified' ? (
                          <Link
                            href={`/rate-requests?createFor=${enq.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Request Agent Rates"
                          >
                            <Send className="w-4 h-4" />
                          </Link>
                        ) : null}

                        {/* Audit History */}
                        <button
                          onClick={() => setShowHistoryModal(enq)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="View History Audit Trail"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Details Page Link */}
                        <Link
                          href={`/enquiries/${enq.id}`}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Inbox className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No enquiries match your filter</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting your search query or status criteria.</p>
                      <button
                        onClick={() => {
                          setSearch('');
                          setServiceFilter('All');
                          setStatusFilter('All');
                        }}
                        className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {filteredEnquiries.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredEnquiries.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{filteredEnquiries.length}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                  currentPage === page
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Drawer Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          title={`Enquiry File: ${selectedEnquiry.id}`}
          subtitle={`${selectedEnquiry.companyName} • Registered on ${selectedEnquiry.receivedDate}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              {!selectedEnquiry.acknowledgementSent ? (
                <button
                  onClick={() => {
                    sendAcknowledgement(selectedEnquiry.id);
                    setSelectedEnquiry({
                      ...selectedEnquiry,
                      acknowledgementSent: true,
                    });
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition"
                >
                  Send Customer Acknowledgement (Demo)
                </button>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  ✓ Acknowledgement Dispatched
                </span>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={`/verification/${selectedEnquiry.id}`}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  Verify Checklist
                </Link>
                <Link
                  href={`/enquiries/${selectedEnquiry.id}`}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Open Full File
                </Link>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Type</span>
                <div className="mt-1">
                  <ServiceTypeBadge service={selectedEnquiry.serviceType} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Workflow Status</span>
                <div className="mt-1">
                  <EnquiryStatusBadge status={selectedEnquiry.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-800 text-xs mb-2">Customer & Consignee</h4>
                <p className="font-semibold text-slate-900">{selectedEnquiry.customerName}</p>
                <p className="text-slate-500">{selectedEnquiry.companyName}</p>
                <div className="mt-2 space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedEnquiry.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedEnquiry.phone}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-800 text-xs mb-2">Routing & Schedule</h4>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Origin:</span>
                    <span className="font-medium text-slate-800">{selectedEnquiry.origin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Destination:</span>
                    <span className="font-medium text-slate-800">{selectedEnquiry.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                    <span>Ready: {selectedEnquiry.readyDate}</span>
                    <span>Target: {selectedEnquiry.deliveryDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white">
              <h4 className="font-bold text-slate-800 text-xs mb-1">Cargo Specifications</h4>
              <p className="text-slate-700">{selectedEnquiry.cargoDescription}</p>
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Packages</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.packageCount} Units</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Gross Weight</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Volume</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.volumeCbm} CBM</span>
                </div>
              </div>
            </div>

            {selectedEnquiry.notes && (
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-amber-900">
                <span className="font-bold text-[11px] block">Special Operational Notes:</span>
                <p className="mt-0.5">{selectedEnquiry.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Activity History Modal */}
      {showHistoryModal && (
        <Modal
          isOpen={!!showHistoryModal}
          onClose={() => setShowHistoryModal(null)}
          title={`Audit History: ${showHistoryModal.id}`}
          subtitle={`Event log for ${showHistoryModal.companyName}`}
          maxWidth="lg"
          footer={
            <button
              onClick={() => setShowHistoryModal(null)}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition"
            >
              Close Log
            </button>
          }
        >
          <div className="space-y-3">
            {showHistoryModal.activityHistory.map((item, idx) => (
              <div key={item.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{item.action}</span>
                  <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{item.details}</p>
                <p className="text-[10px] text-slate-400 mt-1">Logged by {item.user}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function EnquiriesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EnquiriesContent />
    </React.Suspense>
  );
}
