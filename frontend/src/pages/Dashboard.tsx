import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { PageLoader } from '../components/ui/Loader';
import Avatar from '../components/ui/avatar';
import Badge from '../components/ui/badge';
import Stars from '../components/ui/Stars';
import { formatCurrency, formatRelative } from '../lib/utils';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'gigs' | 'projects' | 'orders' | 'settings';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/gigs/my'),
      api.get('/projects/my'),
      api.get('/orders?type=selling'),
      api.get('/orders?type=buying'),
      api.get('/messages/unread-count'),
    ]).then(([gigs, projects, selling, buying, unread]) => {
      setData({
        gigs: gigs.data.gigs,
        ownedProjects: projects.data.owned,
        appliedProjects: projects.data.applied,
        sellingOrders: selling.data.orders,
        buyingOrders: buying.data.orders,
        unreadMessages: unread.data.count,
      });
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading your dashboard..." />;

  const stats = [
    { label: 'Active Gigs', value: data.gigs?.filter((g: any) => g.is_active).length ?? 0, icon: '⚡', color: 'text-yellow-400' },
    { label: 'Projects', value: (data.ownedProjects?.length ?? 0) + (data.appliedProjects?.filter((p: any) => p.application_status === 'accepted').length ?? 0), icon: '🚀', color: 'text-blue-400' },
    { label: 'Orders', value: (data.sellingOrders?.length ?? 0) + (data.buyingOrders?.length ?? 0), icon: '📦', color: 'text-emerald-400' },
    { label: 'Messages', value: data.unreadMessages ?? 0, icon: '💬', color: 'text-purple-400' },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'gigs', label: `Gigs (${data.gigs?.length ?? 0})` },
    { key: 'projects', label: `Projects (${(data.ownedProjects?.length ?? 0) + (data.appliedProjects?.length ?? 0)})` },
    { key: 'orders', label: `Orders (${(data.sellingOrders?.length ?? 0) + (data.buyingOrders?.length ?? 0)})` },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <Avatar user={user} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display font-extrabold text-2xl text-white">{user?.name}</h1>
            {user?.is_verified && <Badge variant="yellow">✓ Verified</Badge>}
          </div>
          <p className="text-neutral-500 text-sm">{user?.college} {user?.city ? `· ${user.city}` : ''}</p>
          {user?.rating && user.rating > 0 ? (
            <Stars rating={user.rating} count={user.review_count} />
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link to={`/profile/${user?.id}`} className="text-sm px-4 py-2 rounded-xl border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
            View Profile
          </Link>
          <Link to="/gigs/create" className="text-sm px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold transition-colors">
            + Post Gig
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className={`font-display font-extrabold text-3xl ${s.color}`}>{s.value}</div>
            <div className="text-neutral-600 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-800 mb-8 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${tab === t.key ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab data={data} />}
      {tab === 'gigs' && <GigsTab gigs={data.gigs} />}
      {tab === 'projects' && <ProjectsTab owned={data.ownedProjects} applied={data.appliedProjects} />}
      {tab === 'orders' && <OrdersTab selling={data.sellingOrders} buying={data.buyingOrders} />}
      {tab === 'settings' && <SettingsTab user={user} onUpdate={updateUser} />}
    </div>
  );
}

/* ---- Sub-tabs ---- */

function OverviewTab({ data }: { data: any }) {
  const recentGigs = data.gigs?.slice(0, 3) ?? [];
  const recentOrders = [...(data.sellingOrders ?? []), ...(data.buyingOrders ?? [])].slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <SectionTitle>Recent Gigs</SectionTitle>
        {recentGigs.length === 0 ? (
          <p className="text-sm text-neutral-600">No gigs yet. <Link to="/gigs/create" className="text-yellow-400 hover:underline">Post your first one!</Link></p>
        ) : recentGigs.map((g: any) => (
          <Link key={g.id} to={`/gigs/${g.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/60 transition-colors group mb-2">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-lg shrink-0">
              {g.is_active ? '⚡' : '⏸'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200 group-hover:text-yellow-400 transition-colors truncate">{g.title}</p>
              <p className="text-xs text-neutral-600">{formatCurrency(Number(g.price))} · {g.order_count} orders</p>
            </div>
            <Badge variant={g.is_active ? 'green' : 'default'}>{g.is_active ? 'Active' : 'Paused'}</Badge>
          </Link>
        ))}
      </div>

      <div>
        <SectionTitle>Recent Orders</SectionTitle>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-600">No orders yet.</p>
        ) : recentOrders.map((o: any) => (
          <Link key={o.id} to="/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/60 transition-colors mb-2">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-lg shrink-0">📦</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200 truncate">{o.gig_title}</p>
              <p className="text-xs text-neutral-600">{formatCurrency(Number(o.amount))} · {formatRelative(o.created_at)}</p>
            </div>
            <OrderStatusBadge status={o.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function GigsTab({ gigs }: { gigs: any[] }) {
  if (!gigs?.length) return (
    <div className="text-center py-16">
      <p className="text-neutral-600 mb-4">You haven't posted any gigs yet.</p>
      <Link to="/gigs/create" className="bg-yellow-400 text-neutral-950 font-bold px-6 py-3 rounded-xl text-sm hover:bg-yellow-300 transition-colors">Post your first gig</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {gigs.map((g: any) => (
        <div key={g.id} className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-xl shrink-0">⚡</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-200 truncate">{g.title}</p>
            <p className="text-sm text-neutral-500">{g.category} · {formatCurrency(Number(g.price))} · {g.order_count} orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={g.is_active ? 'green' : 'default'}>{g.is_active ? 'Active' : 'Paused'}</Badge>
            <Link to={`/gigs/${g.id}/edit`} className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors">Edit</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsTab({ owned, applied }: { owned: any[]; applied: any[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle>Projects I Own ({owned?.length ?? 0})</SectionTitle>
        {!owned?.length ? (
          <p className="text-sm text-neutral-600">No owned projects. <Link to="/projects/create" className="text-yellow-400 hover:underline">Start one!</Link></p>
        ) : owned.map((p: any) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/60 transition-colors group mb-2">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-lg">🚀</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200 group-hover:text-yellow-400 transition-colors truncate">{p.title}</p>
              <p className="text-xs text-neutral-600">{p.category} {p.pending_count > 0 && `· ${p.pending_count} pending applications`}</p>
            </div>
            <Badge variant={p.status === 'open' ? 'green' : 'default'}>{p.status}</Badge>
          </Link>
        ))}
      </div>

      <div>
        <SectionTitle>Projects I Applied To ({applied?.length ?? 0})</SectionTitle>
        {!applied?.length ? (
          <p className="text-sm text-neutral-600">No applications sent. <Link to="/projects" className="text-yellow-400 hover:underline">Browse projects!</Link></p>
        ) : applied.map((p: any) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/60 transition-colors group mb-2">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-lg">📋</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200 group-hover:text-yellow-400 transition-colors truncate">{p.title}</p>
              <p className="text-xs text-neutral-600">{p.owner_name} · {p.category}</p>
            </div>
            <Badge variant={p.application_status === 'accepted' ? 'green' : p.application_status === 'rejected' ? 'red' : 'yellow'}>
              {p.application_status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ selling, buying }: { selling: any[]; buying: any[] }) {
  const [view, setView] = useState<'selling' | 'buying'>('selling');
  const orders = view === 'selling' ? selling : buying;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(['selling', 'buying'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === v ? 'bg-yellow-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'}`}>
            {v === 'selling' ? `Selling (${selling?.length ?? 0})` : `Buying (${buying?.length ?? 0})`}
          </button>
        ))}
      </div>
      {!orders?.length ? (
        <p className="text-sm text-neutral-600 text-center py-12">No {view} orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o: any) => (
            <div key={o.id} className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-xl shrink-0">📦</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-200 truncate">{o.gig_title}</p>
                <p className="text-sm text-neutral-500">
                  {view === 'selling' ? `From: ${o.buyer_name}` : `By: ${o.seller_name}`} · {formatCurrency(Number(o.amount))} · {formatRelative(o.created_at)}
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [form, setForm] = useState({
    name: user?.name ?? '', college: user?.college ?? '', city: user?.city ?? '',
    bio: user?.bio ?? '', skills: (user?.skills ?? []).join(', '), avatar: user?.avatar ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      onUpdate(data.user);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all";

  return (
    <div className="max-w-xl flex flex-col gap-5">
      {[
        { label: 'Full Name', k: 'name', placeholder: 'Your name' },
        { label: 'College', k: 'college', placeholder: 'IIT Bombay' },
        { label: 'City', k: 'city', placeholder: 'Mumbai' },
        { label: 'Avatar URL', k: 'avatar', placeholder: 'https://...' },
        { label: 'Skills', k: 'skills', placeholder: 'React, Node.js, Design...' },
      ].map(({ label, k, placeholder }) => (
        <div key={k} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{label}</label>
          <input value={(form as any)[k]} onChange={set(k)} placeholder={placeholder} className={inputCls} />
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Bio</label>
        <textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Tell students about yourself..." className={`${inputCls} resize-y`} />
      </div>
      <button onClick={handleSave} disabled={saving}
        className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

/* ---- Helpers ---- */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display font-bold text-base text-neutral-300 mb-3 pb-2 border-b border-neutral-800">{children}</h3>
);

const orderStatusVariant: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'default'> = {
  completed: 'green', active: 'blue', pending: 'yellow', cancelled: 'red', disputed: 'red',
};
const OrderStatusBadge = ({ status }: { status: string }) => (
  <Badge variant={orderStatusVariant[status] ?? 'default'}>{status}</Badge>
);