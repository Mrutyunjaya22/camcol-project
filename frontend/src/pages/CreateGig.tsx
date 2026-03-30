import React, { useState, type FormEvent, type ReactNode, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Loader';
import { CATEGORIES } from '../lib/utils';

type FormState = {
  title: string;
  description: string;
  category: string;
  price: string;
  price_type: string;
  delivery_days: string;
  tags: string;
  images: string;
};

type CreateGigResponse = {
  gig: {
    id: string | number;
  };
};

type ApiErrorResponse = {
  message?: string;
};

const inputCls =
  'w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all';

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-neutral-600">{hint}</p> : null}
    </div>
  );
}

export default function CreateGig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    price: '',
    price_type: 'fixed',
    delivery_days: '3',
    tags: '',
    images: '',
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.description.length < 50) {
      toast.error('Description must be at least 50 characters');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price || '0'),
        delivery_days: parseInt(form.delivery_days || '0', 10),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: form.images
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
      };

      const { data } = await api.post<CreateGigResponse>('/gigs', payload);
      toast.success('Gig created successfully!');
      navigate(`/gigs/${data.gig.id}`);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: ApiErrorResponse;
        };
      };

      toast.error(err.response?.data?.message ?? 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-extrabold text-white">Post a Gig</h1>
        <p className="text-neutral-500">
          Offer your skills to students who need them
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field
          label="Gig Title *"
          hint="Be clear and specific (e.g. 'I will build your React web app')"
        >
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            required
            maxLength={200}
            placeholder="I will..."
            className={inputCls}
          />
        </Field>

        <Field label="Category *">
          <select
            name="category"
            value={form.category}
            onChange={handleSelectChange}
            required
            className={inputCls}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c: string) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Description *"
          hint={`${form.description.length}/1000 characters (min 50)`}
        >
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            required
            minLength={50}
            maxLength={1000}
            rows={8}
            placeholder="Describe your gig in detail: what you offer, what the buyer will receive, your process, requirements..."
            className={`${inputCls} resize-y`}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Price (₹) *">
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleInputChange}
              required
              min={1}
              placeholder="500"
              className={inputCls}
            />
          </Field>

          <Field label="Price Type">
            <select
              name="price_type"
              value={form.price_type}
              onChange={handleSelectChange}
              className={inputCls}
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Per Hour</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </Field>

          <Field label="Delivery (days) *">
            <input
              type="number"
              name="delivery_days"
              value={form.delivery_days}
              onChange={handleInputChange}
              required
              min={1}
              max={90}
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label="Tags"
          hint="Comma-separated (e.g. react, nodejs, fullstack)"
        >
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleInputChange}
            placeholder="react, nodejs, fullstack"
            className={inputCls}
          />
        </Field>

        <Field
          label="Image URLs"
          hint="Comma-separated image URLs (optional)"
        >
          <input
            type="text"
            name="images"
            value={form.images}
            onChange={handleInputChange}
            placeholder="https://example.com/image1.jpg, ..."
            className={inputCls}
          />
        </Field>

        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
          <p className="mb-1 text-sm font-medium text-yellow-400/80">
            Tips for a great gig
          </p>
          <ul className="flex list-inside list-disc flex-col gap-1 text-xs text-neutral-500">
            <li>Write a clear, specific title starting with "I will..."</li>
            <li>
              Add a detailed description explaining your process and deliverables
            </li>
            <li>Set a fair price based on your time and skill level</li>
            <li>Use relevant tags to help buyers find your gig</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/gigs')}
            className="rounded-xl border border-neutral-700 px-6 py-3 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 font-bold text-neutral-950 transition-colors hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Publish Gig</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}