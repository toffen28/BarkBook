'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInvoices, getProfileId, getJob, getCustomer, getPet } from '@/lib/data';
import type { Invoice, Job, Customer, Pet } from '@/lib/types';

interface InvoiceWithDetails extends Invoice {
  job?: Job;
  customer?: Customer;
  pet?: Pet;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileId = await getProfileId();
      if (!profileId) {
        setInvoices([]);
        return;
      }
      
      const invoicesData = await getInvoices(profileId);
      
      // Fetch related data for each invoice
      const invoicesWithDetails = await Promise.all(
        invoicesData.map(async (invoice) => {
          try {
            const job = await getJob(invoice.job_id);
            let customer: Customer | null = null;
            let pet: Pet | null = null;
            
            if (job) {
              customer = await getCustomer(job.customer_id);
              if (job.pet_id) {
                pet = await getPet(job.pet_id);
              }
            }
            
            return {
              ...invoice,
              job: job || undefined,
              customer: customer || undefined,
              pet: pet || undefined,
            };
          } catch {
            return invoice;
          }
        })
      );
      
      setInvoices(invoicesWithDetails);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

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

  const totalOutstanding = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Track your payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">Outstanding</div>
            <div className="text-xl font-bold text-[#F2994A]">{formatCurrency(totalOutstanding)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unpaid', 'paid', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-[#2D9CDB] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg text-gray-600 mb-4">No invoices found</p>
          <Link href="/jobs/new" className="text-[#2D9CDB] hover:underline font-medium">
            Book an appointment to create an invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          #{invoice.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {invoice.customer?.name || 'Customer'} • {invoice.pet?.name || invoice.job?.service}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</div>
                      <div className="text-sm text-gray-600">Due: {formatDate(invoice.due_date)}</div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
