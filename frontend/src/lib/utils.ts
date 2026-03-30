export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatRelative = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

export const getInitials = (name: string): string =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

export const categoryIcon = (cat: string): string => {
  const map: Record<string, string> = {
    'Web Development': '💻', 'Design': '🎨', 'Content Writing': '✍️',
    'Mobile Development': '📱', 'DevOps': '⚙️', 'Data Science': '📊',
    'Video Editing': '🎬', 'Photography': '📷', 'Marketing': '📣',
    'Tutoring': '📚', 'Music': '🎵', 'Translation': '🌐',
    'Social Impact': '💡', 'Research': '🔬',
  };
  return map[cat] ?? '⚡';
};

export const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Design', 'Content Writing',
  'DevOps', 'Data Science', 'Video Editing', 'Photography',
  'Marketing', 'Tutoring', 'Music', 'Translation', 'Social Impact', 'Research',
];

export const statusBadge: Record<string, string> = {
  open: 'badge-open',
  in_progress: 'badge-progress',
  completed: 'badge-done',
  closed: 'badge-closed',
  pending: 'badge-warning',
  active: 'badge-progress',
  cancelled: 'badge-closed',
  disputed: 'badge-danger',
};

export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ');