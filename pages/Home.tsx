
import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { Movie, Genre, Language } from '../types';
import MovieCard from '../components/MovieCard';
import AdPlaceholder from '../components/AdPlaceholder';
import { TrendingUp, Film, Flame, Star, Filter } from 'lucide-react';

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ads, setAds] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');

  useEffect(() => {
    setMovies(movieService.getMovies());
    setAds(movieService.getAds() as any);
  }, []);

  const trendingMovies = movies.filter(m => m.isTrending);
  const latestMovies = movies
    .filter(m => selectedGenre === 'All' || m.genres.includes(selectedGenre))
    .sort((a, b) => b.createdAt - a.createdAt);

  const genres = Object.values(Genre);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Ad Top */}
      <AdPlaceholder position="top" ads={ads} />

      {/* Hero / Trending Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-red-600 w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-white">Trending Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {trendingMovies.slice(0, 6).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Ad Middle */}
      <AdPlaceholder position="middle" ads={ads} />

      {/* Latest Uploads Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Film className="text-red-600 w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-white">Latest Uploads</h2>
          </div>
          
          {/* Genre Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <button
              onClick={() => setSelectedGenre('All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedGenre === 'All' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedGenre === genre ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {latestMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Categories Grid (SEO focus) */}
      <section className="bg-white/5 rounded-2xl p-8 mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-600" /> Browse by Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Object.values(Language).map(lang => (
            <button 
              key={lang}
              className="bg-[#111] hover:bg-red-600 border border-white/10 p-4 rounded-xl text-center transition-all group"
            >
              <span className="block text-white font-semibold mb-1 group-hover:scale-110 transition-transform">{lang}</span>
              <span className="text-[10px] text-gray-500 group-hover:text-white/80">Latest HD Movies</span>
            </button>
          ))}
        </div>
      </section>

      {/* Ad Bottom */}
      <AdPlaceholder position="bottom" ads={ads} />
    </div>
  );
};

export default Home;
