'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCustomersWithPets } from '@/lib/data';

interface CustomerWithPets {
  id: string;
  profile_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  pets: {
    id: string;
    customer_id: string;
    name: string;
    breed: string | null;
    age: number | null;
    temperament: string | null;
    notes: string | null;
    created_at: string;
  }[];
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerWithPets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      // For MVP, use profile_id 'demo' - in production this would come from auth
      const profileId = 'demo';
      const data = await getCustomersWithPets(profileId);
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">{filteredCustomers.length} total clients</p>
        </div>
        <Link
          href="/customers/new"
          className="px-4 py-2 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors inline-flex items-center"
        >
          ➕ Add Customer
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
        />
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-lg text-gray-600 mb-4">No customers yet</p>
          <Link
            href="/customers/new"
            className="text-[#2D9CDB] hover:underline font-medium"
          >
            Add your first customer
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {customer.phone && <div>📞 {customer.phone}</div>}
                      {customer.email && <div>✉️ {customer.email}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {customer.pets.length} {customer.pets.length === 1 ? 'pet' : 'pets'}
                    </div>
                    <div className="text-[#2D9CDB] text-sm font-medium">
                      View →
                    </div>
                  </div>
                </div>
                {customer.pets.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {customer.pets.map((pet) => (
                      <span
                        key={pet.id}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                      >
                        🐕 {pet.name} {pet.breed && `(${pet.breed})`}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
