
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Movie, AdConfig } from '../types';
import { 
  Download, Play, Share2, Calendar, Clock, Languages, 
  Layers, ChevronRight, AlertTriangle, Loader2, Star, CheckCircle2,
  Youtube, X
} from 'lucide-react';
import AdPlaceholder from '../components/AdPlaceholder';
import MovieCard from '../components/MovieCard';

const MovieDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [related, setRelated] = useState<Movie[]>([]);
  const [downloadStep, setDownloadStep] = useState<'idle' | 'preparing' | 'ready'>('idle');
  const [countdown, setCountdown] = useState(10);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = movieService.getMovieBySlug(slug);
      if (found) {
        setMovie(found);
        movieService.incrementView(found.id);
        
        // Find related movies (same genre or language)
        const allMovies = movieService.getMovies();
        const similar = allMovies.filter(m => 
          m.id !== found.id && 
          (m.genres.some(g => found.genres.includes(g)) || m.languages.some(l => found.languages.includes(l)))
        ).slice(0, 6);
        setRelated(similar);
      }
      setAds(movieService.getAds());
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }, [slug]);

  const handleDownloadClick = () => {
    setDownloadStep('preparing');
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setDownloadStep('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finalizeDownload = (id: string, url: string) => {
    movieService.incrementDownload(id);
    window.open(url, '_blank');
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  if (!movie) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
      <Link to="/" className="text-red-500 hover:underline">Return to Home</Link>
    </div>
  );

  const embedUrl = getYoutubeEmbedUrl(movie.trailerUrl);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/category/${movie.languages[0]}`} className="hover:text-white transition-colors">{movie.languages[0]}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white font-medium">{movie.title}</span>
      </nav>

      <AdPlaceholder position="top" ads={ads} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left: Poster & Basic Info Mobile */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 group relative">
              <img src={movie.poster} alt={movie.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
              {movie.trailerUrl && (
                <button 
                  onClick={() => setIsTrailerOpen(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50 transform group-hover:scale-110 transition-transform">
                    <Youtube className="w-8 h-8 text-white" />
                  </div>
                </button>
              )}
            </div>
            <div className="hidden lg:block space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Quality</span>
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">HDRIP / BluRay</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Total Downloads</span>
                  <span className="text-sm font-semibold text-white">{movie.downloads}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Info & Downloads */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
               {movie.genres.map(g => (
                 <span key={g} className="text-[10px] font-bold text-red-600 border border-red-600/30 px-2 py-0.5 rounded uppercase">{g}</span>
               ))}
            </div>
            
            <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">{movie.title} ({movie.releaseYear})</h1>
            
            {/* Prominent Trailer Button */}
            {movie.trailerUrl && (
              <div className="mb-8">
                <button 
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-4 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest italic shadow-2xl shadow-red-600/30 transition-all active:scale-95 group border border-red-500/50"
                >
                  <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" /> 
                  Watch Official Trailer
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8 border-y border-white/10 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>{movie.releaseYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-red-600" />
                <span>{movie.languages.join(', ')}</span>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 text-base font-light italic">
              "{movie.description}"
            </p>

            {/* Download Logic */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 overflow-hidden relative">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Download className="w-5 h-5 text-red-600" /> Download Links
              </h3>

              {downloadStep === 'idle' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movie.downloadLinks.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={handleDownloadClick}
                      className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-5 h-5 fill-white" />
                        <span className="font-bold">Download {link.quality}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              )}

              {downloadStep === 'preparing' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-24 h-24 mb-6">
                    <Loader2 className="w-24 h-24 text-red-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-white">
                      {countdown}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Preparing your download link...</h4>
                  <p className="text-sm text-gray-400 text-center max-w-xs">
                    Please wait while we generate a secure direct download link for you. Do not close this window.
                  </p>
                  
                  {/* Internal Ad while waiting */}
                  <div className="mt-8 p-4 bg-white/10 rounded-lg border border-white/10 w-full text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Sponsored</p>
                    <p className="text-sm text-white font-medium">Download high speed with 1GB/s VPN Premium</p>
                    <button className="mt-2 text-xs text-red-500 font-bold hover:underline">Click here to skip wait</button>
                  </div>
                </div>
              )}

              {downloadStep === 'ready' && (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 p-4 rounded-xl mb-6">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <span className="text-green-500 font-bold">Your links are ready!</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {movie.downloadLinks.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => finalizeDownload(movie.id, link.url)}
                        className="flex items-center justify-between bg-[#111] hover:bg-white/10 text-white px-6 py-4 rounded-xl transition-all border border-white/10 group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">Direct Link - Server {idx + 1}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{link.quality} High Definition</span>
                        </div>
                        <Download className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setDownloadStep('idle')}
                    className="text-xs text-gray-500 hover:text-white mt-4 mx-auto block"
                  >
                    Go Back
                  </button>
                </div>
              )}
            </div>

            <AdPlaceholder position="middle" ads={ads} />
            
            {/* Disclaimer */}
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-500/80 leading-relaxed mb-8">
              <div className="flex items-center gap-2 mb-2 font-bold uppercase">
                <AlertTriangle className="w-3 h-3" /> Important Note
              </div>
              By downloading this file, you agree that we are not responsible for any copyright issues. This link is generated for educational purposes and is provided by a third-party server.
            </div>
          </div>
        </div>
      </div>

      {/* Related Section */}
      {related.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="text-red-600 w-5 h-5" />
            <h2 className="text-2xl font-bold tracking-tight text-white">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map(m => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {isTrailerOpen && embedUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95">
             <button 
               onClick={() => setIsTrailerOpen(false)}
               className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:bg-red-600 rounded-full transition-all"
             >
               <X className="w-6 h-6" />
             </button>
             <iframe 
               src={embedUrl} 
               className="w-full h-full" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
             ></iframe>
           </div>
        </div>
      )}

      <AdPlaceholder position="bottom" ads={ads} />
    </div>
  );
};

export default MovieDetail;
