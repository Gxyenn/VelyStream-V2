const BASE_URL = 'https://www.sankavollerei.com/anime';

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

export interface EpisodeDetail {
  episode: string;
  anime: {
    slug: string;
    otakudesu_url: string;
  };
  has_next_episode: boolean;
  next_episode: {
    slug: string;
    otakudesu_url: string;
  } | null;
  has_previous_episode: boolean;
  previous_episode: {
    slug: string;
    otakudesu_url: string;
  } | null;
  stream_url: string;
  stream_servers: StreamServer[];
  download_urls: DownloadUrls;
}

export interface StreamServer {
  quality: string;
  servers: {
    name: string;
    id: string;
  }[];
}

export interface DownloadUrls {
  mp4: DownloadQuality[];
  mkv: DownloadQuality[];
}

export interface DownloadQuality {
  resolution: string;
  urls: {
    provider: string;
    url: string;
  }[];
}

export const api = {
  async getHome() {
    const res = await fetch(`${BASE_URL}/home`);
    const data = await res.json();
    return data.data;
  },

  async getSchedule() {
    const res = await fetch(`${BASE_URL}/schedule`);
    const data = await res.json();
    return data.data;
  },

  async getAnimeDetail(slug: string) {
    const res = await fetch(`${BASE_URL}/anime/${slug}`);
    const data = await res.json();
    return data.data as AnimeDetail;
  },

  async getCompleteAnime(page: number = 1) {
    const res = await fetch(`${BASE_URL}/complete-anime/${page}`);
    const data = await res.json();
    return data.data;
  },

  async getOngoingAnime(page: number = 1) {
    const res = await fetch(`${BASE_URL}/ongoing-anime?page=${page}`);
    const data = await res.json();
    return data.data;
  },

  async getGenres() {
    const res = await fetch(`${BASE_URL}/genre`);
    const data = await res.json();
    return data.data as Genre[];
  },

  async getAnimeByGenre(genre: string, page: number = 1) {
    const res = await fetch(`${BASE_URL}/genre/${genre}?page=${page}`);
    const data = await res.json();
    return data.data;
  },

  async getEpisodeDetail(slug: string) {
    const res = await fetch(`${BASE_URL}/episode/${slug}`);
    const data = await res.json();
    return data.data as EpisodeDetail;
  },

  async searchAnime(query: string) {
    const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data as Anime[];
  },

  async getServerUrl(serverId: string) {
    const res = await fetch(`${BASE_URL}/server${serverId}`);
    const data = await res.json();
    return data.url;
  },

  async getAllAnime() {
    const res = await fetch(`${BASE_URL}/unlimited`);
    const data = await res.json();
    return data.data;
  },

  async getBatchDetail(slug: string) {
    const res = await fetch(`${BASE_URL}/batch/${slug}`);
    const data = await res.json();
    return data.data;
  }
};
