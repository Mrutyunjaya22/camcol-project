export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-10 h-10 border-4' : 'w-7 h-7 border-[3px]';
  return (
    <div className={`${s} border-neutral-700 border-t-yellow-400 rounded-full animate-spin`} />
  );
}

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <Spinner size="lg" />
      <p className="text-neutral-500 text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, message, action }: {
  icon?: string; title: string; message?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl opacity-30">{icon}</span>
      <div>
        <h3 className="font-display font-bold text-neutral-300 text-lg">{title}</h3>
        {message && <p className="text-neutral-600 text-sm mt-1 max-w-xs">{message}</p>}
      </div>
      {action}
    </div>
  );
}