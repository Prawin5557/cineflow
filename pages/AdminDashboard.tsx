
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Movie, Analytics, AdConfig, Language, Genre, ActivityLogEntry } from '../types';
import { slugify } from '../utils';
import { 
  LayoutDashboard, Film, TrendingUp, Settings, Plus, Trash2, 
  Edit, Eye, Download, LogOut, Save, X, Activity, MessageSquare,
  Search, ExternalLink, RefreshCcw, AlertCircle, ShieldCheck, CheckCircle,
  Upload, Loader2, History, AlertTriangle, Info, ArrowRight, Sparkles, ClipboardList, Clock, Image as ImageIcon,
  Youtube
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'cf_movie_editor_draft';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'movies' | 'ads' | 'logs'>('stats');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [stats, setStats] = useState<Analytics | null>(null);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [movieSearchTerm, setMovieSearchTerm] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Custom Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  
  // UI States
  const [isPosterProcessing, setIsPosterProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);
  
  const initialFormData: Partial<Movie> = {
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    languages: [Language.Tamil],
    genres: [Genre.Action],
    duration: '2h 30m',
    poster: '',
    trailerUrl: '',
    downloadLinks: [
      { quality: '480p', url: '#' },
      { quality: '720p', url: '#' },
      { quality: '1080p', url: '#' }
    ],
    isTrending: false
  };

  const [formData, setFormData] = useState<Partial<Movie>>(initialFormData);
  const [adFormCode, setAdFormCode] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('is_admin') !== 'true') {
      navigate('/admin');
      return;
    }
    refreshData();
    checkDraft();
  }, [navigate]);

  // Auto-save logic
  useEffect(() => {
    if (isModalOpen && !editingMovie) {
      const draftData = JSON.stringify(formData);
      localStorage.setItem(DRAFT_STORAGE_KEY, draftData);
      setHasDraft(true);
    }
  }, [formData, isModalOpen, editingMovie]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const checkDraft = () => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.title || parsed.description || parsed.poster) {
          setHasDraft(true);
        } else {
          setHasDraft(false);
        }
      } catch (e) {
        setHasDraft(false);
      }
    }
  };

  const restoreDraft = () => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      setFormData(JSON.parse(draft));
      setNotification({ message: 'Draft restored successfully', type: 'success' });
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
  };

  const refreshData = () => {
    setMovies(movieService.getMovies());
    setAds(movieService.getAds());
    setStats(movieService.getAnalytics());
    setLogs(movieService.getLogs());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is_admin');
    navigate('/admin');
  };

  const openDeleteConfirmation = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (movieToDelete) {
      try {
        movieService.deleteMovie(movieToDelete.id);
        setNotification({ message: `"${movieToDelete.title}" deleted successfully`, type: 'success' });
        setIsDeleteModalOpen(false);
        setMovieToDelete(null);
        refreshData();
      } catch (e: any) {
        setNotification({ message: e.message || 'Failed to delete movie', type: 'error' });
      }
    }
  };

  const openAddModal = () => {
    setEditingMovie(null);
    checkDraft();
    setFormData(initialFormData);
    setIsModalOpen(true);
    setIsSubmitting(false);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({ ...movie });
    setIsModalOpen(true);
    setIsSubmitting(false);
  };

  const openAdEditModal = (ad: AdConfig) => {
    setEditingAd(ad);
    setAdFormCode(ad.code);
    setIsAdModalOpen(true);
  };

  // Validation Logic
  const isFormValid = useMemo(() => {
    const hasTitle = (formData.title || '').trim().length > 0;
    const hasPoster = (formData.poster || '').trim().length > 0;
    const hasDescription = (formData.description || '').trim().length > 5;
    const hasLanguages = (formData.languages || []).length > 0;
    const hasGenres = (formData.genres || []).length > 0;
    const hasValidLinks = (formData.downloadLinks || []).some(link => link.url && link.url !== '#' && link.url.trim().length > 0);

    return hasTitle && hasPoster && hasDescription && hasLanguages && hasGenres && hasValidLinks;
  }, [formData]);

  const handleProcessSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid || isSubmitting || isPosterProcessing) return;

    setIsSubmitting(true);

    try {
      const movieData = {
        title: formData.title || '',
        description: formData.description || '',
        releaseYear: formData.releaseYear || new Date().getFullYear(),
        languages: formData.languages || [],
        genres: formData.genres || [],
        duration: formData.duration || '2h 30m',
        poster: formData.poster || '',
        trailerUrl: formData.trailerUrl || '',
        downloadLinks: formData.downloadLinks || [],
        isTrending: formData.isTrending || false,
        id: editingMovie ? editingMovie.id : Math.random().toString(36).substr(2, 9),
        slug: slugify(formData.title || 'movie'),
        createdAt: editingMovie ? editingMovie.createdAt : Date.now(),
        views: editingMovie ? editingMovie.views : 0,
        downloads: editingMovie ? editingMovie.downloads : 0,
      } as Movie;

      if (editingMovie) {
        movieService.updateMovie(movieData);
        setNotification({ message: 'Catalog record synchronized successfully', type: 'success' });
      } else {
        movieService.addMovie(movieData);
        setNotification({ message: 'Title successfully published to global network', type: 'success' });
        clearDraft();
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error("Publication error:", err);
      setNotification({ message: err.message || 'Critical error during publication. Check entry data.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    
    try {
      const updatedAds = ads.map(ad => 
        ad.id === editingAd.id ? { ...ad, code: adFormCode } : ad
      );
      movieService.saveAds(updatedAds);
      setAds(updatedAds);
      setIsAdModalOpen(false);
      setNotification({ message: 'Ad configuration updated', type: 'success' });
      refreshData();
    } catch (err: any) {
      setNotification({ message: err.message || 'Failed to update ads', type: 'error' });
    }
  };

  const toggleAd = (id: string) => {
    try {
      const adToToggle = ads.find(a => a.id === id);
      const updatedAds = ads.map(ad => ad.id === id ? { ...ad, enabled: !ad.enabled } : ad);
      movieService.saveAds(updatedAds, true); // Silent save for simple toggles
      
      movieService.addLog({
        action: 'TOGGLE_AD',
        details: `${updatedAds.find(a => a.id === id)?.enabled ? 'Enabled' : 'Disabled'} ad placement: "${adToToggle?.name}"`,
        type: 'info'
      });

      setAds(updatedAds);
      refreshData();
    } catch (e: any) {
      setNotification({ message: e.message || 'Operation failed', type: 'error' });
    }
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear the system audit log? This cannot be undone.")) {
      movieService.clearLogs();
      refreshData();
      setNotification({ message: 'Audit history purged', type: 'info' });
    }
  };

  const handleGenreToggle = (genre: Genre) => {
    const currentGenres = formData.genres || [];
    if (currentGenres.includes(genre)) {
      setFormData({ ...formData, genres: currentGenres.filter(g => g !== genre) });
    } else {
      setFormData({ ...formData, genres: [...currentGenres, genre] });
    }
  };

  const handleLanguageToggle = (lang: Language) => {
    const currentLangs = formData.languages || [];
    if (currentLangs.includes(lang)) {
      setFormData({ ...formData, languages: currentLangs.filter(l => l !== lang) });
    } else {
      setFormData({ ...formData, languages: [...currentLangs, lang] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setNotification({ message: 'File too large. Please use a poster image under 1MB.', type: 'error' });
        return;
      }

      setIsPosterProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, poster: reader.result as string }));
        setIsPosterProcessing(false);
        setNotification({ message: 'Poster payload encrypted & optimized', type: 'success' });
      };
      reader.onerror = () => {
        setIsPosterProcessing(false);
        setNotification({ message: 'Physical file read error', type: 'error' });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredMovies = useMemo(() => {
    return movies.filter(m => 
      m.title.toLowerCase().includes(movieSearchTerm.toLowerCase()) ||
      m.languages.some(l => l.toLowerCase().includes(movieSearchTerm.toLowerCase()))
    );
  }, [movies, movieSearchTerm]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[80vh] animate-in fade-in duration-300">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-24 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-tight">{notification.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shadow-red-600/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white leading-none uppercase tracking-tighter italic">CineFlow Admin</h4>
              <span className="text-[9px] text-gray-600 uppercase tracking-[0.2em] mt-1 block font-bold">Secure Environment</span>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold ${activeTab === 'stats' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('movies')}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold ${activeTab === 'movies' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <Film className="w-4 h-4" /> Movies Library
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold ${activeTab === 'ads' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" /> Monetization
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold ${activeTab === 'logs' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <ClipboardList className="w-4 h-4" /> Activity Logs
            </button>
            
            <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
              <a 
                href="/" 
                target="_blank"
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-gray-600 hover:text-white hover:bg-white/5 text-sm font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Visit Site
              </a>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" /> Terminate Session
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Dashboard Viewport */}
      <div className="lg:col-span-3">
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Health</h2>
              <button onClick={refreshData} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                  <Film className="w-40 h-40 text-red-500" />
                </div>
                <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Titles</h3>
                <p className="text-5xl font-black text-white italic">{stats.totalMovies}</p>
                <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-bold">
                  <Activity className="w-3 h-3" /> Updated Live
                </div>
              </div>
              
              <div className="bg-[#111] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity -rotate-12">
                  <Download className="w-40 h-40 text-blue-500" />
                </div>
                <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Deliveries</h3>
                <p className="text-5xl font-black text-white italic">{stats.totalDownloads.toLocaleString()}</p>
                <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-bold">
                  <TrendingUp className="w-3 h-3" /> Growing Today
                </div>
              </div>
              
              <div className="bg-[#111] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Eye className="w-40 h-40 text-purple-500" />
                </div>
                <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Daily Impressions</h3>
                <p className="text-5xl font-black text-white italic">{stats.dailyViews.toLocaleString()}</p>
                <div className="mt-4 flex items-center gap-2 text-purple-500 text-[10px] font-bold">
                  <Info className="w-3 h-3" /> Unique Visitors
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 p-8 rounded-3xl shadow-inner">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Recent System Events</h3>
                <button onClick={() => setActiveTab('logs')} className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 hover:text-red-400 transition-colors">
                  View Full History <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-4">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-5 py-4 border-b border-white/[0.03] last:border-0 group">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform duration-300 shadow-[0_0_10px_currentColor] ${
                      log.type === 'success' ? 'bg-green-500' : 
                      log.type === 'warning' ? 'bg-yellow-500' :
                      log.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">{log.details}</p>
                      <span className="text-[10px] text-gray-600 mt-1 block uppercase tracking-widest font-bold">{formatRelativeTime(log.timestamp)}</span>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-sm text-gray-600 italic py-4">No recent activity logged.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Movie Library</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search library..." 
                    value={movieSearchTerm}
                    onChange={(e) => setMovieSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 w-full md:w-72 placeholder:text-gray-700 transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
                <button 
                  onClick={openAddModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-black shadow-2xl shadow-red-600/30 transition-all active:scale-95 group uppercase tracking-tight italic"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Add Title
                </button>
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5">Movie Identity</th>
                      <th className="px-8 py-5 text-center">Year</th>
                      <th className="px-8 py-5">Metrics</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filteredMovies.map(movie => (
                      <tr key={movie.id} className="text-sm text-gray-400 hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                              <img src={movie.poster} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <span className="font-bold text-white group-hover:text-red-500 transition-colors block text-base leading-tight">{movie.title}</span>
                              <span className="text-[10px] text-gray-700 mt-1 block font-mono">UUID: {movie.id.toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center font-mono font-bold text-gray-500">{movie.releaseYear}</td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                              <Eye className="w-3 h-3 text-red-600" /> {movie.views.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                              <Download className="w-3 h-3 text-blue-600" /> {movie.downloads.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openEditModal(movie)} className="p-3 bg-white/5 text-gray-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => openDeleteConfirmation(movie)} className="p-3 bg-white/5 text-gray-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-90"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMovies.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-gray-600 italic font-medium tracking-wide">No titles found in the database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ad Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ads.map(ad => (
                <div key={ad.id} className="bg-[#111] border border-white/5 p-8 rounded-3xl relative shadow-2xl group hover:border-red-600/20 transition-all duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-black text-white uppercase tracking-tight italic">{ad.name}</h3>
                      <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">{ad.position} Placement</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={ad.enabled} onChange={() => toggleAd(ad.id)} className="sr-only peer" />
                      <div className="w-12 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
                    </label>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-black border border-white/[0.03] rounded-2xl p-6 text-[11px] font-mono text-green-500 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 shadow-inner">
                      {ad.code}
                    </div>
                    <button 
                      onClick={() => openAdEditModal(ad)}
                      className="w-full flex items-center justify-center gap-3 text-xs font-black text-white bg-white/5 hover:bg-white/10 py-4 rounded-2xl transition-all border border-white/[0.05] uppercase italic tracking-tight"
                    >
                      <Edit className="w-4 h-4" /> Modify Script
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Audit Log</h2>
              <button 
                onClick={handleClearLogs}
                className="bg-white/5 border border-white/10 hover:bg-red-600/10 hover:text-red-500 text-gray-500 px-5 py-2.5 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all italic"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl p-10 shadow-2xl">
              <div className="space-y-0">
                {logs.map((log, index) => (
                  <div key={log.id} className="relative pl-10 pb-12 last:pb-0 group">
                    {/* Timeline vertical line */}
                    {index !== logs.length - 1 && (
                      <div className="absolute left-[7px] top-4 w-[2px] h-full bg-white/[0.05]"></div>
                    )}
                    
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-[#111] z-10 shadow-lg ${
                      log.type === 'success' ? 'bg-green-600 shadow-green-600/20' : 
                      log.type === 'warning' ? 'bg-yellow-600 shadow-yellow-600/20' :
                      log.type === 'danger' ? 'bg-red-600 shadow-red-600/20' : 'bg-blue-600 shadow-blue-600/20'
                    }`}></div>
                    
                    <div className="bg-white/[0.02] border border-white/[0.03] p-6 rounded-2xl group-hover:bg-white/[0.04] transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest italic border ${
                            log.type === 'success' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 
                            log.type === 'warning' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' :
                            log.type === 'danger' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                          }`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest italic shrink-0">
                          <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-gray-300 font-medium leading-relaxed">{log.details}</p>
                      <div className="mt-4 flex items-center justify-between">
                         <span className="text-[9px] text-gray-700 font-mono">ENTRY_ID: {log.id}</span>
                         <span className="text-[9px] text-gray-700 uppercase tracking-widest font-black italic">{formatRelativeTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ClipboardList className="w-20 h-20 text-gray-800 mb-6" />
                    <h3 className="text-white font-black uppercase tracking-tighter italic text-xl">No Audit History</h3>
                    <p className="text-gray-600 text-xs mt-2 max-w-sm leading-relaxed font-medium uppercase tracking-tight">System activities will appear here as they occur.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && movieToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <Trash2 className="w-12 h-12 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">Confirm Wipe</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-[280px]">
                You are about to permanently remove <span className="text-white font-bold underline decoration-red-600 decoration-2">"{movieToDelete.title}"</span> from the global catalog.
              </p>
              
              <div className="flex flex-col w-full gap-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 italic"
                >
                  Confirm Deletion
                </button>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setMovieToDelete(null);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all border border-white/5 italic"
                >
                  Abort Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movie Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95">
            <div className="p-8 border-b border-white/[0.03] flex items-center justify-between bg-[#111]">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${editingMovie ? 'bg-blue-600/10 text-blue-500' : 'bg-red-600/10 text-red-500'}`}>
                  {editingMovie ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{editingMovie ? 'Sync Update' : 'New Release'}</h3>
                  <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold mt-1">Catalog Integration Module</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {hasDraft && !editingMovie && (
                  <button 
                    onClick={restoreDraft}
                    className="flex items-center gap-2 text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-full hover:bg-blue-500/20 transition-all uppercase tracking-[0.1em] italic border border-blue-500/20 shadow-lg shadow-blue-500/10"
                  >
                    <History className="w-3.5 h-3.5" /> Restore Draft
                  </button>
                )}
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-3 bg-white/5 text-gray-500 hover:text-white rounded-xl transition-all hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-10 scrollbar-thin scrollbar-thumb-white/5 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-red-600">Primary Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-gray-800 text-base font-bold"
                      placeholder="e.g. Master (2021) 4K Ultra HD"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-red-600">Release Era</label>
                      <input 
                        type="number" 
                        value={formData.releaseYear}
                        onChange={e => setFormData({...formData, releaseYear: parseInt(e.target.value) || new Date().getFullYear()})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-mono font-bold"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-red-600">Length</label>
                      <input 
                        type="text" 
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold"
                        placeholder="2h 45m"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-red-600 flex items-center gap-2">
                      <Youtube className="w-3 h-3 text-red-600" /> Trailer URL
                    </label>
                    <input 
                      type="text" 
                      value={formData.trailerUrl} 
                      onChange={e => setFormData({...formData, trailerUrl: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-gray-800 text-sm font-mono"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 italic">Visual Acquisition</label>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={formData.poster}
                        onChange={e => setFormData({...formData, poster: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-[11px] font-mono"
                        placeholder="Direct URL origin..."
                      />
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="poster-upload-v5"
                          disabled={isPosterProcessing}
                        />
                        <label 
                          htmlFor="poster-upload-v5" 
                          className={`flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all italic ${isPosterProcessing ? 'bg-white/5 border-white/5 text-gray-700 cursor-not-allowed' : 'bg-white/[0.02] border-white/10 text-gray-500 hover:bg-white/5 hover:text-white hover:border-red-600/40 cursor-pointer'}`}
                        >
                          {isPosterProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                          <span>{isPosterProcessing ? 'Analyzing Payload...' : 'Import Physical File'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1 italic">Live Visual Validation</label>
                  <div className={`relative bg-black/40 border border-white/[0.02] rounded-[2.5rem] flex items-center justify-center group overflow-hidden shadow-2xl transition-all duration-700 min-h-[420px] ${formData.poster ? 'ring-2 ring-red-600/30' : ''}`}>
                    {isPosterProcessing ? (
                      <div className="flex flex-col items-center gap-6 animate-pulse">
                        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center border border-red-600/20">
                          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                        </div>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Decoding Stream</p>
                      </div>
                    ) : formData.poster ? (
                      <div className="relative w-full h-full flex items-center justify-center p-6 group">
                        <div className="relative aspect-[2/3] w-full max-w-[240px] rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 transition-transform duration-500 group-hover:scale-105">
                          <img 
                            src={formData.poster} 
                            className="w-full h-full object-cover" 
                            alt="Visual Preview" 
                            onError={() => {
                              setNotification({ message: 'Resource unreachable or invalid codec', type: 'error' });
                              setFormData(prev => ({ ...prev, poster: '' }));
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                             <button 
                               onClick={() => setFormData({...formData, poster: ''})}
                               className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 shadow-xl transition-all"
                             >
                               <Trash2 className="w-3 h-3" /> Purge Media
                             </button>
                          </div>
                        </div>
                        
                        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                          <div className="bg-green-600 px-4 py-1.5 rounded-full text-[8px] text-white font-black uppercase tracking-widest italic shadow-xl flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> Synchronized
                          </div>
                          <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] text-gray-300 font-black uppercase tracking-widest border border-white/5">
                            {formData.poster.startsWith('data:') ? 'Local Blob' : 'Remote Origin'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 text-gray-800 opacity-20 text-center transition-opacity duration-1000">
                        <div className="p-8 border-4 border-dashed border-gray-800 rounded-3xl">
                          <ImageIcon className="w-20 h-20" />
                        </div>
                        <div className="uppercase tracking-[0.4em] font-black text-2xl italic">Pending Visual</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-5 ml-1 italic">Vocal Distribution</label>
                  <div className="flex flex-wrap gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    {Object.values(Language).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter italic border ${
                          formData.languages?.includes(lang) 
                            ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/30' 
                            : 'bg-white/5 text-gray-600 border-white/5 hover:text-gray-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-5 ml-1 italic">Genre Classification</label>
                  <div className="flex flex-wrap gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    {Object.values(Genre).map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-tighter italic border ${
                          formData.genres?.includes(genre) 
                            ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/30' 
                            : 'bg-white/5 text-gray-600 border-white/5 hover:text-gray-300'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 ml-1">Editorial Logline (Plot)</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-3xl px-8 py-6 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none font-medium leading-relaxed placeholder:text-gray-800"
                  placeholder="Draft the central narrative conflict here..."
                ></textarea>
              </div>

              <div className="bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-red-600" />
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">Server Distribution</h4>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5">
                    <input 
                      type="checkbox" 
                      id="trending-check-v5"
                      checked={formData.isTrending}
                      onChange={e => setFormData({...formData, isTrending: e.target.checked})}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                    <label htmlFor="trending-check-v5" className="text-[10px] text-gray-500 font-black uppercase tracking-widest cursor-pointer italic">Trending Priority</label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {formData.downloadLinks?.map((link, idx) => (
                    <div key={idx} className="bg-black/60 border border-white/5 p-6 rounded-3xl space-y-5 group hover:border-red-600/20 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] italic">{link.quality} Master</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                      </div>
                      <input 
                        type="text" 
                        value={link.url}
                        onChange={e => {
                          const newLinks = [...(formData.downloadLinks || [])];
                          newLinks[idx].url = e.target.value;
                          setFormData({...formData, downloadLinks: newLinks});
                        }}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[11px] text-gray-400 focus:ring-2 focus:ring-red-600 transition-all font-mono"
                        placeholder="Link Origin URL"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Indicator or Publish Gated Block */}
              {!isFormValid ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                     <AlertCircle className="w-8 h-8 text-gray-700" />
                   </div>
                   <h5 className="text-white font-black uppercase tracking-tighter italic text-xl">Incomplete Metadata</h5>
                   <p className="text-gray-600 text-xs mt-2 max-w-sm leading-relaxed font-medium uppercase tracking-tight">Please ensure Title, Poster, Description (Plot), Languages, Genres, and at least one Download Link are provided to unlock publishing tools.</p>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                     {[
                       { label: 'Title', ok: (formData.title || '').trim().length > 0 },
                       { label: 'Poster', ok: (formData.poster || '').trim().length > 0 },
                       { label: 'Plot', ok: (formData.description || '').trim().length > 5 },
                       { label: 'Vocal', ok: (formData.languages || []).length > 0 },
                       { label: 'Category', ok: (formData.genres || []).length > 0 },
                       { label: 'Servers', ok: (formData.downloadLinks || []).some(l => l.url && l.url !== '#') }
                     ].map(check => (
                       <div key={check.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tight ${check.ok ? 'bg-green-600/10 border-green-600/20 text-green-500' : 'bg-white/5 border-white/5 text-gray-700'}`}>
                         {check.ok ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                         {check.label}
                       </div>
                     ))}
                   </div>
                </div>
              ) : (
                <div className="bg-red-600/5 border border-red-600/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-2xl">
                   <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-6 border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                     <Sparkles className="w-10 h-10 text-red-600 animate-pulse" />
                   </div>
                   <h5 className="text-3xl font-black text-white uppercase tracking-tighter italic">Ready for Launch</h5>
                   <p className="text-gray-400 text-sm mt-3 max-w-md leading-relaxed">The movie payload has been verified against platform standards. You can now publish this entry to the public catalog.</p>
                   
                   <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full max-w-md">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-5 rounded-2xl text-gray-500 font-black uppercase tracking-widest hover:text-white transition-colors italic border border-white/5 bg-white/5 disabled:opacity-30"
                    >
                      Discard Draft
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleProcessSubmit()}
                      disabled={isSubmitting || isPosterProcessing}
                      className="w-full sm:flex-2 bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4 shadow-2xl shadow-red-600/30 transition-all active:scale-95 group disabled:grayscale disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Save className="w-6 h-6" />
                      )}
                      {isSubmitting ? 'Processing...' : (editingMovie ? 'Finalize Update' : 'Live Publication')}
                    </button>
                   </div>
                </div>
              )}
              
              <div className="h-10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Script Editor */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
           <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 border-b border-white/[0.03] flex items-center justify-between bg-[#111]">
               <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Monetization Script</h3>
                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest font-bold">Target: {editingAd?.name}</p>
               </div>
               <button onClick={() => setIsAdModalOpen(false)} className="p-3 bg-white/5 text-gray-500 hover:text-white rounded-xl transition-all"><X /></button>
             </div>
             <form onSubmit={handleUpdateAdCode} className="p-10 space-y-8">
                <div className="bg-blue-600/10 border border-blue-600/20 p-5 rounded-2xl flex items-start gap-4 text-blue-500 text-[11px] font-bold leading-relaxed uppercase tracking-tight italic">
                  <Info className="w-5 h-5 shrink-0" />
                  Ensure the snippet is standard HTML/JavaScript. High-risk scripts may be flagged by firewalls.
                </div>
                <textarea 
                  rows={8}
                  value={adFormCode}
                  onChange={(e) => setAdFormCode(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl p-6 text-[11px] font-mono text-green-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-inner"
                  placeholder="<script>...</script>"
                  required
                ></textarea>
                <div className="flex items-center gap-4 pt-2">
                  <button type="button" onClick={() => setIsAdModalOpen(false)} className="flex-1 py-4.5 rounded-2xl text-gray-600 font-black uppercase tracking-widest border border-white/5 italic">Cancel</button>
                  <button type="submit" className="flex-1 bg-red-600 text-white py-4.5 rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-red-600/20">Sync Script</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
