import { Anime } from './api';

const MYLIST_KEY = 'velystream_mylist';
const HISTORY_KEY = 'velystream_history';

export interface HistoryItem {
  anime: Anime;
  episode: string;
  timestamp: number;
}

export const storage = {
  // MyList functions
  getMyList(): Anime[] {
    const data = localStorage.getItem(MYLIST_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToMyList(anime: Anime): void {
    const list = this.getMyList();
    const exists = list.some(item => item.slug === anime.slug);
    if (!exists) {
      list.push(anime);
      localStorage.setItem(MYLIST_KEY, JSON.stringify(list));
    }
  },

  removeFromMyList(slug: string): void {
    const list = this.getMyList();
    const filtered = list.filter(item => item.slug !== slug);
    localStorage.setItem(MYLIST_KEY, JSON.stringify(filtered));
  },

  isInMyList(slug: string): boolean {
    const list = this.getMyList();
    return list.some(item => item.slug === slug);
  },

  // History functions
  getHistory(): HistoryItem[] {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToHistory(anime: Anime, episode: string): void {
    const history = this.getHistory();
    
    // Remove existing entry for same anime
    const filtered = history.filter(item => item.anime.slug !== anime.slug);
    
    // Add new entry at the beginning
    filtered.unshift({
      anime,
      episode,
      timestamp: Date.now()
    });

    // Keep only last 50 items
    const limited = filtered.slice(0, 50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  },

  clearHistory(): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  }
};

