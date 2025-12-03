import { Anime } from './api';

const MYLIST_KEY = 'velystream_mylist';
const HISTORY_KEY = 'velystream_history';

export interface HistoryItem {
  anime: Anime;
  episode: {
    title: string;
    slug: string;
  };
  timestamp: number;
}

export const storage = {
  // MyList functions
  getMyList(): Anime[] {
    const data = localStorage.getItem(MYLIST_KEY);
    const list = data ? JSON.parse(data) : [];
    console.log('[Storage Debug] getMyList:', list);
    return list;
  },

  addToMyList(anime: Anime): void {
    const list = this.getMyList();
    const exists = list.some(item => item.slug === anime.slug);
    if (!exists) {
      list.push(anime);
      console.log(`[Storage Debug] addToMyList: Adding '${anime.slug}'. New list:`, list);
      localStorage.setItem(MYLIST_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('storage_changed'));
    } else {
      console.log(`[Storage Debug] addToMyList: Slug '${anime.slug}' already exists.`);
    }
  },

  removeFromMyList(slug: string): void {
    let list = this.getMyList();
    const filtered = list.filter(item => item.slug !== slug);
    console.log(`[Storage Debug] removeFromMyList: Removing '${slug}'. New list:`, filtered);
    localStorage.setItem(MYLIST_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage_changed'));
  },

  isInMyList(slug: string): boolean {
    const list = this.getMyList();
    const inList = list.some(item => item.slug === slug);
    console.log(`[Storage Debug] isInMyList: Checking for '${slug}'. Is in list?`, inList);
    return inList;
  },

  // History functions
  getHistory(): HistoryItem[] {
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) {
      const history = JSON.parse(data);
      // Quick check to see if the data is in the old format.
      // If the first item's episode is a string, it's the old format.
      if (history.length > 0 && typeof history[0].episode === 'string') {
        // Clear the old history
        localStorage.removeItem(HISTORY_KEY);
        return [];
      }
      return history;
    }
    return [];
  },

  addToHistory(anime: Anime, episode: { title: string; slug: string }): void {
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
    window.dispatchEvent(new Event('storage_changed'));
  },

  clearHistory(): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('storage_changed'));
  }
};

