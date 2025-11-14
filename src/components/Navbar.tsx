import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid3x3, Bookmark, History, Menu, X, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/genres', label: 'Genres', icon: Grid3x3 },
    { to: '/all-anime', label: 'All Anime', icon: Grid3x3 },
    { to: '/schedule', label: 'Schedule', icon: CalendarDays },
    { to: '/mylist', label: 'MyList', icon: Bookmark },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow-purple">
              <span className="text-2xl font-bold text-primary-foreground">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Vely<span className="text-primary">Stream</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === to ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 hover:bg-secondary"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-border py-4 md:hidden">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary',
                  location.pathname === to ? 'bg-secondary text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};