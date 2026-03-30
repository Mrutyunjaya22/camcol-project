import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 mt-20 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display font-extrabold text-xl mb-3 tracking-tight">
              <span className="text-yellow-400">●</span> Camcol
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed">
              The hyperlocal student-first freelance &amp; collaboration platform. Build your portfolio, earn, and grow.
            </p>
          </div>
          <FooterCol title="Platform" links={[['Browse Gigs', '/gigs'], ['Find Projects', '/projects'], ['Post a Gig', '/gigs/create'], ['Create Project', '/projects/create']]} />
          <FooterCol title="Account" links={[['Sign Up', '/register'], ['Log In', '/login'], ['Dashboard', '/dashboard'], ['My Orders', '/orders']]} />
          <FooterCol title="Categories" links={[['Web Dev', '/gigs?category=Web+Development'], ['Design', '/gigs?category=Design'], ['Content Writing', '/gigs?category=Content+Writing'], ['Mobile Dev', '/gigs?category=Mobile+Development']]} />
        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-sm">© {new Date().getFullYear()} Camcol. Built for students, by students.</p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Support'].map(label => (
              <a key={label} href="#" className="text-neutral-600 hover:text-neutral-400 text-sm transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterCol = ({ title, links }: { title: string; links: [string, string][] }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">{title}</div>
    <div className="flex flex-col gap-2.5">
      {links.map(([label, path]) => (
        <Link key={label} to={path} className="text-neutral-500 hover:text-yellow-400 text-sm transition-colors">{label}</Link>
      ))}
    </div>
  </div>
);