import { Link } from 'react-router-dom';
import type { Gig } from '../types';
import Stars from './Stars'; // change if Stars is in ui folder
import Avatar from './ui/avatar';
import Badge from './ui/badge';
import { formatCurrency, categoryIcon } from '../utils/utils';

interface GigCardProps {
  gig: Gig;
}

export default function GigCard({ gig }: GigCardProps) {
  const seller = {
    id: gig.seller_id,
    name: gig.seller_name ?? 'Unknown Seller',
    avatar: gig.seller_avatar,
    college: gig.seller_college,
  };

  return (
    <Link to={`/gigs/${gig.id}`}>
      <div className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 h-full flex flex-col">
        
        {/* Thumbnail */}
        <div className="h-40 bg-neutral-800 relative overflow-hidden shrink-0">
          {gig.images?.[0] ? (
            <img
              src={gig.images[0]}
              alt={gig.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
              {categoryIcon(gig.category)}
            </div>
          )}

          <div className="absolute top-2.5 left-2.5">
            <Badge>{gig.category}</Badge>
          </div>

          {gig.seller_verified && (
            <div className="absolute top-2.5 right-2.5">
              <Badge variant="yellow">✓ Verified</Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          
          {/* Seller */}
          <div className="flex items-center gap-2.5">
            <Avatar user={seller} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-200 truncate">{seller.name}</p>
              {seller.college && (
                <p className="text-xs text-neutral-600 truncate">{seller.college}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-neutral-100 leading-snug line-clamp-2 flex-1">
            {gig.title}
          </h3>

          {/* Rating */}
          {gig.review_count > 0 && (
            <Stars rating={Number(gig.rating)} count={gig.review_count} />
          )}

          {/* Price footer */}
          <div className="flex items-end justify-between pt-3 border-t border-neutral-800 mt-auto">
            <div>
              <p className="text-xs text-neutral-600 mb-0.5">Starting at</p>
              <p className="font-display font-extrabold text-yellow-400 text-lg leading-none">
                {formatCurrency(Number(gig.price))}
                <span className="text-neutral-600 font-normal text-xs font-sans ml-0.5">
                  {gig.price_type === 'hourly'
                    ? '/hr'
                    : gig.price_type === 'negotiable'
                    ? '+'
                    : ''}
                </span>
              </p>
            </div>

            <p className="text-xs text-neutral-600">
              🕐 {gig.delivery_days}d delivery
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}