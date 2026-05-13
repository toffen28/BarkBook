'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createInvoice, getProfileId, getJob, getCustomer, getPet } from '@/lib/data';
import { generateInvoicePDF } from '@/lib/pdf';
import type { Job, Customer, Pet } from '@/lib/types';

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [businessName, setBusinessName] = useState('');
  
  // Invoice form state
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Default to 14 days from now
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const fetchJobData = async () => {
    if (!jobId) return;
    
    try {
      const jobData = await getJob(jobId);
      if (!jobData) {
        setError('Job not found');
        return;
      }
      setJob(jobData);
      
      // Fetch customer
      const customerData = await getCustomer(jobData.customer_id);
      setCustomer(customerData);
      
      // Fetch pet if exists
      if (jobData.pet_id) {
        const petData = await getPet(jobData.pet_id);
        setPet(petData);
      }
      
      // Set default business name
      setBusinessName("Pam's Pups Grooming");
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load job data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    
    setError('');
    setLoading(true);

    try {
      const profileId = await getProfileId();
      if (!profileId) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      // Create invoice in database
      const invoice = await createInvoice({
        job_id: job.id,
        total_amount: job.price,
        status: 'unpaid',
        due_date: dueDate,
        paid_at: null,
      });

      // Generate and download PDF
      const pdfData = {
        invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString('en-GB'),
        dueDate: new Date(dueDate).toLocaleDateString('en-GB'),
        customerName: customer?.name || 'Customer',
        customerEmail: customer?.email || undefined,
        customerPhone: customer?.phone || undefined,
        petName: pet?.name || undefined,
        service: job.service,
        price: job.price,
        businessName: businessName,
      };
      
      generateInvoicePDF(pdfData);
      
      // Navigate to invoices list
      router.push('/invoices');
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Job Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium text-gray-900">{job.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">{customer?.name}</span>
            </div>
            {pet && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pet:</span>
                <span className="font-medium text-gray-900">{pet.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">{job.date}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="font-bold text-[#F2994A] text-lg">{formatCurrency(job.price)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* PDF Preview Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">📄</span>
            <div>
              <p className="font-medium text-blue-900">PDF Invoice will be generated</p>
              <p className="text-sm text-blue-700 mt-1">
                A professional PDF invoice will be downloaded automatically after creating the invoice. 
                It includes your business name, customer details, service, and total amount.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/invoices"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {loading ? (
              <>Creating...</>
            ) : (
              <>
                📄 Create Invoice & Download PDF
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
