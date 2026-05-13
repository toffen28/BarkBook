'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCustomer, createPet, getProfileId } from '@/lib/data';
import type { CustomerFormData, PetFormData } from '@/lib/types';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customer, setCustomer] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [pet, setPet] = useState<PetFormData>({
    name: '',
    breed: '',
    age: '',
    temperament: '',
    notes: '',
  });

  const [addPet, setAddPet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get the current user's profile ID
      const profileId = await getProfileId();
      if (!profileId) {
        setError('You must be logged in to add customers');
        setLoading(false);
        return;
      }

      // Create the customer
      const newCustomer = await createCustomer({
        profile_id: profileId,
        name: customer.name,
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null,
      });

      // If add pet is checked and pet name is provided, create the pet
      if (addPet && pet.name) {
        await createPet({
          customer_id: newCustomer.id,
          name: pet.name,
          breed: pet.breed || null,
          age: pet.age ? parseInt(pet.age, 10) : null,
          temperament: pet.temperament || null,
          notes: pet.notes || null,
        });
      }
      
      router.push(`/customers/${newCustomer.id}`);
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/customers"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                placeholder="Customer name"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                placeholder="07700 900000"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                placeholder="Full address"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Pet Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pet Details</h2>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addPet}
                onChange={(e) => setAddPet(e.target.checked)}
                className="w-5 h-5 text-[#2D9CDB] border-gray-300 rounded focus:ring-[#2D9CDB]"
              />
              <span className="text-sm text-gray-600">Add pet</span>
            </label>
          </div>

          {addPet && (
            <div className="space-y-4">
              <div>
                <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Name *
                </label>
                <input
                  id="petName"
                  type="text"
                  value={pet.name}
                  onChange={(e) => setPet({ ...pet, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  placeholder="Pet's name"
                  required={addPet}
                />
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                  Breed
                </label>
                <input
                  id="breed"
                  type="text"
                  value={pet.breed}
                  onChange={(e) => setPet({ ...pet, breed: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    value={pet.age}
                    onChange={(e) => setPet({ ...pet, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                    placeholder="Years"
                  />
                </div>

                <div>
                  <label htmlFor="temperament" className="block text-sm font-medium text-gray-700 mb-2">
                    Temperament
                  </label>
                  <input
                    id="temperament"
                    type="text"
                    value={pet.temperament}
                    onChange={(e) => setPet({ ...pet, temperament: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                    placeholder="e.g., Friendly"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Grooming Notes
                </label>
                <textarea
                  id="notes"
                  value={pet.notes}
                  onChange={(e) => setPet({ ...pet, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  placeholder="e.g., Hates hair dryers, allergic to lavender shampoo"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/customers"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
