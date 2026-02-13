
import { Movie, AdConfig, Analytics, ActivityLogEntry } from '../types';
import { INITIAL_MOVIES, INITIAL_ADS } from '../constants';

const STORAGE_KEYS = {
  MOVIES: 'cf_movies',
  ADS: 'cf_ads',
  ANALYTICS: 'cf_analytics',
  LOGS: 'cf_activity_logs'
};

const MAX_LOGS = 100;

export const movieService = {
  getMovies: (): Movie[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MOVIES);
    if (!data) {
      try {
        movieService.saveMovies(INITIAL_MOVIES);
        return INITIAL_MOVIES;
      } catch (e) {
        return INITIAL_MOVIES;
      }
    }
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_MOVIES;
    } catch (e) {
      console.error("Failed to parse movies from storage", e);
      return INITIAL_MOVIES;
    }
  },

  saveMovies: (movies: Movie[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        throw new Error('Database full. Please use a smaller poster image or delete existing movies.');
      }
      throw new Error('Failed to save data to secure storage.');
    }
  },

  addMovie: (movie: Movie) => {
    const movies = movieService.getMovies();
    movies.unshift(movie);
    movieService.saveMovies(movies);
    
    movieService.addLog({
      action: 'ADD_MOVIE',
      details: `Published new title: "${movie.title}"`,
      type: 'success'
    });

    try {
      const analytics = movieService.getAnalytics();
      analytics.totalMovies = movies.length;
      movieService.saveAnalytics(analytics);
    } catch (e) {}
  },

  updateMovie: (movie: Movie) => {
    const movies = movieService.getMovies();
    const index = movies.findIndex(m => m.id === movie.id);
    if (index !== -1) {
      movies[index] = movie;
      movieService.saveMovies(movies);
      
      movieService.addLog({
        action: 'UPDATE_MOVIE',
        details: `Updated metadata for: "${movie.title}"`,
        type: 'info'
      });
    }
  },

  deleteMovie: (id: string) => {
    const movies = movieService.getMovies();
    const movieToDelete = movies.find(m => m.id === id);
    const filtered = movies.filter(m => m.id !== id);
    movieService.saveMovies(filtered);
    
    if (movieToDelete) {
      movieService.addLog({
        action: 'DELETE_MOVIE',
        details: `Permanently removed title: "${movieToDelete.title}"`,
        type: 'danger'
      });
    }

    try {
      const analytics = movieService.getAnalytics();
      analytics.totalMovies = filtered.length;
      movieService.saveAnalytics(analytics);
    } catch (e) {}
    
    return filtered;
  },

  getMovieBySlug: (slug: string): Movie | undefined => {
    return movieService.getMovies().find(m => m.slug === slug);
  },

  incrementView: (id: string) => {
    try {
      const movies = movieService.getMovies();
      const movie = movies.find(m => m.id === id);
      if (movie) {
        movie.views += 1;
        movieService.saveMovies(movies);
        
        const analytics = movieService.getAnalytics();
        analytics.dailyViews += 1;
        movieService.saveAnalytics(analytics);
      }
    } catch (e) {}
  },

  incrementDownload: (id: string) => {
    try {
      const movies = movieService.getMovies();
      const movie = movies.find(m => m.id === id);
      if (movie) {
        movie.downloads += 1;
        movieService.saveMovies(movies);
        
        const analytics = movieService.getAnalytics();
        analytics.totalDownloads += 1;
        movieService.saveAnalytics(analytics);
      }
    } catch (e) {}
  },

  getAds: (): AdConfig[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ADS);
    if (!data) {
      try {
        movieService.saveAds(INITIAL_ADS);
      } catch (e) {}
      return INITIAL_ADS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_ADS;
    }
  },

  saveAds: (ads: AdConfig[], isSilent = false) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
      if (!isSilent) {
        movieService.addLog({
          action: 'UPDATE_ADS',
          details: `Synchronized global advertisement configurations`,
          type: 'warning'
        });
      }
    } catch (e) {
      throw new Error('Failed to save ad configuration.');
    }
  },

  getAnalytics: (): Analytics => {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (!data) {
      return { totalMovies: 0, totalDownloads: 0, dailyViews: 0 };
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return { totalMovies: 0, totalDownloads: 0, dailyViews: 0 };
    }
  },

  saveAnalytics: (analytics: Analytics) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    } catch (e) {}
  },

  // Activity Logging Methods
  getLogs: (): ActivityLogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  addLog: (log: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const logs = movieService.getLogs();
    const newEntry: ActivityLogEntry = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const updatedLogs = [newEntry, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  },

  clearLogs: () => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    movieService.addLog({
      action: 'CLEAR_LOGS',
      details: 'Audit logs cleared by administrator',
      type: 'warning'
    });
  }
};
