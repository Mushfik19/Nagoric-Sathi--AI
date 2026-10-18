import React, { useState } from 'react';

export interface CitizenWalkinPayload {
  citizenPhone: string;
  citizenName: string;
  category: string;
  description: string;
  address: string;
  wardId: number;
}

interface CitizenWalkinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CitizenWalkinPayload) => Promise<void> | void;
  wardId: number;
}

export const CitizenWalkinModal: React.FC<CitizenWalkinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wardId,
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('waste');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !description || !address) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        citizenPhone: phone,
        citizenName: name,
        category,
        description,
        address,
        wardId,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="civic-card bg-[var(--paper)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[var(--line)]">
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--ink)]">
              নাগরিক ওয়াক-ইন অভিযোগ এন্ট্রি (Walk-in Intake)
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">সহায়তাপ্রাপ্ত নাগরিক সেবা ডেস্ক</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">নাগরিকের মোবাইল নম্বর *</label>
              <input
                type="tel"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">নাগরিকের নাম</label>
              <input
                type="text"
                placeholder="নাম (ঐচ্ছিক)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">সমস্যার বিভাগ *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
            >
              <option value="waste">বর্জ্য ব্যবস্থাপনা (Waste Management)</option>
              <option value="drainage">ড্রেনেজ ও নর্দমা (Drainage & Sewerage)</option>
              <option value="road_engineering">সড়ক ও অবকাঠামো (Roads)</option>
              <option value="lighting">সড়ক বাতি ও বিদ্যুৎ (Street Lighting)</option>
              <option value="water_supply">পানি সরবরাহ (Water Supply)</option>
              <option value="encroachment">অবৈধ দখল ও ফুটপাত (Encroachment)</option>
              <option value="vector_control">মশা ও রোগ নিয়ন্ত্রণ (Mosquito/Vector)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">ঘটনাস্থলের ঠিকানা / ল্যান্ডমার্ক *</label>
            <input
              type="text"
              placeholder="রোড # ৪, বাড়ি # ১২, ওয়ার্ড ১৯..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">অভিযোগের পূর্ণ বিবরণ *</label>
            <textarea
              rows={3}
              placeholder="নাগরিকের মৌখিক বিবরণ বাংলায় লিখুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--line)] rounded-lg text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-elevated)] font-medium transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--green)] hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition"
            >
              {isSubmitting ? 'দাখিল হচ্ছে...' : 'অভিযোগ দাখিল ও ট্র্যাকিং তৈরি'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
