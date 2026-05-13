'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createJob, getProfileId, getCustomers, getPets } from '@/lib/data';
import type { Customer, Pet, JobFormData } from '@/lib/types';
import { SERVICE_OPTIONS } from '@/lib/types';

function NewJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<JobFormData>({
    customer_id: searchParams.get('customer') || '',
    pet_id: searchParams.get('pet') || '',
    date: searchParams.get('date') || '',
    time: '',
    service: '',
    price: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (formData.customer_id) {
      fetchPetsForCustomer(formData.customer_id);
      setCurrentStep(2);
    }
  }, [formData.customer_id]);

  useEffect(() => {
    if (formData.pet_id) {
      setCurrentStep(3);
    }
  }, [formData.pet_id]);

  useEffect(() => {
    if (formData.date && formData.time) {
      setCurrentStep(4);
    }
  }, [formData.date, formData.time]);

  useEffect(() => {
    if (formData.service && formData.price) {
      setCurrentStep(5);
    }
  }, [formData.service, formData.price]);

  const fetchCustomers = async () => {
    try {
      const profileId = await getProfileId();
      if (!profileId) {
        setError('You must be logged in');
        return;
      }
      const customersData = await getCustomers(profileId);
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchPetsForCustomer = async (customerId: string) => {
    try {
      const petsData = await getPets(customerId);
      setPets(petsData);
    } catch (err) {
      console.error('Error fetching pets:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profileId = await getProfileId();
      if (!profileId) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      await createJob({
        profile_id: profileId,
        customer_id: formData.customer_id,
        pet_id: formData.pet_id || null,
        date: formData.date,
        time: formData.time,
        service: formData.service,
        price: parseFloat(formData.price),
        status: 'scheduled',
        notes: formData.notes || null,
      });
      
      router.push('/calendar');
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);
  const selectedPet = pets.find(p => p.id === formData.pet_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/calendar" className="text-gray-600 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step ? 'bg-[#2D9CDB] text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-12 h-1 mx-2 ${
                  currentStep > step ? 'bg-[#2D9CDB]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Customer</span>
          <span>Pet</span>
          <span>Date/Time</span>
          <span>Service</span>
          <span>Confirm</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Select Customer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Select Customer</h2>
          
          {customers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">No customers yet</p>
              <Link href="/customers/new" className="text-[#2D9CDB] hover:underline">
                Add a customer first
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, customer_id: customer.id, pet_id: '' })}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    formData.customer_id === customer.id
                      ? 'border-[#2D9CDB] bg-[#2D9CDB]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  {customer.phone && <div className="text-sm text-gray-600">{customer.phone}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Pet */}
        {formData.customer_id && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Select Pet</h2>
            
            {pets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No pets for this customer</p>
                <Link href={`/customers/${formData.customer_id}/pets/new`} className="text-[#2D9CDB] hover:underline">
                  Add a pet first
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pet_id: '' })}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    formData.pet_id === ''
                      ? 'border-[#2D9CDB] bg-[#2D9CDB]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">No specific pet</div>
                  <div className="text-sm text-gray-600">General appointment</div>
                </button>
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, pet_id: pet.id })}
                    className={`w-full p-4 rounded-lg border text-left transition-colors ${
                      formData.pet_id === pet.id
                        ? 'border-[#2D9CDB] bg-[#2D9CDB]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>🐕</span>
                      <div>
                        <div className="font-medium text-gray-900">{pet.name}</div>
                        <div className="text-sm text-gray-600">{pet.breed}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {formData.pet_id !== undefined && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Date & Time</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Service & Price */}
        {formData.date && formData.time && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Service & Price</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <select
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  required
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (£)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                  placeholder="Any special notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {formData.service && formData.price && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Confirm Booking</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">{selectedCustomer?.name}</span>
              </div>
              {selectedPet && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pet:</span>
                  <span className="font-medium text-gray-900">{selectedPet.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">{formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-900">{formData.service}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-[#F2994A]">£{formData.price}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {formData.service && formData.price && (
          <div className="flex justify-end space-x-4">
            <Link
              href="/calendar"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <NewJobContent />
    </Suspense>
  );
}
