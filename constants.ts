
import { Movie, Language, Genre, AdConfig } from './types';

export const INITIAL_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Vikram Vedha',
    slug: 'vikram-vedha-2022',
    poster: 'https://picsum.photos/seed/vikram/400/600',
    releaseYear: 2022,
    languages: [Language.Hindi, Language.Tamil],
    genres: [Genre.Action, Genre.Thriller, Genre.Drama],
    duration: '2h 40m',
    description: 'A tough police officer sets out to track down and kill an equally tough gangster.',
    downloadLinks: [
      { quality: '480p', url: '#' },
      { quality: '720p', url: '#' },
      { quality: '1080p', url: '#' }
    ],
    views: 1250,
    downloads: 450,
    isTrending: true,
    createdAt: Date.now() - 100000000
  },
  {
    id: '2',
    title: 'The Gray Man',
    slug: 'the-gray-man-2022',
    poster: 'https://picsum.photos/seed/grayman/400/600',
    releaseYear: 2022,
    languages: [Language.English, Language.Dubbed],
    genres: [Genre.Action, Genre.SciFi, Genre.Thriller],
    duration: '2h 2m',
    description: 'When the CIAs most skilled operative accidentally uncovers dark agency secrets, a psychopathic former colleague puts a bounty on his head.',
    downloadLinks: [
      { quality: '720p', url: '#' },
      { quality: '1080p', url: '#' }
    ],
    views: 890,
    downloads: 320,
    isTrending: true,
    createdAt: Date.now() - 200000000
  },
  {
    id: '3',
    title: 'Ponniyin Selvan: I',
    slug: 'ponniyin-selvan-1-2022',
    poster: 'https://picsum.photos/seed/ps1/400/600',
    releaseYear: 2022,
    languages: [Language.Tamil, Language.Telugu, Language.Malayalam],
    genres: [Genre.Action, Genre.Drama, Genre.Family],
    duration: '2h 47m',
    description: 'Vandiyathevan sets out to cross the Chola land to deliver a message from the Crown Prince Aditha Karikalan.',
    downloadLinks: [
      { quality: '480p', url: '#' },
      { quality: '720p', url: '#' },
      { quality: '1080p', url: '#' }
    ],
    views: 2500,
    downloads: 1200,
    isTrending: false,
    createdAt: Date.now() - 300000000
  },
  {
    id: '4',
    title: 'RRR',
    slug: 'rrr-2022',
    poster: 'https://picsum.photos/seed/rrr/400/600',
    releaseYear: 2022,
    languages: [Language.Telugu, Language.Hindi, Language.Tamil],
    genres: [Genre.Action, Genre.Drama, Genre.Romance],
    duration: '3h 2m',
    description: 'A fictitious story about two legendary revolutionaries and their journey away from home.',
    downloadLinks: [
      { quality: '480p', url: '#' },
      { quality: '720p', url: '#' },
      { quality: '1080p', url: '#' }
    ],
    views: 5600,
    downloads: 3400,
    isTrending: true,
    createdAt: Date.now() - 50000000
  }
];

export const INITIAL_ADS: AdConfig[] = [
  { id: 'ad-top', name: 'Header Banner', enabled: true, code: 'Banner Ad (728x90)', position: 'top' },
  { id: 'ad-middle', name: 'Content Ad', enabled: true, code: 'Middle Banner (300x250)', position: 'middle' },
  { id: 'ad-bottom', name: 'Footer Ad', enabled: true, code: 'Footer Banner (728x90)', position: 'bottom' },
  { id: 'ad-inter', name: 'Download Interstitial', enabled: true, code: 'Full Screen Ad', position: 'interstitial' }
];

export const ADMIN_USER = 'info.prawink@gmail.com';
export const ADMIN_PASS = 'ehj555hj';
