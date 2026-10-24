import React, { useState } from 'react';
import { 
  X, 
  Utensils, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  Clock, 
  Building2, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';
import { FOOD_CATEGORIES, QUANTITY_UNITS, STORAGE_CONDITIONS } from '../../data/sampleDonations';
import { DEMO_LOCALITIES } from '../../data/ngoProfiles';

export function DonationFormModal({ isOpen, onClose }) {
  const { addDonation } = useDonations();
  const { currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Cooked Meals',
    quantity: '',
    unit: 'meals',
    storageCondition: 'Hot & Insulated',
    pickupAddress: currentUser?.locality || '',
    collectionDeadline: '',
    contactName: currentUser?.fullName || '',
    contactPhone: currentUser?.phone || '',
    donorOrg: currentUser?.orgName || '',
    notes: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Helper to prefill deadline for quick testing (e.g. +3 hours from now)
  const setQuickDeadline = (hours) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    // Format to datetime-local input string: YYYY-MM-DDTHH:mm
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setFormData((prev) => ({ ...prev, collectionDeadline: localIso }));
    if (errors.collectionDeadline) {
      setErrors((prev) => ({ ...prev, collectionDeadline: null }));
    }
  };

  // Autofill with realistic test data for easy hackathon testing
  const handleFillDemo = () => {
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date(Date.now() + 3.5 * 60 * 60 * 1000);
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    setFormData({
      foodName: 'Paneer Kulcha & Chana Masala (60 Portions)',
      category: 'Cooked Meals',
      quantity: '60',
      unit: 'meals',
      storageCondition: 'Hot & Insulated',
      pickupAddress: 'Saffron Heritage Banquet, Plot 12, Indirapuram, Ghaziabad',
      collectionDeadline: localIso,
      contactName: 'Vikram Sethi (Banquet Captain)',
      contactPhone: '+91 98112 88990',
      donorOrg: 'Saffron Heritage Banquets',
      notes: 'Prepared fresh for an afternoon corporate reception. Packed neatly in foil boxes.'
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.foodName.trim()) {
      newErrors.foodName = 'Please enter what food is available.';
    }

    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid positive quantity.';
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'A specific pickup address is required for NGO collection.';
    }

    if (!formData.collectionDeadline) {
      newErrors.collectionDeadline = 'Please specify when food must be collected by before spoiling.';
    } else {
      const selected = new Date(formData.collectionDeadline);
      if (selected <= new Date()) {
        newErrors.collectionDeadline = 'Collection deadline must be in the future.';
      }
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Please provide a point of contact at the pickup location.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      addDonation(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ form: 'An unexpected error occurred while saving the donation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-forest-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-terracotta-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Post Food Donation</h2>
              <p className="text-xs text-forest-200">
                RescuePlate &bull; Instant broadcast to verified local shelters & NGOs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs bg-forest-800 hover:bg-forest-700 text-terracotta-300 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              title="Autofill realistic test data"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo Form</span>
            </button>
            <button
              onClick={onClose}
              className="text-forest-300 hover:text-white p-1 rounded-lg hover:bg-forest-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {errors.form && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* 1. Food Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Food Item Name / Description <span className="text-terracotta-500">*</span>
            </label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              placeholder="e.g. 50 Freshly Packed Veg Biryani & Raita Boxes"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
                errors.foodName ? 'border-red-400 focus:ring-red-200 bg-red-50/20' : 'border-stone-300 focus:border-forest-700 focus:ring-forest-100'
              }`}
            />
            {errors.foodName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.foodName}
              </p>
            )}
          </div>

          {/* 2. Category & Quantity row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Category <span className="text-terracotta-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Quantity <span className="text-terracotta-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                step="any"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 40"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.quantity ? 'border-red-400 focus:ring-red-200 bg-red-50/20' : 'border-stone-300 focus:border-forest-700 focus:ring-forest-100'
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Unit <span className="text-terracotta-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
              >
                {QUANTITY_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Storage Condition & Donor Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Storage / Condition
              </label>
              <select
                name="storageCondition"
                value={formData.storageCondition}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
              >
                {STORAGE_CONDITIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Donor Business / Org (Optional)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="donorOrg"
                  value={formData.donorOrg}
                  onChange={handleChange}
                  placeholder="e.g. Royal Banquet Hall / Café Aroma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
                />
              </div>
            </div>
          </div>

          {/* 4. Collection Deadline with quick buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Collection Deadline (Spoilage Cutoff) <span className="text-terracotta-500">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <span>Quick set:</span>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(2)}
                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  +2 hrs
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(4)}
                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  +4 hrs
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(8)}
                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  +8 hrs
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="datetime-local"
                name="collectionDeadline"
                value={formData.collectionDeadline}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.collectionDeadline ? 'border-red-400 focus:ring-red-200 bg-red-50/20' : 'border-stone-300 focus:border-forest-700 focus:ring-forest-100'
                }`}
              />
            </div>
            {errors.collectionDeadline ? (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.collectionDeadline}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-stone-500">
                Specifying an accurate cutoff prevents unsafe consumption. High urgency is triggered if &lt;3 hours.
              </p>
            )}
          </div>

          {/* 5. Pickup Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Pickup Address & Locality <span className="text-terracotta-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="e.g. Service Gate 2, Hotel Golden Palms, Sector 62, Noida"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.pickupAddress ? 'border-red-400 focus:ring-red-200 bg-red-50/20' : 'border-stone-300 focus:border-forest-700 focus:ring-forest-100'
                }`}
              />
            </div>
            {/* Quick verified demo locality chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-stone-400">Demo Localities:</span>
              {DEMO_LOCALITIES.slice(0, 5).map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, pickupAddress: `${loc.name}, New Delhi NCR` }));
                    if (errors.pickupAddress) setErrors(prev => ({ ...prev, pickupAddress: null }));
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  {loc.name.split(',')[0]}
                </button>
              ))}
            </div>
            {errors.pickupAddress && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.pickupAddress}
              </p>
            )}
          </div>

          {/* 6. Contact Name & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Contact Person Name <span className="text-terracotta-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar (Kitchen Mgr)"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.contactName ? 'border-red-400 focus:ring-red-200 bg-red-50/20' : 'border-stone-300 focus:border-forest-700 focus:ring-forest-100'
                  }`}
                />
              </div>
              {errors.contactName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.contactName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
                />
              </div>
            </div>
          </div>

          {/* 7. Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Handling Notes / Pickup Instructions (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Please bring insulated container boxes. Park at rear service entrance."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-terracotta-400" />
              <span>{isSubmitting ? 'Posting...' : 'Confirm & Post Donation'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
