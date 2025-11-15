import { Anime } from './api';

const MYLIST_KEY = 'velystream_mylist';
const HISTORY_KEY = 'velystream_history';

export interface HistoryItem {
  anime: Anime;
  episode: string; // Episode title, e.g., "Episode 1"
  timestamp: number; // When it was watched
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
  addToHistory: (anime: Anime, episode: string) => {
    let history = storage.getHistory();
    // Remove existing entry for the same anime episode to avoid duplicates
    history = history.filter(h => !(h.anime.slug === anime.slug && h.episode === episode));
    
    // Add new entry to the beginning
    const newHistoryItem: HistoryItem = {
      anime,
      episode,
      timestamp: Date.now()
    };
    history.unshift(newHistoryItem);

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

