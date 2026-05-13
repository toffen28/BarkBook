'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createPet } from '@/lib/data';
import type { PetFormData } from '@/lib/types';

export default function NewPetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pet, setPet] = useState<PetFormData>({
    name: '',
    breed: '',
    age: '',
    temperament: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createPet({
        customer_id: params.id as string,
        name: pet.name,
        breed: pet.breed || null,
        age: pet.age ? parseInt(pet.age, 10) : null,
        temperament: pet.temperament || null,
        notes: pet.notes || null,
      });
      
      router.push(`/customers/${params.id}`);
    } catch (err) {
      console.error('Error creating pet:', err);
      setError('Failed to create pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/customers/${params.id}`}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Pet</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Pet Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name *
              </label>
              <input
                id="name"
                type="text"
                value={pet.name}
                onChange={(e) => setPet({ ...pet, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                placeholder="Pet's name"
                required
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
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={`/customers/${params.id}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Pet'}
          </button>
        </div>
      </form>
    </div>
  );
}
