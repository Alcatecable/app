import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Terminal, 
  LogOut, 
  User,
  ExternalLink,
  Menu,
  X 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

export const UnifiedHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { href: "https://neurolint.dev", label: "Home", external: true },
    { href: "/neurolint", label: "NeuroLint", external: false },
    { href: "/admin", label: "Dashboard", external: false },
    { href: "https://docs.neurolint.dev", label: "Docs", external: true },
    { href: "https://forum.neurolint.dev", label: "Forum", external: true },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-zinc-800/50 backdrop-blur-xl transition-all duration-500 ${
        isScrolled
          ? "bg-black/98 shadow-2xl shadow-black/50 border-zinc-700/70"
          : "bg-black/95 border-zinc-800/50"
      }`}
      role="banner"
      aria-label="Site header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Home Link */}
          <div className="flex items-center">
            <a
              href="https://neurolint.dev"
              className="flex items-center group"
              aria-label="NeuroLint home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                <Terminal className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-gray-300 transition-colors">
                NeuroLint
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigationItems.map((item, index) => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300 flex items-center gap-1"
                >
                  {item.label}
                  {item.label === "Home" && <ExternalLink className="w-3 h-3" />}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="hidden md:inline text-sm text-zinc-300">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="hidden md:inline-flex border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                >
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-zinc-300 hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hidden md:inline-flex text-zinc-300 hover:bg-zinc-800"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-white text-black hover:bg-gray-100 font-medium"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 h-10 w-10 p-0"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <div className="relative w-5 h-5">
                  <Menu
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                      isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                      isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                    }`}
                  />
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Overlay */}
          <div
            className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
              isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                isMenuOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <div
              ref={menuRef}
              id="mobile-menu"
              className={`absolute top-16 left-0 right-0 bg-black/98 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl transform transition-all duration-400 ${
                isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
              }`}
              role="navigation"
              aria-label="Mobile navigation menu"
              aria-hidden={!isMenuOpen}
            >
              <nav className="px-4 py-6 space-y-1">
                {navigationItems.map((item, index) => (
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-4 text-lg font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300 flex items-center justify-between"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block px-6 py-4 text-lg font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                ))}

                {/* Mobile Auth Section */}
                <div className="border-t border-zinc-800/50 mt-4 pt-4 px-4 space-y-3">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-zinc-400">
                        {user.email}
                      </div>
                      <Link
                        to="/profile"
                        className="block w-full px-6 py-3 text-center text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-6 py-3 text-center text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate('/auth');
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-6 py-3 text-center text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-all duration-300"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => {
                          navigate('/auth');
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-6 py-3 text-center bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-300"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};