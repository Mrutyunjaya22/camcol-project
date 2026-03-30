import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import GigCard from '../components/GigCard';
import ProjectCard from '../components/ProjectCard';
import { PageLoader } from '../components/ui/Loader';
import type { Gig, Project } from '../types';
import { CATEGORIES, categoryIcon } from '../lib/utils';

export default function Home() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/gigs?limit=6&sort=popular'),
      api.get('/projects?limit=4&status=open'),
    ]).then(([g, p]) => {
      setGigs(g.data.gigs);
      setProjects(p.data.projects);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 border-b border-neutral-800">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              🎓 Student-first freelance platform
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-[1.05] tracking-tight mb-6">
              Earn. Collaborate.<br />
              <span className="text-yellow-400">Build your campus career.</span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              Find micro-gigs, join student projects, and build your portfolio—all within your campus community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/gigs" className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold px-7 py-3.5 rounded-xl transition-colors text-base">
                Browse Gigs →
              </Link>
              <Link to="/projects" className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-7 py-3.5 rounded-xl transition-colors text-base border border-neutral-700">
                Explore Projects
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-14 pt-8 border-t border-neutral-800">
              {[['500+', 'Active students'], ['200+', 'Gigs posted'], ['50+', 'Colleges'], ['₹0', 'Platform fee']].map(([num, label]) => (
                <div key={label}>
                  <div className="font-display font-extrabold text-2xl text-white">{num}</div>
                  <div className="text-neutral-600 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-2xl text-white mb-8">Browse by category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {CATEGORIES.slice(0, 14).map(cat => (
              <Link
                key={cat}
                to={`/gigs?category=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all group text-center"
              >
                <span className="text-2xl">{categoryIcon(cat)}</span>
                <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="py-16 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Popular gigs</h2>
              <p className="text-neutral-500 text-sm mt-1">Top-rated services from verified students</p>
            </div>
            <Link to="/gigs" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
              See all →
            </Link>
          </div>
          {loading ? <PageLoader /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gigs.map(g => <GigCard key={g.id} gig={g} />)}
            </div>
          )}
        </div>
      </section>

      {/* Open Projects */}
      <section className="py-16 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Open collaborations</h2>
              <p className="text-neutral-500 text-sm mt-1">Join student projects and build together</p>
            </div>
            <Link to="/projects" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
              See all →
            </Link>
          </div>
          {loading ? <PageLoader /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-yellow-400/10 via-yellow-400/5 to-transparent border border-yellow-400/20 rounded-3xl p-10 md:p-16 text-center">
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-4">
              Ready to start earning?
            </h2>
            <p className="text-neutral-400 text-lg max-w-lg mx-auto mb-8">
              Create your profile, post your first gig, and start connecting with students who need your skills.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold px-8 py-3.5 rounded-xl transition-colors text-base">
                Get started free →
              </Link>
              <Link to="/gigs/create" className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-8 py-3.5 rounded-xl transition-colors text-base border border-neutral-700">
                Post a gig
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}