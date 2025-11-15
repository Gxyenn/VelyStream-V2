const BASE_URL = 'https://api.gdriveplayer.us/v1';
const BASE_URL_2 = 'https://api.gdriveplayer.us/v2';

export interface Anime {
  title: string;
  slug: string;
  poster: string;
  rating?: string;
  episode?: string;
  release_day?: string;
  newest_release_date?: string;
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

export const api = {
  async getHome(): Promise<{ ongoing_anime: Anime[] }> {
    const res = await fetch(`${BASE_URL}/home`);
    const data = await res.json();
    return data.data;
  },

  async getAnimeDetail(slug: string): Promise<AnimeDetail> {
    const res = await fetch(`${BASE_URL}/anime/${slug}`);
    const data = await res.json();
    return data.data;
  },

  async getCompleteAnime(page: number = 1): Promise<any> {
    const res = await fetch(`${BASE_URL}/complete-anime/${page}`);
    return res.json();
  },

  async getGenres(): Promise<Genre[]> {
    const res = await fetch(`${BASE_URL}/genres`);
    const data = await res.json();
    return data.data;
  },

  async getAnimeByGenre(genre: string, page: number = 1): Promise<any> {
    const res = await fetch(`${BASE_URL}/genres/${genre}/${page}`);
    return res.json();
  },

  async getEpisodeDetail(slug: string): Promise<EpisodeDetail> {
    const res = await fetch(`${BASE_URL}/episode/${slug}`);
    const data = await res.json();
    return data.data;
  },

  async searchAnime(query: string): Promise<Anime[]> {
    const res = await fetch(`${BASE_URL_2}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data as Anime[];
  },

  async getServerUrl(serverId: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/stream/${serverId}`);
    const data = await res.json();
    return data.data.stream_url;
  }
};
