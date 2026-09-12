'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCalgaryDate, getCancelEligibility } from '@/lib/subscription-dates';

type Dish = {
  productId: string;
  name: string;
  description: string | null;
  photo: string | null;
  ingredients: string[];
  allergens: string[];
  portion: string | null;
};

type AccountPayload = {
  catalog: {
    week: {
      id: string;
      deliveryDate: string;
      selectionDeadline: string;
      afterDeadline: boolean;
      deliveryLabel: string;
      deadlineLabel: string;
    } | null;
    dishes: Dish[];
    reason: string;
    draftWeeks: number;
  };
  subscription: {
    id: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
    delivery_method: string;
    shipping_address: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
    } | null;
    subscription_plans: {
      name: string;
      meals_per_week: number;
      price_cents: number;
      cancel_notice_days: number;
      delivery_day: string;
    };
  } | null;
  oneTime: { id: string; weekId: string; planId: string; mealsPerWeek: number; planName: string | null } | null;
  selections: { product_id: string; quantity: number }[];
  skippedWeekIds: string[];
};

export default function MealPrepSubscription() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<AccountPayload | null>(null);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Calgary',
    postalCode: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'doorstep'>('pickup');

  const subscription = data?.subscription || null;
  const week = data?.catalog.week || null;
  const dishes = data?.catalog.dishes || [];
  const oneTime = data?.oneTime || null;
  const canSavePicks = Boolean(
    (subscription && ['active', 'trialing'].includes(subscription.status)) || oneTime
  );
  const mealsPerWeek = subscription?.subscription_plans?.meals_per_week ?? oneTime?.mealsPerWeek ?? 0;
  const selectedTotal = Object.values(selections).reduce((a, b) => a + b, 0);
  const deadlinePassed = week ? new Date() > new Date(week.selectionDeadline) : false;
  const weekSkipped = Boolean(week && data?.skippedWeekIds.includes(week.id));

  const loadAccount = async (token: string) => {
    const res = await fetch('/api/meal-prep/account', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    setData(json);
    const map: Record<string, number> = {};
    (json.selections || []).forEach((row: { product_id: string; quantity: number }) => {
      map[row.product_id] = row.quantity;
    });
    setSelections(map);
    const sub = json.subscription;
    if (sub) {
      setDeliveryMethod(sub.delivery_method === 'doorstep' ? 'doorstep' : 'pickup');
      setAddress({
        firstName: sub.shipping_address?.firstName || '',
        lastName: sub.shipping_address?.lastName || '',
        phone: sub.shipping_address?.phone || '',
        address: sub.shipping_address?.address || '',
        city: sub.shipping_address?.city || 'Calgary',
        postalCode: sub.shipping_address?.postalCode || '',
      });
    }
  };

  useEffect(() => {
    async function load() {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (!s) {
        setLoading(false);
        return;
      }
      try {
        await loadAccount(s.access_token);
      } catch {
        setMessage({ type: 'error', text: 'Could not load meal-prep details.' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  });

  const adjustQty = (productId: string, delta: number) => {
    setSelections((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const otherTotal = Object.entries(prev)
        .filter(([id]) => id !== productId)
        .reduce((sum, [, q]) => sum + q, 0);
      if (mealsPerWeek && next + otherTotal > mealsPerWeek) return prev;
      const updated = { ...prev };
      if (next === 0) delete updated[productId];
      else updated[productId] = next;
      return updated;
    });
  };

  const saveSelections = async () => {
    if (!session || !week) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = Object.entries(selections).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));
      const res = await fetch('/api/subscriptions/select-meals', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ weekId: week.id, selections: payload }),
      });
      const json = await res.json();
      setMessage({ type: json.success ? 'success' : 'error', text: json.message });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save selections' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!session || !subscription) return;
    const plan = subscription.subscription_plans;
    const eligibility = getCancelEligibility(
      plan?.cancel_notice_days ?? 3,
      plan?.delivery_day ?? 'saturday'
    );
    if (!confirm(`${eligibility.message}\n\nProceed with cancellation?`)) return;

    setCanceling(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setMessage({ type: json.success ? 'success' : 'error', text: json.message });
      if (json.success && data) {
        setData({
          ...data,
          subscription: { ...subscription, cancel_at_period_end: true },
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cancellation failed' });
    } finally {
      setCanceling(false);
    }
  };

  const handleSkip = async () => {
    if (!session || !week) return;
    if (!confirm(`Skip the box for ${week.deliveryLabel}? You will not be charged for that week.`)) return;
    setSkipping(true);
    try {
      const res = await fetch('/api/subscriptions/skip', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setMessage({ type: json.success ? 'success' : 'error', text: json.message });
      if (json.success) await loadAccount(session.access_token);
    } catch {
      setMessage({ type: 'error', text: 'Could not skip this week' });
    } finally {
      setSkipping(false);
    }
  };

  const handlePause = async (resume = false) => {
    if (!session) return;
    if (!resume && !confirm('Pause weekly billing until you resume?')) return;
    setPausing(true);
    try {
      const res = await fetch('/api/subscriptions/pause', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ resume }),
      });
      const json = await res.json();
      setMessage({ type: json.success ? 'success' : 'error', text: json.message });
      if (json.success) await loadAccount(session.access_token);
    } catch {
      setMessage({ type: 'error', text: 'Could not update pause status' });
    } finally {
      setPausing(false);
    }
  };

  const saveAddress = async () => {
    if (!session) return;
    setSavingAddress(true);
    try {
      const res = await fetch('/api/subscriptions/address', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ deliveryMethod, shippingAddress: address }),
      });
      const json = await res.json();
      setMessage({ type: json.success ? 'success' : 'error', text: json.message });
    } catch {
      setMessage({ type: 'error', text: 'Could not save address' });
    } finally {
      setSavingAddress(false);
    }
  };

  const openPortal = async () => {
    if (!session) return;
    const res = await fetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else alert(json.message || 'Could not open billing portal');
  };

  if (loading) {
    return <div className="text-gray-500 py-8">Loading subscription...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Prep</h2>
        <p className="text-gray-500 mb-6">Sign in to manage your weekly box.</p>
        <a href="/auth/login?redirect=/account?tab=meal-prep" className="inline-flex px-5 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  const plan = subscription?.subscription_plans;
  const isActive = Boolean(subscription && ['active', 'trialing'].includes(subscription.status));
  const isPaused = subscription?.status === 'paused';
  const emptyMenu =
    data?.catalog.reason === 'no_published_week'
      ? data.catalog.draftWeeks > 0
        ? 'This week’s menu was saved as a draft. It will appear here once published.'
        : 'No weekly menu is published yet.'
      : data?.catalog.reason === 'no_dishes'
        ? 'This week is published but no dishes are attached yet.'
        : null;

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Prep</h2>
        <p className="text-gray-500">See this week&apos;s menu, choose meals, and manage your box.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-[#fdf9ec] text-[#6b5018] border border-[#e8c87a]' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {subscription && ['active', 'trialing', 'past_due', 'paused'].includes(subscription.status) ? (
        <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Current Plan</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{plan?.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {plan?.meals_per_week} meals/week · CA${((plan?.price_cents || 0) / 100).toFixed(2)}/week
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isActive ? 'bg-[#fdf9ec] text-[#a07020] border border-[#e8c87a]' : 'bg-gray-100 text-gray-600'
            }`}>
              {subscription.cancel_at_period_end ? 'Cancelling' : subscription.status}
            </span>
          </div>

          {week && (
            <p className="text-sm text-gray-600">
              Next box:{' '}
              <strong>{weekSkipped ? `Skipped · ${week.deliveryLabel}` : week.deliveryLabel}</strong>
            </p>
          )}

          {subscription.current_period_end && (
            <p className="text-sm text-gray-600">
              {subscription.cancel_at_period_end ? 'Active until' : 'Next billing'}:{' '}
              <strong>{formatCalgaryDate(subscription.current_period_end, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            </p>
          )}

          <div className="pt-2 space-y-3">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Delivery address</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${deliveryMethod === 'pickup' ? 'border-[#C8952A] bg-[#fdf9ec]' : 'border-gray-200'}`}>Pickup</button>
              <button type="button" onClick={() => setDeliveryMethod('doorstep')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${deliveryMethod === 'doorstep' ? 'border-[#C8952A] bg-[#fdf9ec]' : 'border-gray-200'}`}>Doorstep</button>
            </div>
            {deliveryMethod === 'doorstep' && (
              <div className="grid sm:grid-cols-2 gap-2">
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="First name" value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Last name" value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" placeholder="Street address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              </div>
            )}
            <button onClick={saveAddress} disabled={savingAddress} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50">
              {savingAddress ? 'Saving...' : 'Save delivery details'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={openPortal} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white transition-colors">
              Update Payment Method
            </button>
            {isActive && !weekSkipped && (
              <button onClick={handleSkip} disabled={skipping} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50">
                {skipping ? 'Skipping...' : 'Skip next week'}
              </button>
            )}
            {isActive && (
              <button onClick={() => handlePause(false)} disabled={pausing} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50">
                {pausing ? 'Updating...' : 'Pause subscription'}
              </button>
            )}
            {isPaused && (
              <button onClick={() => handlePause(true)} disabled={pausing} className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-semibold disabled:opacity-50">
                {pausing ? 'Updating...' : 'Resume subscription'}
              </button>
            )}
            {isActive && !subscription.cancel_at_period_end && (
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {canceling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-600 mb-4">
            {oneTime
              ? 'You bought this week’s box. Choose your meals below, or subscribe for every Saturday.'
              : 'You don’t have an active weekly subscription yet. You can still browse the menu.'}
          </p>
          <a href="/meal-prep" className="inline-flex px-5 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-colors">
            {oneTime ? 'Subscribe weekly' : 'View Plans & Buy'}
          </a>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">This Week&apos;s Menu</h3>
            {week && (
              <p className="text-sm text-gray-500 mt-1">
                Delivery {week.deliveryLabel}
                {!deadlinePassed && <> · Choose by {week.deadlineLabel}</>}
              </p>
            )}
          </div>
          {canSavePicks && mealsPerWeek > 0 && (
            <p className="text-sm font-semibold text-gray-700">
              {selectedTotal} / {mealsPerWeek} meals selected
            </p>
          )}
        </div>

        {emptyMenu ? (
          <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-200 rounded-xl">
            {emptyMenu}
          </p>
        ) : dishes.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-200 rounded-xl">
            The weekly menu hasn&apos;t been published yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-3 mb-6">
            {dishes.map((dish) => {
              const qty = selections[dish.productId] || 0;
              return (
                <div key={dish.productId} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                  {dish.photo && (
                    <img src={dish.photo} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{dish.name}</p>
                    {dish.portion && <p className="text-xs text-gray-400 mt-0.5">{dish.portion}</p>}
                    {dish.allergens.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">Allergens: {dish.allergens.join(', ')}</p>
                    )}
                  </div>
                  {canSavePicks && !weekSkipped && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustQty(dish.productId, -1)}
                        disabled={deadlinePassed || qty === 0}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{qty}</span>
                      <button
                        type="button"
                        onClick={() => adjustQty(dish.productId, 1)}
                        disabled={deadlinePassed || selectedTotal >= mealsPerWeek}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!canSavePicks && dishes.length > 0 && (
          <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-4">
            Buy this week or subscribe to save your meal picks.
          </p>
        )}

        {weekSkipped && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
            You skipped this week. No box will be prepared or billed for {week?.deliveryLabel}.
          </p>
        )}

        {canSavePicks && !deadlinePassed && dishes.length > 0 && !weekSkipped && (
          <button
            onClick={saveSelections}
            disabled={saving || selectedTotal === 0}
            className="px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Weekly Selections'}
          </button>
        )}

        {deadlinePassed && dishes.length > 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
            The selection deadline for this week has passed. Your saved meals (if any) will be prepared for delivery.
          </p>
        )}
      </div>
    </div>
  );
}
