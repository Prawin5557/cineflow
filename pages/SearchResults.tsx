
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Search, Info } from 'lucide-react';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);

  useEffect(() => {
    if (query) {
      const all = movieService.getMovies();
      const filtered = all.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) || 
        m.genres.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
        m.languages.some(l => l.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    }
  }, [query]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 rounded-xl">
            <Search className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Search Results</h1>
            <p className="text-gray-500 text-sm">Showing results for: <span className="text-red-500 font-semibold">"{query}"</span></p>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {results.length} movies found
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-white/5">
          <Info className="w-16 h-16 text-gray-700 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Movies Found</h2>
          <p className="text-gray-500 text-center max-w-sm">
            We couldn't find any movies matching your search criteria. Try using different keywords or categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
