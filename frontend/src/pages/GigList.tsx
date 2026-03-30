import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGigs } from '../hooks/useGigs';
import GigCard from '../components/GigCard';
import { PageLoader, EmptyState } from '../components/ui/Loader';
import { CATEGORIES } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function GigsList() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    sort: params.get('sort') ?? 'newest',
    page: 1,
  });
  const [searchInput, setSearchInput] = useState(filters.search);
  const { gigs, total, pages, loading } = useGigs(filters);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">Browse Gigs</h1>
        <p className="text-neutral-500">{total > 0 ? `${total} gigs available` : 'Find talented students for your needs'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sticky top-20">
            <h3 className="font-display font-bold text-sm text-neutral-300 mb-4 uppercase tracking-wider">Filters</h3>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-5">
              <div className="flex gap-2">
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search gigs..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all"
                />
                <button type="submit" className="bg-yellow-400 text-neutral-950 px-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors">
                  →
                </button>
              </div>
            </form>

            {/* Category */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2.5">Category</p>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${!filters.category ? 'text-yellow-400 bg-yellow-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                >
                  All categories
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter('category', cat)}
                    className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${filters.category === cat ? 'text-yellow-400 bg-yellow-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2.5">Price (₹)</p>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Min" value={filters.minPrice}
                  onChange={e => setFilter('minPrice', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 rounded-lg px-3 py-2 text-sm text-neutral-100 outline-none"
                />
                <input
                  type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={e => setFilter('maxPrice', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 rounded-lg px-3 py-2 text-sm text-neutral-100 outline-none"
                />
              </div>
            </div>

            {/* Reset */}
            {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => { setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 }); setSearchInput(''); }}
                className="w-full text-sm text-red-400 hover:text-red-300 py-2 border border-neutral-800 rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm text-neutral-500">{loading ? 'Loading...' : `${total} gigs`}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600">Sort:</span>
              <select
                value={filters.sort}
                onChange={e => setFilter('sort', e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 px-3 py-1.5 rounded-lg outline-none"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : gigs.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No gigs found"
              message="Try adjusting your filters or search query"
              action={
                <Link to="/gigs/create" className="bg-yellow-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors">
                  Post a gig
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {gigs.map(g => <GigCard key={g.id} gig={g} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setFilters(f => ({ ...f, page: p }))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === filters.page ? 'bg-yellow-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'}`}
                    >
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