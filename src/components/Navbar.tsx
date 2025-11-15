import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid3x3, Bookmark, History, Menu, CalendarDays, Heart, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from './ui/button';

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/genres', label: 'Genres', icon: Grid3x3 },
    { to: '/all-anime', label: 'All Anime', icon: Grid3x3 },
    { to: '/schedule', label: 'Schedule', icon: CalendarDays },
    { to: '/mylist', label: 'MyList', icon: Bookmark },
    { to: '/history', label: 'History', icon: History },
    { to: '/about', label: 'About', icon: Info },
  ];

  const NavLink = ({ to, label, icon: Icon, isMobile = false, onClick }: { to: string, label: string, icon: any, isMobile?: boolean, onClick?: () => void }) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
        location.pathname === to ? 'text-primary' : 'text-muted-foreground',
        isMobile && 'px-4 py-3 rounded-lg gap-3',
        isMobile && location.pathname === to && 'bg-secondary'
      )}
    >
      <Icon className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
      {label}
    </Link>
  );
  
  const DonationLink = ({ isMobile = false, onClick }: { isMobile?: boolean, onClick?: () => void }) => (
    <a
      href="https://saweria.co/Gxyenn"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 text-sm font-medium transition-colors text-pink-500 hover:text-pink-400',
        isMobile && 'px-4 py-3 rounded-lg gap-3'
      )}
    >
      <Heart className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
      Donasi
    </a>
  );


  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow-purple">
              <span className="text-2xl font-bold text-primary-foreground">V</span>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">
              Vely<span className="text-primary">Stream</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => <NavLink key={item.to} {...item} />)}
            <DonationLink />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-2 p-4">
                    {navItems.map((item) => (
                        <SheetClose asChild key={item.to}>
                            <NavLink {...item} isMobile />
                        </SheetClose>
                    ))}
                    <div className="pt-2 border-t border-border">
                        <SheetClose asChild>
                            <DonationLink isMobile />
                        </SheetClose>
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};