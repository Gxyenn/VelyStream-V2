const BASE_URL = 'https://www.sankavollerei.com/anime';

// Interface dasar
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

// Interface untuk Detail Anime
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

// Interface untuk Watch/Episode Detail
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
  download_urls: EpisodeDownloadFormat[];
}

export interface EpisodeDownloadUrl {
  provider: string;
  url: string;
}

export interface EpisodeDownloadQuality {
  quality: string;
  urls: EpisodeDownloadUrl[];
}

export interface EpisodeDownloadFormat {
  format: string; // "MP4" atau "MKV"
  qualities: EpisodeDownloadQuality[];
}

export interface StreamServer {
  quality: string;
  servers: {
    name: string;
    id: string;
  }[];
}

// --- Interfaces untuk Batch Download (Sesuai API Streaming) ---
export interface BatchUrl {
  title: string;
  url: string;
}

export interface BatchQuality {
  title: string; // ex: "MP4 360p"
  size: string;  // ex: "0.91 GB"
  urls: BatchUrl[]; // List provider (OtakuDrive, Mega, dll)
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
  downloadUrl: {
    formats: BatchQuality[]; // Struktur API biasanya langsung list quality di dalam formats atau nested
  };
}

// Response Wrappers
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
  anime?: T;
}

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

export interface AllAnimeResponse {
  list: {
    startWith: string;
    animeList: {
        title: string;
        animeId: string;
        href: string;
        otakudesuUrl: string;
    }[];
  }[];
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
    const data = await res.json();
    return data.data;
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
    const transformedData = {
      ...rawData.data,
      paginationData: rawData.data.pagination,
    };
    delete transformedData.pagination;
    return transformedData;
  },

  async getEpisodeDetail(slug: string): Promise<EpisodeDetail> {
    const res = await fetch(`${BASE_URL}/episode/${slug}`);
    const data = await res.json();
    return data.data;
  },

  async searchAnime(query: string): Promise<Anime[]> {
    const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data as Anime[];
  },

  async getServerUrl(serverId: string): Promise<string> {
    const res = await fetch(`https://www.sankavollerei.com${serverId}`);
    const data = await res.json();
    return data.url;
  },

  async getAllAnime(): Promise<AllAnimeResponse> {
    const res = await fetch(`${BASE_URL}/unlimited`);
    const data = await res.json();
    return data.data;
  },

  // Endpoint Batch Baru
  async getBatchDetail(batchSlug: string): Promise<BatchDetail> {
    const res = await fetch(`${BASE_URL}/batch/${batchSlug}`);
    const data = await res.json();
    // Adaptasi jika struktur formats sedikit berbeda
    return data.data;
  },
};