import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Loader';
import { CATEGORIES } from '../lib/utils';

const inputCls = "w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all";
const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{label}</label>
    {children}
    {hint && <p className="text-xs text-neutral-600">{hint}</p>}
  </div>
);

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', required_skills: '',
    team_size: '3', duration: '', is_paid: false, budget: '', college_only: false,
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.description.length < 50) { toast.error('Description must be at least 50 characters'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        team_size: parseInt(form.team_size),
        budget: form.is_paid && form.budget ? parseFloat(form.budget) : null,
      };
      const { data } = await api.post('/projects', payload);
      toast.success('Project created! 🚀');
      navigate(`/projects/${data.project.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">Start a Project</h1>
        <p className="text-neutral-500">Find teammates and collaborators for your idea</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Project Title *">
          <input value={form.title} onChange={set('title')} required maxLength={200} placeholder="e.g. Campus Event App, Open Source Design System..." className={inputCls} />
        </Field>

        <Field label="Category *">
          <select value={form.category} onChange={set('category')} required className={inputCls}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Description *" hint={`${form.description.length}/1000 chars (min 50)`}>
          <textarea value={form.description} onChange={set('description')} required minLength={50} maxLength={1000} rows={7}
            placeholder="Describe your project, what you're building, what roles you need, and what team members will gain..."
            className={`${inputCls} resize-y`} />
        </Field>

        <Field label="Required Skills" hint="Comma-separated (e.g. React, Node.js, Figma)">
          <input value={form.required_skills} onChange={set('required_skills')} placeholder="React, Node.js, Figma, Content Writing..." className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Team Size">
            <input type="number" value={form.team_size} onChange={set('team_size')} min={2} max={20} className={inputCls} />
          </Field>
          <Field label="Duration">
            <input value={form.duration} onChange={set('duration')} placeholder="e.g. 2 months, Ongoing..." className={inputCls} />
          </Field>
        </div>

        {/* Paid toggle */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-200">This is a paid project</p>
              <p className="text-xs text-neutral-600">Toggle if you're offering payment to collaborators</p>
            </div>
            <button type="button"
              onClick={() => setForm(f => ({ ...f, is_paid: !f.is_paid }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_paid ? 'bg-yellow-400' : 'bg-neutral-700'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.is_paid ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {form.is_paid && (
            <Field label="Total Budget (₹)">
              <input type="number" value={form.budget} onChange={set('budget')} min={0} placeholder="5000" className={inputCls} />
            </Field>
          )}
        </div>

        {/* College only toggle */}
        <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div>
            <p className="text-sm font-medium text-neutral-200">Same college only</p>
            <p className="text-xs text-neutral-600">Restrict applicants to your college</p>
          </div>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, college_only: !f.college_only }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.college_only ? 'bg-yellow-400' : 'bg-neutral-700'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.college_only ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/projects')}
            className="px-6 py-3 rounded-xl text-sm border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Creating...</> : 'Launch Project →'}
          </button>
        </div>
      </form>
    </div>
  );
}