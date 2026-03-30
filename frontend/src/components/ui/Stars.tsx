interface Props { rating?: number; count?: number; size?: 'sm' | 'md' | 'lg'; }

export default function Stars({ rating = 0, count, size = 'sm' }: Props) {
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`flex gap-px ${textSize}`}>
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-neutral-700'}>★</span>
        ))}
      </span>
      {rating > 0 && <span className={`${textSize} font-semibold text-neutral-300`}>{Number(rating).toFixed(1)}</span>}
      {count !== undefined && <span className={`${textSize} text-neutral-600`}>({count})</span>}
    </span>
  );
}