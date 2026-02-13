
export enum Language {
  Tamil = 'Tamil',
  Telugu = 'Telugu',
  Malayalam = 'Malayalam',
  Hindi = 'Hindi',
  English = 'English',
  Dubbed = 'Dubbed'
}

export enum Genre {
  Action = 'Action',
  Romance = 'Romance',
  Comedy = 'Comedy',
  Thriller = 'Thriller',
  Horror = 'Horror',
  Drama = 'Drama',
  SciFi = 'Sci-Fi',
  Family = 'Family'
}

export interface QualityLink {
  quality: '480p' | '720p' | '1080p';
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  poster: string;
  releaseYear: number;
  languages: Language[];
  genres: Genre[];
  duration: string;
  description: string;
  downloadLinks: QualityLink[];
  views: number;
  downloads: number;
  isTrending: boolean;
  createdAt: number;
  trailerUrl?: string;
}

export interface AdConfig {
  id: string;
  name: string;
  enabled: boolean;
  code: string;
  position: 'top' | 'middle' | 'bottom' | 'interstitial' | 'popunder';
}

export interface Analytics {
  totalMovies: number;
  totalDownloads: number;
  dailyViews: number;
}

export interface ActivityLogEntry {
  id: string;
  action: 'ADD_MOVIE' | 'UPDATE_MOVIE' | 'DELETE_MOVIE' | 'UPDATE_ADS' | 'TOGGLE_AD' | 'CLEAR_LOGS';
  details: string;
  timestamp: number;
  type: 'success' | 'info' | 'warning' | 'danger';
}
