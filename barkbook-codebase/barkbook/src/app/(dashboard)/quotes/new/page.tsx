'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createQuote, getProfileId, getCustomersWithPets, getPets } from '@/lib/data';
import { downloadQuotePDF } from '@/lib/pdf';
import type { Customer, Pet, QuoteLineItem } from '@/lib/types';

interface CustomerWithPets extends Customer {
  pets: Pet[];
}

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<CustomerWithPets[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [customerId, setCustomerId] = useState(searchParams.get('customer') || '');
  const [petId, setPetId] = useState(searchParams.get('pet') || '');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { description: '', price: 0 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId);
      setPets(customer?.pets || []);
      // Reset petId if customer changes
      if (!searchParams.get('pet')) {
        setPetId('');
      }
    } else {
      setPets([]);
    }
  }, [customerId, customers]);

  const fetchData = async () => {
    try {
      const profileId = await getProfileId();
      if (!profileId) return;
      const data = await getCustomersWithPets(profileId);
      setCustomers(data);

      // Pre-fill pets if customer pre-selected
      const preCustomer = searchParams.get('customer');
      if (preCustomer) {
        const found = data.find((c) => c.id === preCustomer);
        if (found) setPets(found.pets);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const addLineItem = () => setLineItems([...lineItems, { description: '', price: 0 }]);

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return; // keep at least one
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    const updated = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      setError('Please select a customer');
      return;
    }

    const validItems = lineItems.filter((li) => li.description.trim() && Number(li.price) > 0);
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description and price');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const profileId = await getProfileId();
      if (!profileId) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const quote = await createQuote({
        profile_id: profileId,
        customer_id: customerId,
        pet_id: petId || null,
        line_items: validItems,
        total_amount: totalAmount,
        status: 'draft',
        notes: notes.trim() || null,
      });

      // Generate PDF for download
      const customer = customers.find((c) => c.id === customerId);
      const pet = pets.find((p) => p.id === petId);

      downloadQuotePDF({
        quoteNumber: quote.id.slice(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString('en-GB'),
        customerName: customer?.name || 'Customer',
        customerEmail: customer?.email || undefined,
        customerPhone: customer?.phone || undefined,
        petName: pet?.name || undefined,
        lineItems: validItems,
        totalAmount,
        notes: notes.trim() || undefined,
        businessName: "BarkBook Grooming",
      });

      router.push(`/quotes/${quote.id}`);
    } catch (err) {
      console.error('Error creating quote:', err);
      setError('Failed to create quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/quotes" className="text-gray-600 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Quote</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Customer & Pet */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Client Details</h2>

          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
              required
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {customerId && pets.length > 0 && (
            <div>
              <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-2">
                Pet (optional)
              </label>
              <select
                id="pet"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
              >
                <option value="">No specific pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.breed ? `(${p.breed})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {customers.length === 0 && (
            <p className="text-sm text-gray-500">
              No customers yet.{' '}
              <Link href="/customers/new" className="text-[#2D9CDB] hover:underline">
                Add a customer first
              </Link>
            </p>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Services & Prices</h2>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Description (e.g. Full Groom)"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  />
                </div>
                <div className="w-28">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.price || ''}
                      onChange={(e) => updateLineItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                  className="mt-0.5 p-3 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove line item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLineItem}
            className="px-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#2D9CDB] hover:text-[#2D9CDB] transition-colors text-sm font-medium w-full"
          >
            + Add Line Item
          </button>

          {/* Total */}
          <div className="pt-3 border-t flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-[#F2994A]">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes (optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes for the client…"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent resize-none"
          />
        </div>

        {/* PDF note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">📋</span>
            <div>
              <p className="font-medium text-blue-900">PDF Quote will be downloaded</p>
              <p className="text-sm text-blue-700 mt-1">
                A professional PDF quote will be downloaded automatically. Share it with your client via WhatsApp or email.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/quotes"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating…' : '📋 Create Quote & Download PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading…</div>}>
      <NewQuoteContent />
    </Suspense>
  );
}
