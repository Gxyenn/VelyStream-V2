import { cleanSlug } from './utils';

const BASE_URL = 'https://www.sankavollerei.com/anime';

// Interface dasar untuk item anime di banyak endpoint
export interface Anime {
  title: string;
  slug: string;
  poster: string;
  rating?: string;
  episode_count?: string | null;
  current_episode?: string;
  release_day?: string;
  newest_release_date?: string;
  last_release_date?: string;
  status?: string;
  genres?: Genre[];
  synopsis?: string;
  season?: string;
  studio?: string;
  otakudesu_url: string;
}

export interface Genre {
  name: string;
  slug: string;
  otakudesu_url: string;
}

// Interface untuk Halaman Detail Anime
export interface AnimeDetail {
  title: string;
  slug: string;
  japanese_title?: string;
  poster: string;
  rating: string;
  produser?: string;
  type: string;
  status: string;
  episode_count: string;
  duration: string;
  release_date: string;
  studio: string;
  genres: Genre[];
  synopsis: string;
  batch?: {
    slug: string;
    otakudesu_url: string;
    uploaded_at: string;
  };
  episode_lists: Episode[];
  recommendations: Anime[];
}

export interface Episode {
  episode: string;
  episode_number: number;
  slug: string;
  otakudesu_url: string;
}

// Interface untuk Halaman Nonton (Watch)
export interface EpisodeDetail {
  episode: string;
  anime: {
    slug: string;
    otakudesu_url: string;
  };
  has_next_episode: boolean;
  next_episode: { slug: string; otakudesu_url: string } | null;
  has_previous_episode: boolean;
  previous_episode: { slug: string; otakudesu_url: string } | null;
  stream_url: string;
  stream_servers: StreamServer[];
  download_urls: {
    mp4: DownloadQuality[];
    mkv: DownloadQuality[];
  };
}

export interface StreamServer {
  quality: string;
  servers: {
    name: string;
    id: string;
  }[];
}

export interface DownloadQuality {
  resolution: string;
  urls: {
    provider: string;
    url: string;
  }[];
}

// Untuk endpoint /complete-anime dan /ongoing-anime
export interface PaginatedAnimeResponse<T> {
  paginationData: {
    current_page: number;
    last_visible_page: number;
    has_next_page: boolean;
    next_page: number | null;
    has_previous_page: boolean;
    previous_page: number | null;
  };
  ongoingAnimeData?: T;
  completeAnimeData?: T;
  anime?: T; // Untuk genre
}

// Untuk endpoint /schedule
export interface ScheduleAnime {
    anime_name: string;
    url: string;
    slug: string;
    poster: string;
}

export interface ScheduleDay {
    day: string;
    anime_list: ScheduleAnime[];
}

// Untuk endpoint /unlimited
export interface AllAnimeItem {
  title: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

export interface AllAnimeResponse {
  list: {
    startWith: string;
    animeList: AllAnimeItem[];
  }[];
}

// Interfaces for Batch Download (API Key 10)
export interface BatchUrl {
  title: string;
  url: string;
}

export interface BatchQuality {
  title: string;
  size: string;
  urls: BatchUrl[];
}

export interface BatchFormat {
  title: string;
  qualities: BatchQuality[];
}

export interface BatchDetail {
  title: string;
  animeId: string;
  poster: string;
  japanese: string;
  type: string;
  score: string;
  episodes: number;
  duration: string;
  studios: string;
  producers: string;
  aired: string;
  credit: string;
  genreList: {
    title: string;
    genreId: string;
    href: string;
    otakudesuUrl: string;
  }[];
  downloadUrl: {
    formats: BatchFormat[];
  };
}

export const api = {
  async getHome(): Promise<{ ongoing_anime: Anime[] }> {
    const res = await fetch(`${BASE_URL}/home`);
    const data = await res.json();
    return data.data;
  },

  async getSchedule(): Promise<ScheduleDay[]> {
    const res = await fetch(`${BASE_URL}/schedule`);
    const data = await res.json();
    return data.data;
  },

  async getAnimeDetail(slug: string): Promise<AnimeDetail> {
    const res = await fetch(`${BASE_URL}/anime/${slug}`);
    const json = await res.json();
    
    // PERBAIKAN: Membersihkan slug utama dari data API sebelum dikembalikan
    if (json.data && json.data.slug) {
      json.data.slug = cleanSlug(json.data.slug);
    }
    
    return json.data;
  },

  async getCompleteAnime(page: number = 1): Promise<PaginatedAnimeResponse<Anime[]>> {
    const res = await fetch(`${BASE_URL}/complete-anime/${page}`);
    const data = await res.json();
    return data.data;
  },

  async getOngoingAnime(page: number = 1): Promise<PaginatedAnimeResponse<Anime[]>> {
    const res = await fetch(`${BASE_URL}/ongoing-anime?page=${page}`);
    const data = await res.json();
    return data.data;
  },

  async getGenres(): Promise<Genre[]> {
    const res = await fetch(`${BASE_URL}/genre`);
    const data = await res.json();
    return data.data;
  },

  async getAnimeByGenre(genre: string, page: number = 1): Promise<PaginatedAnimeResponse<Anime[]>> {
    const res = await fetch(`${BASE_URL}/genre/${genre}?page=${page}`);
    const rawData = await res.json();
    // Transform the response to be consistent
    const transformedData = {
      ...rawData.data,
      paginationData: rawData.data.pagination,
    };
    delete transformedData.pagination;
    return transformedData;
  },

  async getEpisodeDetail(slug: string): Promise<EpisodeDetail> {
    const res = await fetch(`${BASE_URL}/episode/${slug}`);
    const json = await res.json();

    // PERBAIKAN: Membersihkan slug anime yang ada di dalam data episode
    if (json.data && json.data.anime && json.data.anime.slug) {
      json.data.anime.slug = cleanSlug(json.data.anime.slug);
    }

    return json.data;
  },

  async searchAnime(query: string): Promise<Anime[]> {
    const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data as Anime[];
  },

  async getServerUrl(serverId: string): Promise<string> {
    // PERBAIKAN KRITIS: URL server dibentuk dari root domain
    const res = await fetch(`https://www.sankavollerei.com${serverId}`);
    const data = await res.json();
    return data.url;
  },

  async getAllAnime(): Promise<AllAnimeResponse> {
    const res = await fetch(`${BASE_URL}/unlimited`);
    const data = await res.json();
    return data.data;
  },

  async getBatchDetail(batchSlug: string): Promise<BatchDetail> {
    const res = await fetch(`${BASE_URL}/batch/${batchSlug}`);
    const data = await res.json();
    return data.data;
  },
};