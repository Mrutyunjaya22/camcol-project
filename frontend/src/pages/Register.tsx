import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Loader';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  college: string;
  city: string;
};

type FieldProps = {
  label: string;
  name: keyof RegisterForm;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {label}
        {required && <span className="ml-1 text-yellow-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
      />
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    college: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange =
    (key: keyof RegisterForm) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(form);
      toast.success('Account created! Welcome to Camcol 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="font-display mb-2 text-3xl font-extrabold">
            <span className="text-yellow-400">●</span> Join Camcol
          </div>
          <p className="text-neutral-500">Create your free student account</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Full name"
              name="name"
              placeholder="Arjun Mehta"
              required
              value={form.name}
              onChange={handleChange('name')}
            />

            <Field
              label="College email"
              name="email"
              type="email"
              placeholder="you@college.ac.in"
              required
              value={form.email}
              onChange={handleChange('email')}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              required
              value={form.password}
              onChange={handleChange('password')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="College"
                name="college"
                placeholder="IIT Bombay"
                value={form.college}
                onChange={handleChange('college')}
              />

              <Field
                label="City"
                name="city"
                placeholder="Mumbai"
                value={form.city}
                onChange={handleChange('city')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 font-bold text-neutral-950 transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-600">
            By signing up, you agree to our Terms & Privacy Policy.
          </p>

          <div className="mt-6 border-t border-neutral-800 pt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-yellow-400 transition-colors hover:text-yellow-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}