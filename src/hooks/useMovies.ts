'use client';

import { useState, useEffect, useCallback } from 'react';
import { moviesAPI } from '@/lib/neoApi';
import type { Movie, MovieResponse } from '@/lib/neoApi';

export type MovieCategory = 'popular' | 'top-rated' | 'now-playing' | 'upcoming';

interface UseMoviesProps {
  initialPage?: number;
  category?: MovieCategory;
}

export function useMovies({ initialPage = 1, category = 'popular' }: UseMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = useCallback(async (pageNum: number, movieCategory: MovieCategory) => {
    try {
      setLoading(true);
      setError(null);

      let response: { data: MovieResponse };

      switch (movieCategory) {
        case 'top-rated':
          response = await moviesAPI.getTopRated(pageNum);
          break;
        case 'now-playing':
          response = await moviesAPI.getNowPlaying(pageNum);
          break;
        case 'upcoming':
          response = await moviesAPI.getUpcoming(pageNum);
          break;
        case 'popular':
        default:
          response = await moviesAPI.getPopular(pageNum);
          break;
      }

      setMovies(response.data.results);
      setTotalPages(response.data.total_pages > 500 ? 500 : response.data.total_pages);
    } catch (err) {
      console.error(`Ошибка при загрузке категории "${movieCategory}":`, err);
      setError('Произошла ошибка при загрузке фильмов');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(page, category);
  }, [page, category, fetchMovies]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  return {
    movies,
    loading,
    error,
    totalPages,
    currentPage: page,
    setPage: handlePageChange,
  };
}
