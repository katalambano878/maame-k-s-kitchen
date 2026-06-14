/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Dish = {
  id: string;
  name: string;
  price: number;
  status: string;
  available_days: string[] | null;
  metadata: Record<string, unknown> | null;
  category: string;
  image: string;
  onSaturday: boolean;
};

function isOnSaturday(p: { available_days?: string[] | null; metadata?: { available_days?: string[] } | null }): boolean {
  const column = Array.isArray(p.available_days) ? p.available_days : [];
  const meta = Array.isArray(p.metadata?.available_days) ? (p.metadata!.available_days as string[]) : [];
  const days = column.length > 0 ? column : meta;
  return days.map((d) => d.toLowerCase()).includes('saturday');
}

export default function SaturdayMenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'on' | 'off'>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, status, available_days, metadata, categories(name), product_images(url, position)')
        .neq('status', 'archived')
        .order('name', { ascending: true });

      if (error) throw error;

      setDishes(
        (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          status: p.status,
          available_days: p.available_days,
          metadata: p.metadata,
          category: p.categories?.name || 'Uncategorized',
          image:
            p.product_images?.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))?.[0]?.url || '/logo.png',
          onSaturday: isOnSaturday(p),
        }))
      );
    } catch (err) {
      console.error('Error loading dishes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const toggleSaturday = async (dish: Dish) => {
    const turnOn = !dish.onSaturday;
    const newDays = turnOn ? ['saturday'] : [];
    const newMetadata = { ...(dish.metadata || {}), available_days: newDays };

    setSavingId(dish.id);
    // Optimistic update
    setDishes((prev) => prev.map((d) => (d.id === dish.id ? { ...d, onSaturday: turnOn } : d)));

    const { error } = await supabase
      .from('products')
      .update({ available_days: newDays, metadata: newMetadata })
      .eq('id', dish.id);

    if (error) {
      // Revert on failure
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? { ...d, onSaturday: dish.onSaturday } : d)));
      alert('Could not update dish: ' + error.message);
    } else {
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, available_days: newDays, metadata: newMetadata } : d))
      );
    }
    setSavingId(null);
  };

  const saturdayCount = useMemo(() => dishes.filter((d) => d.onSaturday).length, [dishes]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return dishes.filter((d) => {
      if (filter === 'on' && !d.onSaturday) return false;
      if (filter === 'off' && d.onSaturday) return false;
      if (term && !(`${d.name} ${d.category}`.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [dishes, search, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saturday Menu</h1>
          <p className="text-gray-600 mt-1">
            Choose the dishes you&rsquo;ll be preparing on Saturday. Only these will show under the Saturday Menu.
          </p>
        </div>
        <div className="bg-[#fdf9ec] border border-[#e8c87a] rounded-xl px-5 py-3 text-center">
          <p className="text-2xl font-bold text-[#C8952A]">{saturdayCount}</p>
          <p className="text-xs font-semibold text-[#7a5418] uppercase tracking-wide">On Saturday</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes by name or category..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
          />
        </div>
        <div className="flex gap-2">
          {([
            { id: 'all', label: 'All' },
            { id: 'on', label: 'On Saturday' },
            { id: 'off', label: 'Not Added' },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors cursor-pointer ${
                filter === opt.id
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#C8952A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading dishes...</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {dishes.length === 0 ? 'No dishes found. Add dishes from the Menu page first.' : 'No dishes match your filter.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map((dish) => (
              <li key={dish.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{dish.name}</p>
                  <p className="text-sm text-gray-500">
                    {dish.category} · CA${dish.price.toFixed(2)}
                    {dish.status !== 'active' && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{dish.status}</span>
                    )}
                  </p>
                </div>
                {dish.onSaturday && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#fdf9ec] text-[#C8952A]">
                    <i className="ri-calendar-check-line"></i> Saturday
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleSaturday(dish)}
                  disabled={savingId === dish.id}
                  aria-label={dish.onSaturday ? 'Remove from Saturday menu' : 'Add to Saturday menu'}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                    dish.onSaturday ? 'bg-[#C8952A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      dish.onSaturday ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
