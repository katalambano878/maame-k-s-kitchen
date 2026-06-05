'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const EVENT_TYPES = [
  { value: 'chop_bar', label: 'Chop Bar Experience' },
  { value: 'food_fest', label: 'Food Fest' },
  { value: 'catering', label: 'Catering' },
  { value: 'general', label: 'General Event' },
];

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  event_type: 'general',
  status: 'published',
  is_upcoming: false,
  event_date: '',
  location: 'Cornerstone, NE Calgary',
  cover_image_url: '',
  gallery_urls: '' as string,
  video_urls: '' as string,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('kitchen_events').select('*').order('event_date', { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    if (showModal && form.title && !editingId) {
      setForm(f => ({
        ...f,
        slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
    }
  }, [form.title, showModal, editingId]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (ev: any) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      slug: ev.slug,
      description: ev.description || '',
      event_type: ev.event_type,
      status: ev.status,
      is_upcoming: ev.is_upcoming,
      event_date: ev.event_date ? ev.event_date.slice(0, 16) : '',
      location: ev.location || '',
      cover_image_url: ev.cover_image_url || '',
      gallery_urls: (ev.gallery_urls || []).join('\n'),
      video_urls: (ev.video_urls || []).join('\n'),
    });
    setShowModal(true);
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `events/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
      if (field === 'cover') setForm(f => ({ ...f, cover_image_url: publicUrl }));
      else setForm(f => ({ ...f, gallery_urls: f.gallery_urls ? `${f.gallery_urls}\n${publicUrl}` : publicUrl }));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description,
      event_type: form.event_type,
      status: form.status,
      is_upcoming: form.is_upcoming,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      location: form.location,
      cover_image_url: form.cover_image_url || null,
      gallery_urls: form.gallery_urls.split('\n').map(s => s.trim()).filter(Boolean),
      video_urls: form.video_urls.split('\n').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        const { error } = await supabase.from('kitchen_events').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('kitchen_events').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchEvents();
      alert('Event saved');
    } catch (err: any) {
      alert(err.message?.includes('kitchen_events')
        ? 'Events table not ready — run the latest Supabase migration (20260604000000_preorder_events_categories.sql) in your Supabase SQL editor.'
        : 'Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await supabase.from('kitchen_events').delete().eq('id', id);
    fetchEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Chop Bar Experience, catering, upcoming &amp; past events</p>
        </div>
        <button onClick={openNew} className="px-6 py-3 bg-[#111111] text-white rounded-lg font-semibold cursor-pointer">
          <i className="ri-add-line mr-2"></i>Add Event
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
          No events yet. Add your first Chop Bar or catering event.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold">Event</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{ev.title}{ev.is_upcoming && <span className="ml-2 text-xs bg-[#C8952A] text-white px-2 py-0.5 rounded-full">Upcoming</span>}</td>
                  <td className="py-3 px-4 text-sm capitalize">{ev.event_type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{ev.event_date ? new Date(ev.event_date).toLocaleDateString() : '—'}</td>
                  <td className="py-3 px-4 text-sm capitalize">{ev.status}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button onClick={() => openEdit(ev)} className="text-[#C8952A] font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(ev.id)} className="text-red-500 font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Event' : 'New Event'}</h2>
            <input className="w-full border-2 rounded-lg px-4 py-3" placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="w-full border-2 rounded-lg px-4 py-3 font-mono text-sm" placeholder="url-slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            <textarea className="w-full border-2 rounded-lg px-4 py-3 min-h-[100px]" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <select className="border-2 rounded-lg px-4 py-3" value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select className="border-2 rounded-lg px-4 py-3" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_upcoming} onChange={e => setForm({ ...form, is_upcoming: e.target.checked })} className="w-5 h-5 accent-[#C8952A]" />
              <span className="font-medium">Mark as upcoming event</span>
            </label>
            <input type="datetime-local" className="w-full border-2 rounded-lg px-4 py-3" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
            <input className="w-full border-2 rounded-lg px-4 py-3" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <div>
              <label className="text-sm font-semibold block mb-2">Cover image</label>
              <input type="file" accept="image/*" onChange={e => uploadImage(e, 'cover')} disabled={uploading} />
              {form.cover_image_url && <p className="text-xs text-green-600 mt-1 truncate">✓ {form.cover_image_url}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2">Gallery URLs (one per line)</label>
              <textarea className="w-full border-2 rounded-lg px-4 py-3" rows={3} value={form.gallery_urls} onChange={e => setForm({ ...form, gallery_urls: e.target.value })} />
              <input type="file" accept="image/*" className="mt-2" onChange={e => uploadImage(e, 'gallery')} disabled={uploading} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2">Video URLs (YouTube, Vimeo, or MP4 — one per line)</label>
              <textarea className="w-full border-2 rounded-lg px-4 py-3" rows={2} value={form.video_urls} onChange={e => setForm({ ...form, video_urls: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 border-2 py-3 rounded-lg font-semibold cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#111111] text-white py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
