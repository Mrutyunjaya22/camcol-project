import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-display font-extrabold text-neutral-800 mb-2">404</div>
      <h1 className="font-display font-bold text-2xl text-white mb-3">Page not found</h1>
      <p className="text-neutral-500 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Link to="/" className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold px-6 py-3 rounded-xl transition-colors">
          Go home
        </Link>
        <Link to="/gigs" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-medium px-6 py-3 rounded-xl transition-colors">
          Browse gigs
        </Link>
      </div>
    </div>
  );
}