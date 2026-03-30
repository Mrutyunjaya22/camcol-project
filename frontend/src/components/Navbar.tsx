import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-yellow-400/10 text-yellow-400'
      : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'}`;

  return (
    <nav className={`sticky top-0 z-50 border-b border-neutral-800 transition-all duration-200 ${scrolled ? 'bg-neutral-950/95 backdrop-blur-md' : 'bg-neutral-950'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl tracking-tight shrink-0">
          <span className="text-yellow-400 text-2xl">●</span>
          <span className="text-white">Camcol</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1 flex-1">
          <NavLink to="/gigs" className={navLinkClass}>Gigs</NavLink>
          <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link to="/gigs/create" className="hidden md:flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                <span>+</span> Post Gig
              </Link>
              <Link to="/messages" className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-white/5 text-neutral-400 hover:text-white transition-all">
                💬
              </Link>

              {/* Dropdown */}
              <div ref={dropRef} className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl px-2.5 py-1.5 transition-colors"
                >
                  <Avatar user={user} size="sm" />
                  <span className="hidden md:block text-sm font-medium text-neutral-200">{user.name.split(' ')[0]}</span>
                  <span className="text-neutral-600 text-xs">▾</span>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50">
                    <DropItem to="/dashboard" onClick={() => setDropOpen(false)}>📊 Dashboard</DropItem>
                    <DropItem to={`/profile/${user.id}`} onClick={() => setDropOpen(false)}>👤 My Profile</DropItem>
                    <DropItem to="/orders" onClick={() => setDropOpen(false)}>📦 My Orders</DropItem>
                    <DropItem to="/messages" onClick={() => setDropOpen(false)}>💬 Messages</DropItem>
                    <div className="h-px bg-neutral-800 my-1.5" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      ↩ Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-neutral-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors font-medium">
                Log in
              </Link>
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                Join free
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-neutral-400 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-800 px-4 py-3 flex flex-col gap-1">
          <MobileLink to="/gigs" onClick={() => setMobileOpen(false)}>Gigs</MobileLink>
          <MobileLink to="/projects" onClick={() => setMobileOpen(false)}>Projects</MobileLink>
          {user && (
            <>
              <MobileLink to="/gigs/create" onClick={() => setMobileOpen(false)}>+ Post a Gig</MobileLink>
              <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/messages" onClick={() => setMobileOpen(false)}>Messages</MobileLink>
              <MobileLink to="/orders" onClick={() => setMobileOpen(false)}>Orders</MobileLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const DropItem = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:text-neutral-100 hover:bg-white/5 transition-colors"
  >
    {children}
  </Link>
);

const MobileLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-yellow-400/10 text-yellow-400' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`
    }
  >
    {children}
  </NavLink>
);