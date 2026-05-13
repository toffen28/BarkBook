'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getInvoice, updateInvoice, markInvoicePaid, deleteInvoice, getJob, getCustomer, getPet } from '@/lib/data';
import { generateInvoicePDF, downloadInvoicePDF } from '@/lib/pdf';
import type { Invoice, Job, Customer, Pet } from '@/lib/types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [businessName, setBusinessName] = useState("Pam's Pups Grooming");

  useEffect(() => {
    fetchInvoiceData();
  }, [params.id]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const invoiceData = await getInvoice(params.id as string);
      if (!invoiceData) {
        setError('Invoice not found');
        return;
      }
      
      setInvoice(invoiceData);
      
      // Fetch job
      const jobData = await getJob(invoiceData.job_id);
      setJob(jobData);
      
      if (jobData) {
        // Fetch customer
        const customerData = await getCustomer(jobData.customer_id);
        setCustomer(customerData);
        
        // Fetch pet if exists
        if (jobData.pet_id) {
          const petData = await getPet(jobData.pet_id);
          setPet(petData);
        }
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'unpaid' | 'paid' | 'overdue') => {
    if (!invoice) return;
    
    try {
      setUpdating(true);
      if (newStatus === 'paid') {
        await markInvoicePaid(invoice.id);
      } else {
        await updateInvoice(invoice.id, { status: newStatus });
      }
      setInvoice({ ...invoice, status: newStatus });
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deleteInvoice(invoice.id);
      router.push('/invoices');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice || !job || !customer) return;
    
    const pdfData = {
      invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
      date: new Date(invoice.created_at).toLocaleDateString('en-GB'),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : 'N/A',
      customerName: customer.name,
      customerEmail: customer.email || undefined,
      customerPhone: customer.phone || undefined,
      petName: pet?.name || undefined,
      service: job.service,
      price: invoice.total_amount,
      businessName: businessName,
    };
    
    downloadInvoicePDF(pdfData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Invoice not found'}
        <Link href="/invoices" className="block mt-2 text-[#2D9CDB] hover:underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Invoice Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Invoice</div>
            <div className="text-2xl font-bold text-gray-900">#{invoice.id.slice(0, 8).toUpperCase()}</div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Created</div>
            <div className="font-medium text-gray-900">{formatDate(invoice.created_at)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Due Date</div>
            <div className="font-medium text-gray-900">{formatDate(invoice.due_date)}</div>
          </div>
          {invoice.paid_at && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Paid On</div>
              <div className="font-medium text-green-600">{formatDate(invoice.paid_at)}</div>
            </div>
          )}
        </div>

        {job && (
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-gray-600 mb-1">Service</div>
            <div className="font-medium text-gray-900">{job.service}</div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-[#F2994A]">{formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {customer && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h2>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">{customer.name}</div>
            {customer.phone && <div className="text-gray-600">{customer.phone}</div>}
            {customer.email && <div className="text-gray-600">{customer.email}</div>}
            {pet && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm text-gray-600">Pet: <span className="text-gray-900">{pet.name}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-[#2D9CDB] text-white font-medium rounded-lg hover:bg-[#2578A9] transition-colors inline-flex items-center"
          >
            📄 Download PDF
          </button>
          
          {invoice.status !== 'paid' && (
            <button
              onClick={() => handleStatusChange('paid')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              ✓ Mark as Paid
            </button>
          )}
          
          {invoice.status === 'paid' && (
            <button
              onClick={() => handleStatusChange('unpaid')}
              disabled={updating}
              className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              ↩️ Mark as Unpaid
            </button>
          )}
          
          {invoice.status !== 'overdue' && (
            <button
              onClick={() => handleStatusChange('overdue')}
              disabled={updating}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              ⚠️ Mark as Overdue
            </button>
          )}
        </div>
      </div>

      {/* Job Link */}
      {job && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Appointment</h2>
          <Link
            href={`/jobs/${job.id}`}
            className="text-[#2D9CDB] hover:underline"
          >
            View appointment from {formatDate(job.date)} →
          </Link>
        </div>
      )}
    </div>
  );
}
