'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCalgaryDate, getCancelEligibility } from '@/lib/subscription-dates';

type WeekItem = {
  product_id: string;
  products: { id: string; name: string; price: number; product_images?: { url: string }[] };
};

type Selection = { product_id: string; quantity: number };

export default function MealPrepSubscription() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [week, setWeek] = useState<any>(null);
  const [weekItems, setWeekItems] = useState<WeekItem[]>([]);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const mealsPerWeek = subscription?.subscription_plans?.meals_per_week ?? 0;
  const selectedTotal = Object.values(selections).reduce((a, b) => a + b, 0);
  const deadlinePassed = week ? new Date() > new Date(week.selection_deadline) : false;

  useEffect(() => {
    async function load() {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (!s) {
        setLoading(false);
        return;
      }

      const { data: sub } = await supabase
        .from('meal_prep_subscriptions')
        .select(`
          *,
          subscription_plans ( name, meals_per_week, price_cents, cancel_notice_days, delivery_day )
        `)
        .eq('user_id', s.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(sub);

      const { data: openWeek } = await supabase
        .from('meal_prep_weeks')
        .select('*')
        .eq('status', 'published')
        .gte('selection_deadline', new Date().toISOString())
        .order('week_start', { ascending: true })
        .limit(1)
        .maybeSingle();

      let activeWeek = openWeek;
      if (!activeWeek) {
        const { data: latestWeek } = await supabase
          .from('meal_prep_weeks')
          .select('*')
          .eq('status', 'published')
          .order('week_start', { ascending: false })
          .limit(1)
          .maybeSingle();
        activeWeek = latestWeek;
      }

      setWeek(activeWeek);

      if (activeWeek?.id && sub) {
        const { data: items } = await supabase
          .from('meal_prep_week_items')
          .select(`
            product_id,
            products ( id, name, price, product_images ( url, position ) )
          `)
          .eq('week_id', activeWeek.id)
          .order('sort_order');

        setWeekItems((items as WeekItem[]) || []);

        const { data: existing } = await supabase
          .from('meal_prep_selections')
          .select('product_id, quantity')
          .eq('subscription_id', sub.id)
          .eq('week_id', activeWeek.id);

        const map: Record<string, number> = {};
        (existing || []).forEach((row: Selection) => {
          map[row.product_id] = row.quantity;
        });
        setSelections(map);
      }

      setLoading(false);
    }
    load();
  }, []);

  const adjustQty = (productId: string, delta: number) => {
    setSelections((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const otherTotal = Object.entries(prev)
        .filter(([id]) => id !== productId)
        .reduce((sum, [, q]) => sum + q, 0);
      if (next + otherTotal > mealsPerWeek) return prev;
      const updated = { ...prev };
      if (next === 0) delete updated[productId];
      else updated[productId] = next;
      return updated;
    });
  };

  const saveSelections = async () => {
    if (!session || !week || !subscription) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = Object.entries(selections).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));
      const res = await fetch('/api/subscriptions/select-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
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
      if (json.success) {
        setSubscription({ ...subscription, cancel_at_period_end: true });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cancellation failed' });
    } finally {
      setCanceling(false);
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

  if (!subscription || !['active', 'trialing', 'past_due'].includes(subscription.status)) {
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Prep Subscription</h2>
        <p className="text-gray-500 mb-6">You don&apos;t have an active weekly meal-prep subscription yet.</p>
        <a
          href="/meal-prep"
          className="inline-flex px-5 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          View Plans & Subscribe
        </a>
      </div>
    );
  }

  const plan = subscription.subscription_plans;
  const isActive = ['active', 'trialing'].includes(subscription.status);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Prep Subscription</h2>
        <p className="text-gray-500">Manage your weekly plan, choose meals, and billing.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-[#fdf9ec] text-[#6b5018] border border-[#e8c87a]' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

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

        {subscription.current_period_end && (
          <p className="text-sm text-gray-600">
            {subscription.cancel_at_period_end ? 'Active until' : 'Next billing'}:{' '}
            <strong>{formatCalgaryDate(subscription.current_period_end, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={openPortal}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
          >
            Update Payment Method
          </button>
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

      {week && isActive && (
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">This Week&apos;s Menu</h3>
              <p className="text-sm text-gray-500 mt-1">
                Delivery {formatCalgaryDate(week.delivery_date, { weekday: 'long', month: 'long', day: 'numeric' })}
                {!deadlinePassed && (
                  <> · Choose by {formatCalgaryDate(week.selection_deadline, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</>
                )}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {selectedTotal} / {mealsPerWeek} meals selected
            </p>
          </div>

          {weekItems.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-200 rounded-xl">
              The weekly menu hasn&apos;t been published yet. Check back soon.
            </p>
          ) : (
            <div className="space-y-3 mb-6">
              {weekItems.map((item) => {
                const product = item.products;
                const qty = selections[item.product_id] || 0;
                const image = product?.product_images?.sort((a: any, b: any) => a.position - b.position)?.[0]?.url;
                return (
                  <div key={item.product_id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                    {image && (
                      <img src={image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{product?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustQty(item.product_id, -1)}
                        disabled={deadlinePassed || qty === 0}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{qty}</span>
                      <button
                        type="button"
                        onClick={() => adjustQty(item.product_id, 1)}
                        disabled={deadlinePassed || selectedTotal >= mealsPerWeek}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!deadlinePassed && weekItems.length > 0 && (
            <button
              onClick={saveSelections}
              disabled={saving || selectedTotal === 0}
              className="px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Weekly Selections'}
            </button>
          )}

          {deadlinePassed && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
              The selection deadline for this week has passed. Your saved meals (if any) will be prepared for delivery.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
