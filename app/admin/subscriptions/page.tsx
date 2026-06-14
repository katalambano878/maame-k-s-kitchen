'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  defaultSelectionDeadline,
  getNextWeekday,
  getWeekStartMonday,
  nowInCalgary,
  toDateString,
} from '@/lib/subscription-dates';

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  meals_per_week: number;
  price_cents: number;
  cancel_notice_days: number;
  delivery_day: string;
  status: string;
  sort_order: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
};

const emptyPlanForm = {
  name: '',
  slug: '',
  description: '',
  meals_per_week: 5,
  price_dollars: '',
  cancel_notice_days: 3,
  delivery_day: 'saturday',
  status: 'active',
  sort_order: 0,
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

type Week = {
  id: string;
  week_start: string;
  delivery_date: string;
  selection_deadline: string;
  status: string;
  notes: string | null;
};

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<'plans' | 'weekly' | 'subscribers'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberProfiles, setSubscriberProfiles] = useState<Record<string, { email?: string; full_name?: string }>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);

  const [weekForm, setWeekForm] = useState({
    delivery_date: '',
    notes: '',
    status: 'draft',
    productIds: [] as string[],
  });
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
  const [savingWeek, setSavingWeek] = useState(false);

  const [showAddDish, setShowAddDish] = useState(false);
  const [newDish, setNewDish] = useState({ name: '', price: '', description: '' });
  const [dishImageFile, setDishImageFile] = useState<File | null>(null);
  const [addingDish, setAddingDish] = useState(false);
  const [dishSearch, setDishSearch] = useState('');

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [savingPlan, setSavingPlan] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [plansRes, weeksRes, subsRes, productsRes] = await Promise.all([
      supabase.from('subscription_plans').select('*').order('sort_order'),
      supabase.from('meal_prep_weeks').select('*').order('week_start', { ascending: false }),
      supabase.from('meal_prep_subscriptions').select(`
        *,
        subscription_plans ( name, meals_per_week )
      `).order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, status').eq('status', 'active').order('name'),
    ]);
    setPlans(plansRes.data || []);
    setWeeks(weeksRes.data || []);
    const subs = subsRes.data || [];
    setSubscribers(subs);
    if (subs.length) {
      const userIds = subs.map((s) => s.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').in('id', userIds);
      const map: Record<string, { email?: string; full_name?: string }> = {};
      (profiles || []).forEach((p) => { map[p.id] = p; });
      setSubscriberProfiles(map);
    }
    setProducts(productsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token || '');
    });
    fetchAll();
  }, []);

  const openNewPlan = () => {
    setEditingPlanId(null);
    setSlugManual(false);
    setPlanForm({
      ...emptyPlanForm,
      sort_order: plans.length,
    });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setSlugManual(true);
    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      meals_per_week: plan.meals_per_week,
      price_dollars: (plan.price_cents / 100).toFixed(2),
      cancel_notice_days: plan.cancel_notice_days,
      delivery_day: plan.delivery_day || 'saturday',
      status: plan.status,
      sort_order: plan.sort_order,
    });
    setShowPlanModal(true);
  };

  const savePlan = async () => {
    if (!planForm.name.trim()) return alert('Plan name is required');
    const priceCents = Math.round(parseFloat(planForm.price_dollars) * 100);
    if (!priceCents || priceCents <= 0) return alert('Enter a valid weekly price');

    const slug = planForm.slug.trim() || slugify(planForm.name);
    const existing = plans.find((p) => p.slug === slug && p.id !== editingPlanId);
    if (existing) return alert('Another plan already uses this slug');

    setSavingPlan(true);
    try {
      const previous = editingPlanId ? plans.find((p) => p.id === editingPlanId) : null;
      const priceChanged = previous && previous.price_cents !== priceCents;

      const row = {
        name: planForm.name.trim(),
        slug,
        description: planForm.description.trim() || null,
        meals_per_week: planForm.meals_per_week,
        price_cents: priceCents,
        cancel_notice_days: planForm.cancel_notice_days,
        delivery_day: planForm.delivery_day,
        status: planForm.status,
        sort_order: planForm.sort_order,
        updated_at: new Date().toISOString(),
        ...(priceChanged ? { stripe_price_id: null } : {}),
      };

      if (editingPlanId) {
        const { error } = await supabase.from('subscription_plans').update(row).eq('id', editingPlanId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subscription_plans').insert(row);
        if (error) throw error;
      }

      await fetchAll();
      setShowPlanModal(false);
      if (priceChanged) {
        alert('Plan saved. Price changed — click Sync to Stripe before customers can subscribe.');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to save plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const archivePlan = async (plan: Plan) => {
    if (!confirm(`Archive "${plan.name}"? It will no longer appear on the subscribe page.`)) return;
    const { error } = await supabase
      .from('subscription_plans')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', plan.id);
    if (error) alert(error.message);
    else await fetchAll();
  };

  const syncPlan = async (planId: string) => {
    setSyncing(planId);
    try {
      const res = await fetch('/api/subscriptions/sync-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, token }),
      });
      const json = await res.json();
      if (json.success) await fetchAll();
      else alert(json.message || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const startNewWeek = () => {
    const now = nowInCalgary();
    const delivery = getNextWeekday(now, 'saturday');
    setEditingWeekId(null);
    setWeekForm({
      delivery_date: toDateString(delivery),
      notes: '',
      status: 'draft',
      productIds: [],
    });
  };

  const editWeek = async (week: Week) => {
    setEditingWeekId(week.id);
    const { data: items } = await supabase
      .from('meal_prep_week_items')
      .select('product_id')
      .eq('week_id', week.id);
    setWeekForm({
      delivery_date: week.delivery_date,
      notes: week.notes || '',
      status: week.status,
      productIds: (items || []).map((i) => i.product_id),
    });
  };

  const saveWeek = async () => {
    if (!weekForm.delivery_date) return alert('Delivery date required');
    setSavingWeek(true);
    try {
      const delivery = new Date(weekForm.delivery_date + 'T12:00:00');
      const weekStart = getWeekStartMonday(delivery);
      const deadline = defaultSelectionDeadline(delivery, 3);

      let weekId = editingWeekId;
      const weekRow = {
        week_start: toDateString(weekStart),
        delivery_date: weekForm.delivery_date,
        selection_deadline: deadline.toISOString(),
        status: weekForm.status,
        notes: weekForm.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (weekId) {
        await supabase.from('meal_prep_weeks').update(weekRow).eq('id', weekId);
      } else {
        const { data, error } = await supabase.from('meal_prep_weeks').insert(weekRow).select('id').single();
        if (error) throw error;
        weekId = data.id;
      }

      await supabase.from('meal_prep_week_items').delete().eq('week_id', weekId);
      if (weekForm.productIds.length) {
        await supabase.from('meal_prep_week_items').insert(
          weekForm.productIds.map((product_id, index) => ({
            week_id: weekId,
            product_id,
            sort_order: index,
          }))
        );
      }

      await fetchAll();
      setEditingWeekId(null);
      startNewWeek();
    } catch (e: any) {
      alert(e.message || 'Failed to save week');
    } finally {
      setSavingWeek(false);
    }
  };

  const toggleProduct = (id: string) => {
    setWeekForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
  };

  const generateSku = () =>
    `MKK-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  const addDish = async () => {
    const name = newDish.name.trim();
    if (!name) return alert('Dish name is required');
    const price = parseFloat(newDish.price);
    if (isNaN(price) || price < 0) return alert('Enter a valid price');

    setAddingDish(true);
    try {
      let imageUrl = '';
      if (dishImageFile) {
        const ext = dishImageFile.name.split('.').pop();
        const path = `dishes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('products').upload(path, dishImageFile);
        if (!upErr) {
          imageUrl = supabase.storage.from('products').getPublicUrl(path).data.publicUrl;
        }
      }

      const baseSlug = slugify(name);
      let productId: string | null = null;
      let attempt = 0;
      let lastError: any = null;
      while (attempt < 5) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        const { data, error } = await supabase
          .from('products')
          .insert({
            name,
            price,
            slug,
            status: 'active',
            sku: generateSku(),
            quantity: 0,
            description: newDish.description.trim() || null,
          })
          .select('id')
          .single();
        if (!error && data) {
          productId = data.id;
          break;
        }
        if (error?.code === '23505') {
          attempt++;
          lastError = error;
          continue;
        }
        throw error;
      }
      if (!productId) throw lastError || new Error('Could not create dish');

      if (imageUrl) {
        await supabase.from('product_images').insert({ product_id: productId, url: imageUrl, position: 0 });
      }

      await fetchAll();
      setWeekForm((f) => ({ ...f, productIds: [...f.productIds, productId as string] }));
      setNewDish({ name: '', price: '', description: '' });
      setDishImageFile(null);
      setShowAddDish(false);
    } catch (e: any) {
      alert(e.message || 'Failed to add dish');
    } finally {
      setAddingDish(false);
    }
  };

  useEffect(() => {
    if (!editingWeekId && weeks.length === 0) startNewWeek();
  }, [weeks.length, editingWeekId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meal Prep Subscriptions</h1>
      <p className="text-gray-500 mb-8">Manage plans, publish weekly menus, and view subscribers.</p>

      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {(['weekly', 'plans', 'subscribers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-[#C8952A] text-[#C8952A]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'weekly' ? 'Weekly Menu' : t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tab === 'plans' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Create your own weekly meal-prep plans — name, price, and how many meals per week. Sync each plan to Stripe before customers can subscribe.
            </p>
            <button
              onClick={openNewPlan}
              className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              + Add Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-gray-300 text-center">
              <p className="text-gray-600 mb-4">No subscription plans yet. Add your first plan (e.g. 5 meals per week at your price).</p>
              <button onClick={openNewPlan} className="px-5 py-2.5 rounded-xl bg-[#C8952A] text-white text-sm font-semibold">
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="p-5 rounded-xl border border-gray-200 bg-white flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        plan.status === 'active' ? 'bg-[#fdf9ec] text-[#a07020]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{plan.description}</p>
                    )}
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      {plan.meals_per_week} meals/week · CA${(plan.price_cents / 100).toFixed(2)}/week
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Cancel notice: {plan.cancel_notice_days} days before {plan.delivery_day} delivery · Stripe:{' '}
                      {plan.stripe_price_id ? 'synced' : 'not synced — required before subscribe'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditPlan(plan)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => syncPlan(plan.id)}
                      disabled={syncing === plan.id || plan.status !== 'active'}
                      className="px-3 py-2 rounded-lg bg-[#111111] text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {syncing === plan.id ? 'Syncing...' : 'Sync to Stripe'}
                    </button>
                    {plan.status === 'active' && (
                      <button
                        onClick={() => archivePlan(plan)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showPlanModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{editingPlanId ? 'Edit Plan' : 'New Subscription Plan'}</h2>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Plan name *</label>
                  <input
                    value={planForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setPlanForm((f) => ({
                        ...f,
                        name,
                        slug: slugManual ? f.slug : slugify(name),
                      }));
                    }}
                    placeholder="e.g. Family — 5 Meals"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">URL slug</label>
                  <input
                    value={planForm.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setPlanForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="What customers see on the subscribe page"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Meals per week *</label>
                    <input
                      type="number"
                      min={1}
                      max={21}
                      value={planForm.meals_per_week}
                      onChange={(e) => setPlanForm((f) => ({ ...f, meals_per_week: parseInt(e.target.value, 10) || 1 }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Weekly price (CAD) *</label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={planForm.price_dollars}
                      onChange={(e) => setPlanForm((f) => ({ ...f, price_dollars: e.target.value }))}
                      placeholder="70.00"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Cancel notice (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={planForm.cancel_notice_days}
                      onChange={(e) => setPlanForm((f) => ({ ...f, cancel_notice_days: parseInt(e.target.value, 10) || 3 }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Days before delivery customers must cancel by</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Delivery day</label>
                    <select
                      value={planForm.delivery_day}
                      onChange={(e) => setPlanForm((f) => ({ ...f, delivery_day: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Status</label>
                    <select
                      value={planForm.status}
                      onChange={(e) => setPlanForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="active">Active (visible on site)</option>
                      <option value="archived">Archived (hidden)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Sort order</label>
                    <input
                      type="number"
                      value={planForm.sort_order}
                      onChange={(e) => setPlanForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={savePlan}
                    disabled={savingPlan}
                    className="flex-1 py-3 rounded-xl bg-[#111111] text-white font-semibold text-sm disabled:opacity-50"
                  >
                    {savingPlan ? 'Saving...' : editingPlanId ? 'Save Changes' : 'Create Plan'}
                  </button>
                  <button
                    onClick={() => setShowPlanModal(false)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  After saving, click <strong>Sync to Stripe</strong> on the plan so customers can subscribe and pay weekly.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : tab === 'subscribers' ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold">Plan</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Next billing</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-400">No subscribers yet</td></tr>
              ) : subscribers.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="p-3">{subscriberProfiles[s.user_id]?.full_name || subscriberProfiles[s.user_id]?.email || s.user_id}</td>
                  <td className="p-3">{s.subscription_plans?.name}</td>
                  <td className="p-3 capitalize">{s.cancel_at_period_end ? 'cancelling' : s.status}</td>
                  <td className="p-3">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('en-CA') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900">Published Weeks</h2>
            {weeks.map((w) => (
              <button
                key={w.id}
                onClick={() => editWeek(w)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  editingWeekId === w.id ? 'border-[#C8952A] bg-[#fdf9ec]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">
                  Week of {w.week_start} · Delivery {w.delivery_date}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{w.status}</p>
              </button>
            ))}
            <button onClick={startNewWeek} className="text-sm text-[#C8952A] font-semibold hover:underline">
              + New weekly menu
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white space-y-5">
            <h2 className="font-bold text-gray-900">{editingWeekId ? 'Edit Week' : 'Create Weekly Menu'}</h2>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Saturday delivery date</label>
              <input
                type="date"
                value={weekForm.delivery_date}
                onChange={(e) => setWeekForm({ ...weekForm, delivery_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Status</label>
              <select
                value={weekForm.status}
                onChange={(e) => setWeekForm({ ...weekForm, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Dishes this week
                  {weekForm.productIds.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-[#C8952A]">{weekForm.productIds.length} selected</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddDish((s) => !s)}
                  className="text-sm text-[#C8952A] font-semibold hover:underline"
                >
                  {showAddDish ? 'Close' : '+ Add a new dish'}
                </button>
              </div>

              {showAddDish && (
                <div className="mb-3 p-4 rounded-xl border border-[#e8c87a] bg-[#fdf9ec] space-y-3">
                  <p className="text-xs text-gray-600">
                    Add a meal on the spot. It becomes a dish you can include this week and in future weeks.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Dish name *</label>
                      <input
                        value={newDish.name}
                        onChange={(e) => setNewDish((d) => ({ ...d, name: e.target.value }))}
                        placeholder="e.g. Jollof Rice & Chicken"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Price (CA$) *</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={newDish.price}
                        onChange={(e) => setNewDish((d) => ({ ...d, price: e.target.value }))}
                        placeholder="0.00"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Photo (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDishImageFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#111111] file:text-white file:text-xs file:cursor-pointer"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Short description (optional)</label>
                      <textarea
                        value={newDish.description}
                        onChange={(e) => setNewDish((d) => ({ ...d, description: e.target.value }))}
                        rows={2}
                        placeholder="A few words about this meal"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addDish}
                    disabled={addingDish}
                    className="w-full py-2.5 rounded-lg bg-[#C8952A] text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {addingDish ? 'Adding...' : 'Add dish & include this week'}
                  </button>
                </div>
              )}

              <div className="relative mb-2">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {products.filter((p) => p.name.toLowerCase().includes(dishSearch.trim().toLowerCase())).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3">No dishes match. Use &ldquo;Add a new dish&rdquo; above.</p>
                ) : (
                  products
                    .filter((p) => p.name.toLowerCase().includes(dishSearch.trim().toLowerCase()))
                    .map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={weekForm.productIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        {p.name}
                      </label>
                    ))
                )}
              </div>
            </div>

            <textarea
              placeholder="Notes for this week (optional)"
              value={weekForm.notes}
              onChange={(e) => setWeekForm({ ...weekForm, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20"
            />

            <button
              onClick={saveWeek}
              disabled={savingWeek}
              className="w-full py-3 rounded-xl bg-[#111111] text-white font-semibold text-sm disabled:opacity-50"
            >
              {savingWeek ? 'Saving...' : editingWeekId ? 'Update Week' : 'Create Week'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
