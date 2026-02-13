
import React, { useState } from 'react';
import { Search, Menu, X, Play, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Tamil', path: '/category/Tamil' },
    { name: 'Telugu', path: '/category/Telugu' },
    { name: 'Malayalam', path: '/category/Malayalam' },
    { name: 'Hindi', path: '/category/Hindi' },
    { name: 'English', path: '/category/English' },
    { name: 'Dubbed', path: '/category/Dubbed' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-red-600/20">
                <Play className="fill-white w-6 h-6 ml-0.5" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Cine<span className="text-red-600">Flow</span></span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-5 py-2 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-64 text-white transition-all placeholder:text-gray-600"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </form>

            <Link to="/admin" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </Link>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced Experience */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#0e0e0e] border-b border-white/5 p-6 animate-in slide-in-from-top duration-500 shadow-2xl">
            <form onSubmit={handleSearch} className="relative mb-8">
              <input
                type="text"
                placeholder="Find your favorite movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 w-full text-white placeholder:text-gray-600"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </form>
            
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Browse Categories</p>
              <div className="grid grid-cols-2 gap-3">
                {navLinks.map(link => (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] hover:bg-red-600/10 hover:border-red-600/30 p-4 rounded-xl text-sm font-semibold text-gray-300 group transition-all"
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4">
               <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Admin Access</Link>
               <span className="w-1 h-1 rounded-full bg-gray-800"></span>
               <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">v2.1 Production</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Cine<span className="text-red-600">Flow</span></span>
              </Link>
              <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                Experience high-performance movie browsing. CineFlow provides direct access to the latest cinematic releases with clean UI and zero bloat. We prioritize speed and security for global audiences.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Discovery</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {navLinks.slice(0, 4).map(link => (
                  <li key={link.name}><Link to={link.path} className="hover:text-red-600 transition-colors">{link.name} Movies</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Policy</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="hover:text-red-600 cursor-pointer transition-colors">DMCA Notice</li>
                <li className="hover:text-red-600 cursor-pointer transition-colors">Terms of Use</li>
                <li className="hover:text-red-600 cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-red-600 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-10 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            <p className="mb-2">© {new Date().getFullYear()} CineFlow Entertainment Hub</p>
            <p className="max-w-2xl mx-auto opacity-50">Content provided by verified third-party distribution networks. CineFlow does not host proprietary video assets directly on its infrastructure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
