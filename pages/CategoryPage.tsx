
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import AdPlaceholder from '../components/AdPlaceholder';

const CategoryPage: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    if (lang) {
      const all = movieService.getMovies();
      const filtered = all.filter(m => m.languages.includes(lang as any));
      setMovies(filtered);
      setAds(movieService.getAds() as any);
    }
  }, [lang]);

  return (
    <div className="animate-in fade-in duration-300">
      <AdPlaceholder position="top" ads={ads} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">{lang} Movies</h1>
        <p className="text-gray-500 text-sm">Browse our full collection of high-definition {lang} language films.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No movies found in this category yet.
        </div>
      )}

      <AdPlaceholder position="bottom" ads={ads} />
    </div>
  );
};

export default CategoryPage;
