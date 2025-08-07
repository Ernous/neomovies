import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://neomovies-test-api.vercel.app';

export const neoApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Добавляем перехватчики запросов
neoApi.interceptors.request.use(
  (config) => {
    console.log('🔍 Debug: Отправляем запрос:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    if (config.params?.page) {
      const page = parseInt(config.params.page);
      if (isNaN(page) || page < 1) {
        config.params.page = 1;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчики ответов
neoApi.interceptors.response.use(
  (response) => {
    console.log('🔍 Debug: Получен ответ:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    // Если ответ содержит обертку success/data, извлекаем данные
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Функция для получения URL изображения
export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/images/placeholder.jpg';
  
  // Если путь уже содержит полный URL, возвращаем как есть
  if (path.startsWith('http')) {
    return path;
  }
  
  // Убираем ведущий слеш если есть
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Используем наш API прокси для изображений
  return `${API_URL}/api/v1/images/${size}/${cleanPath}`;
};

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  runtime?: number;
  genres?: Genre[];
  popularity?: number;
  media_type?: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TorrentResult {
  title: string;
  tracker: string;
  size: string;
  seeders: number;
  peers: number;
  leechers: number;
  quality: string;
  voice?: string[];
  types?: string[];
  seasons?: number[];
  category: string;
  magnet: string;
  torrent_link?: string;
  details?: string;
  publish_date: string;
  added_date?: string;
  source: string;
}

export interface TorrentSearchResponse {
  query: string;
  results: TorrentResult[];
  total: number;
}

export interface AvailableSeasonsResponse {
  title: string;
  originalTitle: string;
  year: string;
  seasons: number[];
  total: number;
}

export const searchAPI = {
  // Поиск фильмов
  searchMovies(query: string, page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/movies/search', {
      params: {
        query,
        page
      },
      timeout: 30000
    });
  },
  
  // Поиск сериалов
  searchTV(query: string, page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/tv/search', {
      params: {
        query,
        page
      },
      timeout: 30000
    });
  },

  // Мультипоиск (фильмы и сериалы) - новый эндпоинт
  async multiSearch(query: string, page = 1) {
    try {
      // Используем новый эндпоинт Go API
      const response = await neoApi.get<MovieResponse>('/search/multi', {
        params: {
          query,
          page
        },
        timeout: 30000
      });
      
      return response;
    } catch (error) {
      console.error('Error in multiSearch:', error);
      throw error;
    }
  }
};

export const moviesAPI = {
  // Получение популярных фильмов
  getPopular(page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/movies/popular', { 
      params: { page },
      timeout: 30000
    });
  },

  // Получение фильмов с высоким рейтингом
  getTopRated(page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/movies/top-rated', {
      params: { page },
      timeout: 30000
    });
  },

  // Получение новинок
  getNowPlaying(page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/movies/now-playing', {
      params: { page },
      timeout: 30000
    });
  },

  // Получение предстоящих фильмов
  getUpcoming(page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/movies/upcoming', {
      params: { page },
      timeout: 30000
    });
  },

  // Получение данных о фильме по его ID
  getMovie(id: string | number) {
    return neoApi.get(`/api/v1/movies/${id}`, { timeout: 30000 });
  },

  // Поиск фильмов
  searchMovies(query: string, page = 1) {
    return neoApi.get<MovieResponse>('/api/v1/movies/search', {
      params: {
        query,
        page
      },
      timeout: 30000
    });
  },

  // Получение IMDB и других external ids
  getExternalIds(id: string | number) {
    return neoApi.get(`/api/v1/movies/${id}/external-ids`, { timeout: 30000 }).then(res => res.data);
  }
};

export const tvShowsAPI = {
  // Получение популярных сериалов
  getPopular(page = 1) {
    return neoApi.get('/api/v1/tv/popular', { 
      params: { page },
      timeout: 30000
    });
  },

  // Получение сериалов с высоким рейтингом
  getTopRated(page = 1) {
    return neoApi.get('/api/v1/tv/top-rated', { 
      params: { page },
      timeout: 30000
    });
  },

  // Получение сериалов в эфире
  getOnTheAir(page = 1) {
    return neoApi.get('/api/v1/tv/on-the-air', { 
      params: { page },
      timeout: 30000
    });
  },

  // Получение сериалов, которые выходят сегодня
  getAiringToday(page = 1) {
    return neoApi.get('/api/v1/tv/airing-today', { 
      params: { page },
      timeout: 30000
    });
  },

  // Получение данных о сериале по его ID
  getTVShow(id: string | number) {
    return neoApi.get(`/api/v1/tv/${id}`, { timeout: 30000 });
  },

  // Поиск сериалов
  searchTVShows(query: string, page = 1) {
    return neoApi.get('/api/v1/tv/search', {
      params: {
        query,
        page
      },
      timeout: 30000
    });
  },

  // Получение IMDB и других external ids
  getExternalIds(id: string | number) {
    return neoApi.get(`/api/v1/tv/${id}/external-ids`, { timeout: 30000 }).then(res => res.data);
  }
};

export const torrentsAPI = {
  // Поиск торрентов по IMDB ID
  searchTorrents(imdbId: string, type: 'movie' | 'tv', options?: {
    season?: number;
    quality?: string;
    minQuality?: string;
    maxQuality?: string;
    excludeQualities?: string;
    hdr?: boolean;
    hevc?: boolean;
    sortBy?: string;
    sortOrder?: string;
    groupByQuality?: boolean;
    groupBySeason?: boolean;
  }) {
    const params: any = { type };
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'excludeQualities' && Array.isArray(value)) {
            params[key] = value.join(',');
          } else {
            params[key] = value;
          }
        }
      });
    }

    return neoApi.get<TorrentSearchResponse>(`/api/v1/torrents/search/${imdbId}`, {
      params,
      timeout: 30000
    });
  },

  // Получение доступных сезонов для сериала
  getAvailableSeasons(title: string, originalTitle?: string, year?: string) {
    const params: any = { title };
    if (originalTitle) params.originalTitle = originalTitle;
    if (year) params.year = year;

    return neoApi.get<AvailableSeasonsResponse>('/api/v1/torrents/seasons', {
      params,
      timeout: 30000
    });
  },

  // Универсальный поиск торрентов по запросу
  searchByQuery(query: string, type: 'movie' | 'tv' | 'anime' = 'movie', year?: string) {
    const params: any = { query, type };
    if (year) params.year = year;

    return neoApi.get<TorrentSearchResponse>('/api/v1/torrents/search', {
      params,
      timeout: 30000
    });
  }
};

export interface Category {
  id: number;
  name: string;
}

export const categoriesAPI = {
  // Получение всех категорий
  getCategories() {
    return neoApi.get<{ categories: Category[] }>('/api/v1/categories');
  },

  // Получение категории по ID
  getCategory(id: number) {
    return neoApi.get<Category>(`/api/v1/categories/${id}`);
  },

  // Получение фильмов по категории
  getMoviesByCategory(categoryId: number, page = 1) {
    return neoApi.get<MovieResponse>(`/api/v1/categories/${categoryId}/movies`, {
      params: { page }
    });
  },

  // Получение сериалов по категории
  getTVShowsByCategory(categoryId: number, page = 1) {
    return neoApi.get<MovieResponse>(`/api/v1/categories/${categoryId}/tv`, {
      params: { page }
    });
  }
};
