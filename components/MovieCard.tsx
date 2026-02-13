
import React from 'react';
import { Movie } from '../types';
import { Link } from 'react-router-dom';
import { Star, Eye, Calendar, Clock } from 'lucide-react';
import { formatNumber } from '../utils';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link 
      to={`/movie/${movie.slug}`}
      className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden hover:ring-2 hover:ring-red-600 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
            <Eye className="w-3 h-3 text-red-500" />
            <span>{formatNumber(movie.views)}</span>
            <span className="mx-1">•</span>
            <Calendar className="w-3 h-3 text-red-500" />
            <span>{movie.releaseYear}</span>
          </div>
          <p className="text-xs text-white/60 line-clamp-2">{movie.description}</p>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {movie.isTrending && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">Trending</span>
          )}
          <span className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 uppercase font-medium">{movie.languages[0]}</span>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate mb-1 group-hover:text-red-500 transition-colors">{movie.title}</h3>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>{movie.genres.slice(0, 2).join(', ')}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{movie.duration}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
