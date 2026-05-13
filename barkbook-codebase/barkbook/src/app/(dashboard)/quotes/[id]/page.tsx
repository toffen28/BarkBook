'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getQuote,
  updateQuote,
  deleteQuote,
  convertQuoteToJob,
  getCustomer,
  getPet,
} from '@/lib/data';
import { downloadQuotePDF } from '@/lib/pdf';
import type { Quote, Customer, Pet } from '@/lib/types';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Convert-to-job modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertDate, setConvertDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [convertTime, setConvertTime] = useState('09:00');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchQuoteData();
  }, [params.id]);

  const fetchQuoteData = async () => {
    try {
      setLoading(true);
      setError(null);

      const quoteData = await getQuote(params.id as string);
      if (!quoteData) {
        setError('Quote not found');
        return;
      }
      setQuote(quoteData);

      const customerData = await getCustomer(quoteData.customer_id);
      setCustomer(customerData);

      if (quoteData.pet_id) {
        const petData = await getPet(quoteData.pet_id);
        setPet(petData);
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Quote['status']) => {
    if (!quote) return;
    try {
      setUpdating(true);
      const updated = await updateQuote(quote.id, { status: newStatus });
      setQuote(updated);
    } catch (err) {
      console.error('Error updating quote:', err);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await deleteQuote(quote.id);
      router.push('/quotes');
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError('Failed to delete quote');
    }
  };

  const handleDownloadPDF = () => {
    if (!quote || !customer) return;
    downloadQuotePDF({
      quoteNumber: quote.id.slice(0, 8).toUpperCase(),
      date: new Date(quote.created_at).toLocaleDateString('en-GB'),
      customerName: customer.name,
      customerEmail: customer.email || undefined,
      customerPhone: customer.phone || undefined,
      petName: pet?.name || undefined,
      lineItems: quote.line_items,
      totalAmount: quote.total_amount,
      notes: quote.notes || undefined,
      businessName: 'BarkBook Grooming',
    });
  };

  const handleConvertToJob = async () => {
    if (!quote) return;
    setConverting(true);
    try {
      const job = await convertQuoteToJob(quote, convertDate, convertTime);
      // Refresh quote state (status will now be 'accepted')
      const updated = await getQuote(quote.id);
      if (updated) setQuote(updated);
      setShowConvertModal(false);
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      console.error('Error converting quote:', err);
      setError('Failed to convert quote to appointment');
    } finally {
      setConverting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Quote not found'}
        <Link href="/quotes" className="block mt-2 text-[#2D9CDB] hover:underline">
          Back to quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/quotes" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Quote Details</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          🗑️ Delete
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Quote summary card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Quote</div>
            <div className="text-2xl font-bold text-gray-900">#{quote.id.slice(0, 8).toUpperCase()}</div>
            <div className="text-sm text-gray-500 mt-1">Created {formatDate(quote.created_at)}</div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusStyle(quote.status)}`}>
            {quote.status}
          </span>
        </div>

        {/* Client */}
        {customer && (
          <div className="mb-6 pb-6 border-b">
            <div className="text-sm font-medium text-gray-500 mb-2">QUOTE FOR</div>
            <div className="font-semibold text-gray-900">{customer.name}</div>
            {customer.email && <div className="text-sm text-gray-600">{customer.email}</div>}
            {customer.phone && <div className="text-sm text-gray-600">{customer.phone}</div>}
            {pet && (
              <div className="mt-2 text-sm text-gray-600">
                Pet: <span className="font-medium text-gray-900">{pet.name}</span>
                {pet.breed ? ` (${pet.breed})` : ''}
              </div>
            )}
          </div>
        )}

        {/* Line items */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-500 mb-3">SERVICES</div>
          <div className="space-y-2">
            {quote.line_items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-900">{item.description}</span>
                <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 mt-2">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#F2994A]">{formatCurrency(quote.total_amount)}</span>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">NOTES</div>
            <p className="text-gray-700 text-sm">{quote.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

        <div className="flex flex-wrap gap-3">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-[#2D9CDB] text-white font-medium rounded-lg hover:bg-[#2578A9] transition-colors"
          >
            📄 Download PDF
          </button>

          {/* Status changes */}
          {quote.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('sent')}
              disabled={updating}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              📤 Mark as Sent
            </button>
          )}

          {(quote.status === 'sent' || quote.status === 'draft') && (
            <>
              <button
                onClick={() => handleStatusChange('accepted')}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                ✓ Mark as Accepted
              </button>
              <button
                onClick={() => handleStatusChange('declined')}
                disabled={updating}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                ✗ Mark as Declined
              </button>
            </>
          )}

          {/* Convert to Job — available once accepted */}
          {quote.status === 'accepted' && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="px-4 py-2 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors"
            >
              📅 Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* Convert-to-Job Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-600">
              This quote will be converted into a scheduled appointment. Choose a date and time.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={convertDate}
                onChange={(e) => setConvertDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={convertTime}
                onChange={(e) => setConvertTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                required
              />
            </div>

            {/* Quote summary */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{customer?.name}</span>
              </div>
              {pet && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pet:</span>
                  <span className="font-medium">{pet.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-[#F2994A]">{formatCurrency(quote.total_amount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConvertModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToJob}
                disabled={converting}
                className="flex-1 px-4 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50"
              >
                {converting ? 'Booking…' : '✓ Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
