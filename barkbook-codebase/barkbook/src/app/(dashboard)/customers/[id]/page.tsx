'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCustomer, getPets, getJobsByCustomer, deleteCustomer, deletePet } from '@/lib/data';
import type { Customer, Pet, Job } from '@/lib/types';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerData();
  }, [params.id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const customerId = params.id as string;
      const customerData = await getCustomer(customerId);
      const petsData = await getPets(customerId);
      const jobsData = await getJobsByCustomer(customerId);
      
      setCustomer(customerData);
      setPets(petsData);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirm('Are you sure you want to delete this customer? This will also delete all their pets and appointments.')) {
      return;
    }
    
    try {
      await deleteCustomer(params.id as string);
      router.push('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer');
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) {
      return;
    }
    
    try {
      setDeletingPetId(petId);
      await deletePet(petId);
      // Refresh the list
      fetchCustomerData();
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError('Failed to delete pet');
    } finally {
      setDeletingPetId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Customer not found</p>
        <Link href="/customers" className="text-[#2D9CDB] hover:underline mt-2 inline-block">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/customers" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        </div>
        <button
          onClick={handleDeleteCustomer}
          className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          🗑️ Delete Customer
        </button>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">📞</span>
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">✉️</span>
                  <span className="text-gray-700">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">📍</span>
                  <span className="text-gray-700">{customer.address}</span>
                </div>
              )}
            </div>
          </div>
          <Link
            href={`/customers/${customer.id}/edit`}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Pets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pets</h2>
          <Link
            href={`/customers/${customer.id}/pets/new`}
            className="px-3 py-1.5 bg-[#F2994A] text-white text-sm font-medium rounded-lg hover:bg-[#D6822E] transition-colors"
          >
            ➕ Add Pet
          </Link>
        </div>
        
        {pets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-2">No pets yet</p>
            <Link
              href={`/customers/${customer.id}/pets/new`}
              className="text-[#2D9CDB] hover:underline text-sm"
            >
              Add the first pet
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pets.map((pet) => (
              <div key={pet.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🐕</span>
                      <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                      {pet.breed && (
                        <span className="text-sm text-gray-500">({pet.breed})</span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {pet.age && <div>Age: {pet.age} years</div>}
                      {pet.temperament && <div>Temperament: {pet.temperament}</div>}
                      {pet.notes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
                          📝 {pet.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/customers/${customer.id}/pets/${pet.id}/edit`}
                      className="text-sm text-[#2D9CDB] hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      disabled={deletingPetId === pet.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingPetId === pet.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Appointment History</h2>
          <Link
            href={`/jobs/new?customer=${customer.id}`}
            className="px-3 py-1.5 bg-[#2D9CDB] text-white text-sm font-medium rounded-lg hover:bg-[#2578A9] transition-colors"
          >
            📅 Book Appointment
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-2">No appointments yet</p>
            <Link
              href={`/jobs/new?customer=${customer.id}`}
              className="text-[#2D9CDB] hover:underline text-sm"
            >
              Book the first appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{formatDate(job.date)} at {job.time}</div>
                  <div className="text-sm text-gray-600">{job.service}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(job.price)}</div>
                  <div className={`text-sm capitalize ${
                    job.status === 'completed' ? 'text-green-600' :
                    job.status === 'scheduled' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {job.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
