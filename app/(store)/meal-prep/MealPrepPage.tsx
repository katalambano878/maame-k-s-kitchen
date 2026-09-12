'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHero from '@/components/PageHero';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/hooks/usePageTitle';

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  meals_per_week: number;
  price_cents: number;
  one_time_price_cents: number | null;
  cancel_notice_days: number;
  delivery_day: string;
};

type Dish = {
  productId: string;
  name: string;
  description: string | null;
  photo: string | null;
  ingredients: string[];
  allergens: string[];
  portion: string | null;
};

type WeekPayload = {
  week: {
    id: string;
    deliveryDate: string;
    selectionDeadline: string;
    afterDeadline: boolean;
    deliveryLabel: string;
    deadlineLabel: string;
    notes: string | null;
  } | null;
  dishes: Dish[];
  deliveryArea: string;
  doorstepFeeCents: number;
  reason: 'ok' | 'no_published_week' | 'no_dishes';
  draftWeeks: number;
};

type PurchaseMode = 'one_time' | 'subscription';

const emptyAddress = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: 'Calgary',
  postalCode: '',
};

export default function MealPrepPage() {
  usePageTitle('Weekly Meal Prep');
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [week, setWeek] = useState<WeekPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>('one_time');
  const [planModes, setPlanModes] = useState<Record<string, PurchaseMode>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'doorstep'>('pickup');
  const [address, setAddress] = useState(emptyAddress);

  useEffect(() => {
    async function load() {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);

      if (s) {
        const { data: sub } = await supabase
          .from('meal_prep_subscriptions')
          .select('id, status')
          .eq('user_id', s.user.id)
          .in('status', ['active', 'trialing', 'past_due', 'paused'])
          .maybeSingle();
        setHasActiveSub(!!sub);
      }

      const [plansRes, weekRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').eq('status', 'active').order('sort_order'),
        fetch('/api/meal-prep/week').then((r) => r.json()).catch(() => null),
      ]);

      setPlans(plansRes.data || []);
      if (weekRes && !weekRes.error) setWeek(weekRes);
      setLoading(false);
    }
    load();
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;
  const startingPrice = useMemo(() => {
    if (!plans.length) return 0;
    return Math.min(...plans.map((p) => p.one_time_price_cents || p.price_cents));
  }, [plans]);

  const mealCents = selectedPlan
    ? purchaseMode === 'one_time'
      ? selectedPlan.one_time_price_cents || selectedPlan.price_cents
      : selectedPlan.price_cents
    : 0;
  const deliveryCents = deliveryMethod === 'doorstep' ? week?.doorstepFeeCents || 1000 : 0;
  const totalCents = mealCents + deliveryCents;

  const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;

  const openConfirm = (planId: string) => {
    if (!session) {
      router.push('/auth/login?redirect=/meal-prep');
      return;
    }
    const mode = planModes[planId] || 'one_time';
    if (mode === 'subscription' && hasActiveSub) return;
    setPurchaseMode(mode);
    setSelectedPlanId(planId);
    setConfirmOpen(true);
    requestAnimationFrame(() => {
      document.getElementById('meal-prep-confirm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handlePay = async () => {
    if (!session || !selectedPlan) return;
    if (deliveryMethod === 'doorstep' && (!address.firstName.trim() || !address.address.trim() || !address.phone.trim())) {
      alert('Please enter your name, phone, and Calgary address for doorstep delivery.');
      return;
    }

    setCheckingOut(true);
    try {
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          weekId: week?.week?.id,
          mode: purchaseMode,
          deliveryMethod,
          shippingAddress: deliveryMethod === 'doorstep' ? address : undefined,
        }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.message || 'Could not start checkout');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const menuMessage = (() => {
    if (!week) return 'Loading this week’s menu…';
    if (week.reason === 'no_published_week' && week.draftWeeks > 0) {
      return 'This week’s menu was saved as a draft. Publish it in Admin → Meal Prep so customers can see the dishes and order.';
    }
    if (week.reason === 'no_published_week') {
      return 'No weekly menu is published yet.';
    }
    if (week.reason === 'no_dishes') {
      return 'This week is published but no dishes are attached yet.';
    }
    return null;
  })();

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        title="Weekly Meal Prep"
        subtitle="Authentic Ghanaian meals, prepped fresh and delivered every Saturday in Calgary."
        backgroundImage="/meal_prep_hero.webp"
        badge="This week or subscribe"
      />

      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        {canceled && (
          <div className="mb-8 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm">
            Checkout was cancelled. You can buy this week or subscribe whenever you are ready.
          </div>
        )}

        {hasActiveSub && (
          <div className="mb-10 p-5 rounded-2xl bg-[#fdf9ec] border border-[#e8c87a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-[#6b5018]">You have an active subscription</p>
              <p className="text-sm text-[#8a6830] mt-1">Choose this week&apos;s meals and manage billing in your account.</p>
            </div>
            <Link
              href="/account?tab=meal-prep"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        )}

        <div className="mb-14 rounded-2xl border border-gray-100 bg-gray-50/70 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-[#C8952A] font-bold mb-2">This week&apos;s offer</p>
          <h2 className="text-2xl font-serif font-medium text-gray-900">Fresh Ghanaian meals, ready for Saturday</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Meals / week</p>
              <p className="mt-1 font-semibold">{plans[0] ? `${Math.min(...plans.map((p) => p.meals_per_week))}–${Math.max(...plans.map((p) => p.meals_per_week))} depending on plan` : 'Choose a plan'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Starting at</p>
              <p className="mt-1 font-semibold">{startingPrice ? `${fmt(startingPrice)} / box` : '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Delivery area</p>
              <p className="mt-1 font-semibold">{week?.deliveryArea || 'Calgary · Saturday delivery'}</p>
            </div>
          </div>
          {week?.week && (
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-full bg-white border border-gray-200">
                Next delivery <strong>{week.week.deliveryLabel}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-gray-200">
                Choose by <strong>{week.week.deadlineLabel}</strong>
              </span>
            </div>
          )}
          {week?.week?.afterDeadline && (
            <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              This week&apos;s cutoff has passed. You&apos;re ordering for delivery on {week.week.deliveryLabel}.
            </p>
          )}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2 text-center">This week&apos;s menu</h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
            Pick up to your plan&apos;s meal count after checkout. Allergies are listed on each dish.
          </p>

          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading menu...</div>
          ) : menuMessage ? (
            <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-gray-200 max-w-lg mx-auto text-gray-600 text-sm">
              {menuMessage}
            </div>
          ) : (
            <div className={`grid gap-6 ${week && week.dishes.length === 1 ? 'max-w-md mx-auto' : 'sm:grid-cols-2'}`}>
              {week?.dishes.map((dish) => (
                <article key={dish.productId} className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                  {dish.photo ? (
                    <img src={dish.photo} alt="" className="w-full h-48 object-cover bg-gray-100" />
                  ) : (
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center text-gray-300 text-sm">No photo yet</div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-gray-900">{dish.name}</h3>
                      {dish.portion && (
                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#8a6830] bg-[#fdf9ec] border border-[#e8c87a] px-2 py-0.5 rounded-full">
                          {dish.portion}
                        </span>
                      )}
                    </div>
                    {dish.description && <p className="text-sm text-gray-600 leading-relaxed">{dish.description}</p>}
                    {dish.ingredients.length > 0 && (
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">Ingredients: </span>
                        {dish.ingredients.join(', ')}
                      </p>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">Allergens</p>
                      {dish.allergens.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dish.allergens.map((a) => (
                            <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No allergens listed for this dish.</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-500 text-center max-w-2xl mx-auto">
            Prepared in a kitchen that may handle peanuts, tree nuts, dairy, eggs, wheat, soy, fish, and shellfish.
            Please tell us about severe allergies before you order.
          </p>
        </div>

        <h2 className="text-2xl font-serif font-medium text-gray-900 mb-8 text-center">Choose Your Plan</h2>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-gray-200 max-w-lg mx-auto">
            <p className="text-gray-600">Weekly meal-prep plans are coming soon. Check back shortly.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
            {plans.map((plan, i) => {
              const oneTime = plan.one_time_price_cents || plan.price_cents;
              const mode = planModes[plan.id] || 'one_time';
              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-8 ${i === 1 ? 'border-[#C8952A] shadow-lg ring-1 ring-[#C8952A]/20' : 'border-gray-200'}`}
                >
                  {plans.length >= 3 && i === 1 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#C8952A] text-white text-[10px] font-black uppercase tracking-widest">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-6 flex-1">{plan.description}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-bold text-gray-900">{fmt(plan.price_cents)}</span>
                    <span className="text-gray-500 text-sm"> / week</span>
                    <p className="text-xs text-gray-400 mt-1">{plan.meals_per_week} meals · Saturday delivery</p>
                    {plan.one_time_price_cents && plan.one_time_price_cents !== plan.price_cents && (
                      <p className="text-xs text-gray-500 mt-1">One-time box {fmt(oneTime)}</p>
                    )}
                  </div>

                  <div className="space-y-2 mb-5">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${mode === 'one_time' ? 'border-[#C8952A] bg-[#fdf9ec]' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name={`mode-${plan.id}`}
                        checked={mode === 'one_time'}
                        onChange={() => {
                          setPlanModes((m) => ({ ...m, [plan.id]: 'one_time' }));
                          setSelectedPlanId(plan.id);
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-800">Buy this week · {fmt(oneTime)}</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border ${hasActiveSub ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${mode === 'subscription' ? 'border-[#C8952A] bg-[#fdf9ec]' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name={`mode-${plan.id}`}
                        disabled={hasActiveSub}
                        checked={mode === 'subscription'}
                        onChange={() => {
                          setPlanModes((m) => ({ ...m, [plan.id]: 'subscription' }));
                          setSelectedPlanId(plan.id);
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-800">Subscribe weekly · {fmt(plan.price_cents)}</span>
                    </label>
                  </div>

                  <button
                    onClick={() => openConfirm(plan.id)}
                    disabled={hasActiveSub && mode === 'subscription'}
                    className="w-full py-3.5 rounded-xl bg-[#111111] text-white font-semibold text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasActiveSub && mode === 'subscription' ? 'Already Subscribed' : 'Continue'}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {confirmOpen && selectedPlan && (
          <div id="meal-prep-confirm" className="mt-12 max-w-xl mx-auto p-6 sm:p-8 rounded-2xl border border-[#e8c87a] bg-[#fdf9ec] space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8a6830] font-bold">Confirm & pay</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {purchaseMode === 'one_time' ? 'Buy this week' : 'Subscribe weekly'} · {selectedPlan.name}
              </h3>
              {week?.week && (
                <p className="text-sm text-gray-600 mt-1">First delivery {week.week.deliveryLabel}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-3 rounded-xl border text-sm font-semibold ${deliveryMethod === 'pickup' ? 'border-[#C8952A] bg-white' : 'border-gray-200 bg-white/50'}`}
              >
                Pickup · Free
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('doorstep')}
                className={`p-3 rounded-xl border text-sm font-semibold ${deliveryMethod === 'doorstep' ? 'border-[#C8952A] bg-white' : 'border-gray-200 bg-white/50'}`}
              >
                Doorstep · {fmt(week?.doorstepFeeCents || 1000)}
              </button>
            </div>

            {deliveryMethod === 'doorstep' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="First name" value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Last name" value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white sm:col-span-2" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white sm:col-span-2" placeholder="Street address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              </div>
            )}

            <div className="text-sm space-y-1.5 text-gray-700">
              <div className="flex justify-between"><span>Box</span><span>{fmt(mealCents)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{deliveryCents ? fmt(deliveryCents) : 'Free'}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-[#e8c87a]"><span>Total due now</span><span>{fmt(totalCents)}</span></div>
              {purchaseMode === 'subscription' && (
                <p className="text-xs text-gray-500 pt-1">
                  Then {fmt(selectedPlan.price_cents)} every week. {deliveryMethod === 'doorstep' ? 'The doorstep fee is added to this first payment only.' : ''}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePay}
                disabled={checkingOut}
                className="flex-1 py-3.5 rounded-xl bg-[#111111] text-white font-semibold text-sm disabled:opacity-50"
              >
                {checkingOut ? 'Redirecting...' : 'Pay with Stripe'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white"
              >
                Back
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 p-8 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600 leading-relaxed max-w-3xl mx-auto">
          <h3 className="font-bold text-gray-900 mb-3">How billing & cancellation work</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>Buy this week is a one-time Saturday box. Subscribe weekly charges automatically each week via Stripe.</li>
            <li>Choose your meals from the weekly menu before the published deadline (usually Wednesday 11:59 PM).</li>
            <li>Cancel anytime from your account. If you cancel at least 3 days before delivery, you will not be charged for the upcoming week.</li>
            <li>If you cancel after the deadline, one final weekly charge applies and your subscription ends after that delivery.</li>
            <li>Update your payment method anytime via the billing portal in your account.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
