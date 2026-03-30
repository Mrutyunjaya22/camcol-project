import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Spinner, PageLoader } from '../components/ui/Loader';
import { CATEGORIES } from '../lib/utils';

const inputCls = "w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all";
const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{label}</label>
    {children}
    {hint && <p className="text-xs text-neutral-600">{hint}</p>}
  </div>
);

export default function EditGig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', price: '', price_type: 'fixed',
    delivery_days: '3', tags: '', images: '', is_active: true,
  });

  useEffect(() => {
    api.get(`/gigs/${id}`).then(({ data }) => {
      const g = data.gig;
      setForm({
        title: g.title, description: g.description, category: g.category,
        price: String(g.price), price_type: g.price_type,
        delivery_days: String(g.delivery_days),
        tags: (g.tags ?? []).join(', '),
        images: (g.images ?? []).join(', '),
        is_active: g.is_active,
      });
    }).catch(() => toast.error('Failed to load gig')).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        delivery_days: parseInt(form.delivery_days),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images.split(',').map(i => i.trim()).filter(Boolean),
      };
      await api.put(`/gigs/${id}`, payload);
      toast.success('Gig updated!');
      navigate(`/gigs/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this gig? This cannot be undone.')) return;
    try {
      await api.delete(`/gigs/${id}`);
      toast.success('Gig deleted');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Delete failed');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">Edit Gig</h1>
        <p className="text-neutral-500">Update your gig details</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Gig Title *">
          <input value={form.title} onChange={set('title')} required maxLength={200} className={inputCls} />
        </Field>
        <Field label="Category *">
          <select value={form.category} onChange={set('category')} required className={inputCls}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description *">
          <textarea value={form.description} onChange={set('description')} required minLength={50} rows={8} className={`${inputCls} resize-y`} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Price (₹) *">
            <input type="number" value={form.price} onChange={set('price')} required min={1} className={inputCls} />
          </Field>
          <Field label="Price Type">
            <select value={form.price_type} onChange={set('price_type')} className={inputCls}>
              <option value="fixed">Fixed</option>
              <option value="hourly">Per Hour</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </Field>
          <Field label="Delivery (days)">
            <input type="number" value={form.delivery_days} onChange={set('delivery_days')} min={1} max={90} className={inputCls} />
          </Field>
        </div>
        <Field label="Tags" hint="Comma-separated">
          <input value={form.tags} onChange={set('tags')} className={inputCls} />
        </Field>
        <Field label="Image URLs" hint="Comma-separated">
          <input value={form.images} onChange={set('images')} className={inputCls} />
        </Field>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div>
            <p className="text-sm font-medium text-neutral-200">Gig visibility</p>
            <p className="text-xs text-neutral-600">Toggle to pause or activate your gig</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-yellow-400' : 'bg-neutral-700'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleDelete}
            className="px-5 py-3 rounded-xl text-sm border border-red-900 text-red-400 hover:bg-red-500/10 transition-colors">
            Delete
          </button>
          <button type="button" onClick={() => navigate(`/gigs/${id}`)}
            className="px-5 py-3 rounded-xl text-sm border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving ? <><Spinner size="sm" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}