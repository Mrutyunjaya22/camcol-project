import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { PageLoader, EmptyState } from '../components/ui/Loader';
import { CATEGORIES } from '../lib/utils';

export default function ProjectsList() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    status: params.get('status') ?? 'open',
    is_paid: params.get('is_paid') ?? '',
    page: 1,
  });
  const [searchInput, setSearchInput] = useState(filters.search);
  const { projects, total, pages, loading } = useProjects(filters);

  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 1) p.set(k, String(v)); });
    setParams(p, { replace: true });
  }, [filters]);

  const setFilter = (k: string, v: any) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  const statusOptions = [
    { value: 'open', label: '🟢 Open' },
    { value: 'in_progress', label: '🔵 In Progress' },
    { value: 'completed', label: '⚪ Completed' },
    { value: '', label: 'All' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-4xl text-white mb-2">Projects</h1>
          <p className="text-neutral-500">Join student-led projects and build together</p>
        </div>
        <Link to="/projects/create"
          className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
          + Start a Project
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sticky top-20">
            <h3 className="font-display font-bold text-sm text-neutral-300 mb-4 uppercase tracking-wider">Filters</h3>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-5">
              <div className="flex gap-2">
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search projects..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 focus:border-yellow-400 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all" />
                <button type="submit" className="bg-yellow-400 text-neutral-950 px-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors">→</button>
              </div>
            </form>

            {/* Status */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2.5">Status</p>
              <div className="flex flex-col gap-1">
                {statusOptions.map(opt => (
                  <button key={opt.value} onClick={() => setFilter('status', opt.value)}
                    className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${filters.status === opt.value ? 'text-yellow-400 bg-yellow-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2.5">Type</p>
              <div className="flex flex-col gap-1">
                {[['', 'All'], ['false', '🎓 Volunteer'], ['true', '💰 Paid']].map(([val, label]) => (
                  <button key={val} onClick={() => setFilter('is_paid', val)}
                    className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${filters.is_paid === val ? 'text-yellow-400 bg-yellow-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2.5">Category</p>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                <button onClick={() => setFilter('category', '')}
                  className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${!filters.category ? 'text-yellow-400 bg-yellow-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilter('category', cat)}
                    className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${filters.category === cat ? 'text-yellow-400 bg-yellow-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-500 mb-5">{loading ? 'Loading...' : `${total} projects`}</p>
          {loading ? <PageLoader /> : projects.length === 0 ? (
            <EmptyState icon="🚀" title="No projects found" message="Be the first to start one!"
              action={<Link to="/projects/create" className="bg-yellow-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors">Start a project</Link>} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === filters.page ? 'bg-yellow-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}