import { Anime } from './api';

const MYLIST_KEY = 'velystream_mylist';
const HISTORY_KEY = 'velystream_history';

export interface HistoryItem {
  anime: Anime;
  episode: string; // Episode title, e.g., "Episode 1"
  episodeSlug: string; // Slug for the watch page URL
  episodeNumber: number; // Number of the episode
  timestamp: number; // When it was watched
  watchProgress?: number; // Optional: progress in seconds
}

export const storage = {
  // My List
  getMyList: (): Anime[] => {
    const list = localStorage.getItem(MY_LIST_KEY);
    return list ? JSON.parse(list) : [];
  },
  addToMyList: (anime: Anime) => {
    const list = storage.getMyList();
    if (!list.some(item => item.slug === anime.slug)) {
      list.unshift(anime);
      localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
    }
  },
  removeFromMyList: (slug: string) => {
    let list = storage.getMyList();
    list = list.filter(item => item.slug !== slug);
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
  },
  isInMyList: (slug: string): boolean => {
    const list = storage.getMyList();
    return list.some(item => item.slug === slug);
  },

  // History
  getHistory: (): HistoryItem[] => {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  },
  addToHistory: (anime: Anime, episode: { title: string; slug: string; number: number }) => {
    let history = storage.getHistory();
    // Remove existing entry for the same anime to avoid duplicates, now checking by anime slug.
    history = history.filter(item => item.anime.slug !== anime.slug);
    // Add new entry to the beginning
    history.unshift({ 
      anime, 
      episode: episode.title,
      episodeSlug: episode.slug,
      episodeNumber: episode.number,
      timestamp: Date.now() 
    });
    // Keep history to a reasonable size, e.g., 100 items
    if (history.length > 100) {
      history.pop();
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  clearHistory(): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  }
};

