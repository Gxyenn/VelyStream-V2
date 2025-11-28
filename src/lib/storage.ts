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

// Helper function to ensure slugs are consistent
const cleanSlug = (slug: string): string => {
  if (!slug) return '';
  try {
    if (slug.startsWith('http')) {
      const url = new URL(slug);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || '';
    }
    return slug;
  } catch (error) {
    console.error("Invalid slug format:", slug);
    return slug;
  }
};


export const storage = {
  // MyList functions
  getMyList(): Anime[] {
    const data = localStorage.getItem(MYLIST_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToMyList(anime: Anime): void {
    const list = this.getMyList();
    const cleanedSlug = cleanSlug(anime.slug);
    const exists = list.some(item => cleanSlug(item.slug) === cleanedSlug);
    if (!exists) {
      // Store the anime with its original slug, but ensure we use cleaned for checks
      list.push(anime);
      localStorage.setItem(MYLIST_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('storage_changed'));
    }
  },

  removeFromMyList(slug: string): void {
    let list = this.getMyList();
    const cleanedSlug = cleanSlug(slug);
    const filtered = list.filter(item => cleanSlug(item.slug) !== cleanedSlug);
    localStorage.setItem(MYLIST_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage_changed'));
  },

  isInMyList(slug: string): boolean {
    const list = this.getMyList();
    const cleanedSlug = cleanSlug(slug);
    return list.some(item => cleanSlug(item.slug) === cleanedSlug);
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
    const cleanedAnimeSlug = cleanSlug(anime.slug);
    
    // Remove existing entry for same anime
    const filtered = history.filter(item => cleanSlug(item.anime.slug) !== cleanedAnimeSlug);
    
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

