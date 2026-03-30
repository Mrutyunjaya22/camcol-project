import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { PageLoader } from '../components/ui/Loader';
import Avatar from '../components/ui/avatar';
import Badge from '../components/ui/badge';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

const statusVariant: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'default'> = {
  completed: 'green', active: 'blue', pending: 'yellow', cancelled: 'red', disputed: 'red',
};

export default function Orders() {
  const [view, setView] = useState<'selling' | 'buying'>('buying');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?type=${view}`);
      setOrders(data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [view]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data.order } : o));
      toast.success(`Order ${status}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Action failed');
    }
  };

  const getActions = (order: any) => {
    if (view === 'selling') {
      if (order.status === 'pending') return [{ label: 'Accept', action: 'active', variant: 'green' }, { label: 'Cancel', action: 'cancelled', variant: 'red' }];
      if (order.status === 'active') return [{ label: 'Mark Complete', action: 'completed', variant: 'green' }];
    } else {
      if (order.status === 'pending') return [{ label: 'Cancel', action: 'cancelled', variant: 'red' }];
      if (order.status === 'active') return [{ label: 'Dispute', action: 'disputed', variant: 'red' }];
    }
    return [];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">My Orders</h1>
        <p className="text-neutral-500">Track and manage your gig orders</p>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        {(['buying', 'selling'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${view === v ? 'bg-yellow-400 text-neutral-950 font-bold' : 'bg-neutral-800 border border-neutral-700 text-neutral-400 hover:bg-neutral-700'}`}>
            {v === 'buying' ? '🛒 Buying' : '💼 Selling'}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-20">📦</div>
          <p className="text-neutral-500 mb-4">No {view} orders yet</p>
          {view === 'buying' && (
            <Link to="/gigs" className="bg-yellow-400 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors">
              Browse Gigs
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const actions = getActions(order);
            const other = view === 'selling'
              ? { name: order.buyer_name, avatar: order.buyer_avatar }
              : { name: order.seller_name, avatar: order.seller_avatar };

            return (
              <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Gig thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl shrink-0">
                    {order.gig_images?.[0]
                      ? <img src={order.gig_images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                      : '📦'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-neutral-100">{order.gig_title}</h3>
                      <Badge variant={statusVariant[order.status] ?? 'default'}>{order.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar user={other} size="xs" />
                      <span className="text-sm text-neutral-500">
                        {view === 'selling' ? 'From' : 'By'}: {other.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 flex-wrap">
                      <span>💰 {formatCurrency(Number(order.amount))}</span>
                      <span>📅 {formatDate(order.created_at)}</span>
                      {order.delivery_date && <span>🕐 Due {formatDate(order.delivery_date)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {actions.length > 0 && (
                    <div className="flex gap-2 shrink-0">
                      {actions.map(({ label, action, variant }) => (
                        <button
                          key={action}
                          onClick={() => handleStatusUpdate(order.id, action)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                            variant === 'green'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {order.requirements && (
                  <div className="mt-4 p-3 rounded-xl bg-neutral-800 border border-neutral-700">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Requirements</p>
                    <p className="text-sm text-neutral-400">{order.requirements}</p>
                  </div>
                )}

                {/* Message button */}
                {order.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-neutral-800">
                    <Link
                      to={`/messages/${view === 'selling' ? order.buyer_id : order.seller_id}`}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                    >
                      💬 Message {view === 'selling' ? 'buyer' : 'seller'}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}