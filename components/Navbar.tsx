import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Target } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features',     href: '#features'     },
    { label: 'About',        href: '#about-us'      },
    { label: 'Team',         href: '#team'          },
    { label: 'FAQ',          href: '#faq'           },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/85 dark:bg-gray-950/90 backdrop-blur-xl py-3 border-b border-gray-100 dark:border-white/5'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">

        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/25">
            <Target size={14} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white font-display">
            Ovi<span className="text-blue-600 dark:text-blue-400">Select</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {links.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >{label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'light'
              ? <Moon size={16} className="text-gray-500" />
              : <Sun size={16} className="text-yellow-400" />
            }
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-px shadow-md shadow-blue-500/20">
            Join Waitlist
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-white/5" aria-label="Toggle dark mode">
            {theme === 'light' ? <Moon size={17} className="text-gray-500" /> : <Sun size={17} className="text-yellow-400" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg">
            {mobileMenuOpen ? <X size={20} className="text-gray-700 dark:text-gray-200" /> : <Menu size={20} className="text-gray-700 dark:text-gray-200" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-950/98 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-6 py-5 flex flex-col gap-1">
          {links.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >{label}</a>
          ))}
          <button className="mt-3 w-full bg-blue-600 text-white py-3 rounded-full text-sm font-semibold">
            Join Waitlist
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;