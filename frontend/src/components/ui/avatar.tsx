import type { User } from '../../types';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-22 h-22 text-2xl',
};

interface Props {
  user?: Partial<User> | null;
  size?: keyof typeof sizes;
  className?: string;
}

export default function Avatar({ user, size = 'md', className = '' }: Props) {
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const base = `rounded-full object-cover shrink-0 flex items-center justify-center font-display font-bold ${sizes[size]} ${className}`;

  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${base} bg-neutral-800`} />;
  }

  return (
    <div className={`${base} bg-yellow-400/10 text-yellow-400 border border-yellow-400/20`}>
      {initials}
    </div>
  );
}