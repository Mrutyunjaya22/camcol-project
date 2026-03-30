import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/ui/Loader';
import Avatar from '../components/ui/avatar';
import Badge from '../components/ui/badge';
import Stars from '../components/ui/Stars';
import GigCard from '../components/GigCard';
import { formatDate } from '../lib/utils';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(({ data }) => { setProfile(data.user); setGigs(data.gigs); setReviews(data.reviews); })
      .catch(e => setError(e.response?.data?.message ?? 'User not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (error || !profile) return <EmptyState icon="👤" title="User not found" message={error ?? ''} />;

  const isOwn = currentUser?.id === id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-20">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar user={profile} size="xl" className="mb-4" />
              <h1 className="font-display font-extrabold text-2xl text-white mb-1">{profile.name}</h1>
              {profile.is_verified && <Badge variant="yellow">✓ Verified Student</Badge>}
              {profile.rating > 0 && (
                <div className="mt-2">
                  <Stars rating={Number(profile.rating)} count={profile.review_count} size="md" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mb-6 text-sm">
              {profile.college && (
                <div className="flex items-center gap-2.5 text-neutral-400">
                  <span className="text-lg">🎓</span>
                  <span>{profile.college}</span>
                </div>
              )}
              {profile.city && (
                <div className="flex items-center gap-2.5 text-neutral-400">
                  <span className="text-lg">📍</span>
                  <span>{profile.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-neutral-400">
                <span className="text-lg">📅</span>
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-neutral-500 leading-relaxed mb-6 pb-6 border-b border-neutral-800">
                {profile.bio}
              </p>
            )}

            {profile.skills?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-3">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s: string) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {isOwn ? (
              <Link to="/dashboard" className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold py-2.5 rounded-xl text-sm transition-colors">
                Edit Profile
              </Link>
            ) : (
              <Link to={`/messages/${id}`} className="block w-full text-center bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-medium py-2.5 rounded-xl text-sm transition-colors">
                💬 Send Message
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Gigs */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-2xl text-white">
                Gigs <span className="text-neutral-600 font-normal text-lg">({gigs.length})</span>
              </h2>
              {isOwn && (
                <Link to="/gigs/create" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">+ Add Gig</Link>
              )}
            </div>
            {gigs.length === 0 ? (
              <p className="text-neutral-600 text-sm">No gigs posted yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gigs.map(g => <GigCard key={g.id} gig={{ ...g, seller_name: profile.name, seller_avatar: profile.avatar, seller_college: profile.college, seller_verified: profile.is_verified }} />)}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <h2 className="font-display font-bold text-2xl text-white mb-5">
              Reviews <span className="text-neutral-600 font-normal text-lg">({reviews.length})</span>
            </h2>
            {reviews.length === 0 ? (
              <p className="text-neutral-600 text-sm">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={{ name: r.reviewer_name, avatar: r.reviewer_avatar }} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-neutral-200">{r.reviewer_name}</p>
                          {r.reviewer_college && <p className="text-xs text-neutral-600">{r.reviewer_college}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Stars rating={r.rating} />
                        <span className="text-xs text-neutral-600">{formatDate(r.created_at)}</span>
                      </div>
                    </div>
                    {r.gig_title && (
                      <p className="text-xs text-yellow-400/70 mb-2">For: {r.gig_title}</p>
                    )}
                    {r.comment && <p className="text-sm text-neutral-400 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}