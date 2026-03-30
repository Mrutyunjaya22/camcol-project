import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGig } from '../hooks/useGigs';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/ui/Loader';
import Stars from '../components/ui/Stars';
import Avatar from '../components/ui/avatar';
import Badge from '../components/ui/badge';
import api from '../api/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, formatRelative, categoryIcon } from '../lib/utils';

export default function GigDetail() {
  const { id } = useParams<{ id: string }>();
  const { gig, reviews, isSaved, setIsSaved, loading, error } = useGig(id!);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [savingGig, setSavingGig] = useState(false);

  if (loading) return <PageLoader />;
  if (error || !gig) return <EmptyState icon="😕" title="Gig not found" message={error ?? ''} />;

  const isOwner = user?.id === gig.user_id;
  const seller = {
    id: gig.seller_id, name: gig.seller_name ?? '', avatar: gig.seller_avatar,
    college: gig.seller_college, city: gig.seller_city, bio: gig.seller_bio,
    skills: gig.seller_skills ?? [], is_verified: gig.seller_verified ?? false,
    rating: gig.seller_rating ?? 0, review_count: gig.seller_review_count ?? 0,
  };

  const handleOrder = async () => {
    if (!user) { navigate('/login?redirect=/gigs/' + id); return; }
    setOrdering(true);
    try {
      await api.post('/orders', { gig_id: id, requirements });
      toast.success('Order placed successfully!');
      setShowOrderModal(false);
      navigate('/orders');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Order failed');
    } finally {
      setOrdering(false);
    }
  };

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    setSavingGig(true);
    try {
      const { data } = await api.post(`/gigs/${id}/save`);
      setIsSaved(data.saved);
      toast.success(data.saved ? 'Gig saved!' : 'Gig unsaved');
    } catch {
      toast.error('Failed to save gig');
    } finally {
      setSavingGig(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link to="/gigs" className="hover:text-neutral-400 transition-colors">Gigs</Link>
            <span>/</span>
            <Badge>{gig.category}</Badge>
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white leading-tight mb-5">
            {gig.title}
          </h1>

          {/* Seller info */}
          <Link to={`/profile/${seller.id}`} className="flex items-center gap-3 mb-6 group w-fit">
            <Avatar user={seller} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-200 group-hover:text-yellow-400 transition-colors">{seller.name}</span>
                {seller.is_verified && <Badge variant="yellow">✓ Verified</Badge>}
              </div>
              <div className="text-sm text-neutral-500">{seller.college ?? seller.city ?? ''}</div>
            </div>
            {seller.rating > 0 && (
              <div className="ml-4">
                <Stars rating={seller.rating} count={seller.review_count} />
              </div>
            )}
          </Link>

          {/* Image */}
          {gig.images?.[0] ? (
            <img src={gig.images[0]} alt={gig.title} className="w-full h-72 md:h-96 object-cover rounded-2xl mb-8 border border-neutral-800" />
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-7xl opacity-10 bg-neutral-900 rounded-2xl mb-8 border border-neutral-800">
              {categoryIcon(gig.category)}
            </div>
          )}

          {/* Description */}
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-white mb-4">About this gig</h2>
            <div className="prose prose-invert max-w-none text-neutral-400 leading-relaxed whitespace-pre-wrap text-sm">
              {gig.description}
            </div>
          </section>

          {/* Tags */}
          {gig.tags?.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display font-bold text-xl text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {gig.tags.map(t => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400">
                    #{t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-white mb-6">
              Reviews {reviews.length > 0 && <span className="text-neutral-600 font-normal text-base">({reviews.length})</span>}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-neutral-600 text-sm">No reviews yet. Be the first to order!</p>
            ) : (
              <div className="flex flex-col gap-5">
                {reviews.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar user={{ name: r.reviewer_name, avatar: r.reviewer_avatar }} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-neutral-200">{r.reviewer_name}</div>
                        {r.reviewer_college && <div className="text-xs text-neutral-600">{r.reviewer_college}</div>}
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <Stars rating={r.rating} />
                        <span className="text-xs text-neutral-600">{formatRelative(r.created_at)}</span>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-neutral-400 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sticky sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="mb-5">
                <p className="text-xs text-neutral-600 mb-1">Starting at</p>
                <div className="font-display font-extrabold text-4xl text-yellow-400">
                  {formatCurrency(Number(gig.price))}
                  <span className="text-neutral-600 font-normal text-lg font-sans ml-1">
                    {gig.price_type === 'hourly' ? '/hr' : gig.price_type === 'negotiable' ? '+' : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6 py-4 border-y border-neutral-800">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Delivery time</span>
                  <span className="text-neutral-200 font-medium">{gig.delivery_days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Orders completed</span>
                  <span className="text-neutral-200 font-medium">{gig.order_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Rating</span>
                  <Stars rating={Number(gig.rating)} count={gig.review_count} size="sm" />
                </div>
              </div>

              {isOwner ? (
                <div className="flex flex-col gap-2">
                  <Link to={`/gigs/${id}/edit`} className="w-full text-center bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold py-3 rounded-xl transition-colors text-sm">
                    Edit Gig
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { if (!user) { navigate('/login'); return; } setShowOrderModal(true); }}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold py-3 rounded-xl transition-colors text-sm"
                  >
                    Order Now
                  </button>
                  <button
                    onClick={handleSave} disabled={savingGig}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-colors border ${isSaved ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400' : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'}`}
                  >
                    {isSaved ? '♥ Saved' : '♡ Save gig'}
                  </button>
                  <Link
                    to={`/messages/${seller.id}`}
                    className="w-full text-center py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-neutral-700 transition-colors"
                  >
                    💬 Contact seller
                  </Link>
                </div>
              )}
            </div>

            {/* Seller card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mt-4">
              <Link to={`/profile/${seller.id}`} className="flex items-center gap-3 mb-4 group">
                <Avatar user={seller} size="md" />
                <div>
                  <div className="font-semibold text-neutral-200 group-hover:text-yellow-400 transition-colors text-sm">{seller.name}</div>
                  <div className="text-xs text-neutral-600">{seller.college}</div>
                </div>
              </Link>
              {seller.bio && <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-3">{seller.bio}</p>}
              {seller.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {seller.skills.slice(0, 5).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-500">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowOrderModal(false)}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl text-white mb-5">Place Order</h3>
            <div className="flex justify-between text-sm mb-4 p-4 bg-neutral-800 rounded-xl">
              <span className="text-neutral-400">{gig.title}</span>
              <span className="font-bold text-yellow-400">{formatCurrency(Number(gig.price))}</span>
            </div>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Requirements (optional)</label>
              <textarea
                value={requirements} onChange={e => setRequirements(e.target.value)}
                rows={4} placeholder="Describe what you need, share links, attachments..."
                className="bg-neutral-800 border border-neutral-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowOrderModal(false)} className="flex-1 py-3 rounded-xl text-sm border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleOrder} disabled={ordering}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                {ordering ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}