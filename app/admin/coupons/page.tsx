'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  type CouponType,
  type DbCoupon,
  formatCouponTypeLabel,
  formatCouponValue,
  isCouponValidNow,
} from '@/lib/coupons';

type CouponRow = {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  status: 'Active' | 'Scheduled' | 'Expired' | 'Disabled';
};

const emptyForm = {
  code: '',
  description: '',
  type: 'percentage' as CouponType,
  value: '',
  minimum_purchase: '',
  maximum_discount: '',
  usage_limit: '',
  per_user_limit: '1',
  start_date: '',
  end_date: '',
  is_active: true,
};

function deriveStatus(c: DbCoupon): CouponRow['status'] {
  if (!c.is_active) return 'Disabled';
  const validity = isCouponValidNow(c);
  if (validity === 'This coupon is not active yet') return 'Scheduled';
  if (validity) return 'Expired';
  return 'Active';
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCoupons(
        (data as DbCoupon[] || []).map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description || '',
          type: c.type,
          value: Number(c.value),
          minPurchase: Number(c.minimum_purchase || 0),
          maxDiscount: c.maximum_discount != null ? Number(c.maximum_discount) : null,
          usageLimit: c.usage_limit,
          perUserLimit: c.per_user_limit ?? 1,
          usedCount: c.usage_count ?? 0,
          startDate: c.start_date,
          endDate: c.end_date,
          isActive: c.is_active ?? true,
          status: deriveStatus(c),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon: CouponRow) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: String(coupon.value),
      minimum_purchase: coupon.minPurchase ? String(coupon.minPurchase) : '',
      maximum_discount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
      usage_limit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      per_user_limit: String(coupon.perUserLimit),
      start_date: toDatetimeLocal(coupon.startDate),
      end_date: toDatetimeLocal(coupon.endDate),
      is_active: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      alert('Coupon code is required');
      return;
    }
    const value = parseFloat(form.value);
    if (isNaN(value) || value < 0) {
      alert('Enter a valid discount value');
      return;
    }
    if (form.type === 'percentage' && value > 100) {
      alert('Percentage cannot exceed 100');
      return;
    }

    setSaving(true);
    const payload = {
      code,
      description: form.description.trim() || null,
      type: form.type,
      value,
      minimum_purchase: form.minimum_purchase ? parseFloat(form.minimum_purchase) : 0,
      maximum_discount: form.maximum_discount ? parseFloat(form.maximum_discount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      per_user_limit: form.per_user_limit ? parseInt(form.per_user_limit) : 1,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      await fetchCoupons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      alert('Could not save coupon: ' + message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: CouponRow) => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }
    await fetchCoupons();
  };

  const toggleActive = async (coupon: CouponRow) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.isActive })
      .eq('id', coupon.id);
    if (error) {
      alert('Update failed: ' + error.message);
      return;
    }
    await fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const statusColors: Record<CouponRow['status'], string> = {
    Active: 'bg-green-50 text-green-700',
    Scheduled: 'bg-[#fdf9ec] text-[#C8952A]',
    Expired: 'bg-gray-100 text-gray-700',
    Disabled: 'bg-red-50 text-red-700',
  };

  const filtered = statusFilter === 'all'
    ? coupons
    : coupons.filter((c) => c.status.toLowerCase() === statusFilter);

  const activeCoupons = coupons.filter((c) => c.status === 'Active');
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons & Promotions</h1>
          <p className="text-gray-600 mt-1">Create and manage discount codes</p>
        </div>
        <button
          onClick={openNew}
          className="bg-[#111111] hover:bg-[#333] text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line mr-2"></i>
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-[#C8952A]">{activeCoupons.length}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Uses</p>
          <p className="text-2xl font-bold text-gray-900">{totalUses}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Active Codes</p>
          <p className="text-2xl font-bold text-[#C8952A]">{activeCoupons.map((c) => c.code).slice(0, 1).join('') || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">All Coupons</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Code</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Value</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Min Purchase</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Usage</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Valid Period</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading coupons...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No coupons found.</td></tr>
              ) : (
                filtered.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">{coupon.code}</span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#C8952A] hover:bg-[#fdf9ec] rounded transition-colors cursor-pointer"
                          title="Copy code"
                        >
                          <i className="ri-file-copy-line"></i>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{formatCouponTypeLabel(coupon.type)}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {formatCouponValue(coupon.type, coupon.value)}
                    </td>
                    <td className="py-4 px-4 text-gray-700 whitespace-nowrap">
                      {coupon.minPurchase > 0 ? `CA$${coupon.minPurchase.toFixed(2)}` : 'No minimum'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{coupon.usedCount}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-600">{coupon.usageLimit ?? '∞'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700 whitespace-nowrap">
                        {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Immediate'}
                      </p>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'No expiry'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[coupon.status]}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#C8952A] hover:bg-[#fdf9ec] rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => toggleActive(coupon)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#C8952A] hover:bg-[#fdf9ec] rounded-lg transition-colors cursor-pointer"
                          title={coupon.isActive ? 'Disable' : 'Enable'}
                        >
                          <i className={`${coupon.isActive ? 'ri-pause-circle-line' : 'ri-play-circle-line'} text-lg`}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. WELCOME10"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. 10% off your first order"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CouponType }))}
                    className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] cursor-pointer"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Value {form.type === 'percentage' ? '(%)' : form.type === 'fixed_amount' ? '(CA$)' : ''}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={form.type === 'percentage' ? 1 : 0.01}
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    disabled={form.type === 'free_shipping'}
                    placeholder={form.type === 'free_shipping' ? 'N/A' : '0'}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Min Purchase (CA$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.minimum_purchase}
                    onChange={(e) => setForm((f) => ({ ...f, minimum_purchase: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Max Discount (CA$)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.maximum_discount}
                      onChange={(e) => setForm((f) => ({ ...f, maximum_discount: e.target.value }))}
                      placeholder="Optional"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usage_limit}
                    onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Per User Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.per_user_limit}
                    onChange={(e) => setForm((f) => ({ ...f, per_user_limit: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-5 h-5 accent-[#C8952A]"
                />
                <span className="text-sm font-medium text-gray-900">Active — customers can use this code</span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#111111] text-white rounded-lg font-semibold hover:bg-[#333] disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
