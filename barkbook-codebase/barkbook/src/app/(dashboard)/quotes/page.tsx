'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQuotes, getProfileId, getCustomer, getPet } from '@/lib/data';
import type { Quote, Customer, Pet } from '@/lib/types';

interface QuoteWithDetails extends Quote {
  customer?: Customer;
  pet?: Pet;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileId = await getProfileId();
      if (!profileId) {
        setQuotes([]);
        return;
      }

      const quotesData = await getQuotes(profileId);

      const quotesWithDetails = await Promise.all(
        quotesData.map(async (quote) => {
          try {
            const customer = await getCustomer(quote.customer_id);
            let pet: Pet | null = null;
            if (quote.pet_id) {
              pet = await getPet(quote.pet_id);
            }
            return { ...quote, customer: customer || undefined, pet: pet || undefined };
          } catch {
            return quote;
          }
        })
      );

      setQuotes(quotesWithDetails);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

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

  const pendingCount = quotes.filter((q) => q.status === 'draft' || q.status === 'sent').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">
            {pendingCount > 0
              ? `${pendingCount} pending quote${pendingCount > 1 ? 's' : ''} awaiting response`
              : 'Send professional quotes to clients before booking'}
          </p>
        </div>
        <Link
          href="/quotes/new"
          className="px-4 py-2 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors inline-flex items-center"
        >
          📋 Create Quote
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'draft', 'sent', 'accepted', 'declined'] as const).map((f) => (
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

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-lg text-gray-600 mb-4">No quotes found</p>
          <Link href="/quotes/new" className="text-[#2D9CDB] hover:underline font-medium">
            Create your first quote
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      #{quote.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {quote.customer?.name || 'Unknown customer'}
                      {quote.pet ? ` · ${quote.pet.name}` : ''}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {quote.line_items.length} item{quote.line_items.length !== 1 ? 's' : ''} · {formatDate(quote.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(quote.total_amount)}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusStyle(quote.status)}`}
                    >
                      {quote.status}
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
