import { User } from "lucide-react";

const AvatarEl = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center`}>
      {initials || <User size={16} />}
    </div>
  );
};

export default AvatarEl;
