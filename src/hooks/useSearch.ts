'use client';

import { useState } from 'react';
import { searchAPI } from '@/lib/neoApi';
import type { Movie } from '@/lib/neoApi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useSearch() {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchFailed, setSearchFailed] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const filterMovies = (movies: Movie[]) => {
    return movies.filter(movie => {
      if (movie.vote_average === 0) return false;
      const hasRussianLetters = /[а-яА-ЯёЁ]/.test(movie.title);
      if (!hasRussianLetters) return false;
      if (/^\d+$/.test(movie.title)) return false;
      const releaseDate = new Date(movie.release_date);
      const now = new Date();
      if (releaseDate > now) return false;
      return true;
    });
  };

  const searchMovies = async (query: string) => {
    try {
      if (!query.trim()) {
        setResults([]);
        setHasMore(false);
        setCurrentPage(1);
        setCurrentQuery('');
        setSearchFailed(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setSearchFailed(false);
      setCurrentQuery(query);
      setCurrentPage(1);

      const response = await searchAPI.multiSearch(query, 1);
      const filteredMovies = filterMovies(response.data.results);
      
      if (filteredMovies.length === 0) {
        setSearchFailed(true);
      }

      setResults(filteredMovies);
      setHasMore(response.data.total_pages > 1);
    } catch (err) {
      console.error('Ошибка при поиске:', err);
      setError('Произошла ошибка при поиске');
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore || !currentQuery) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      
      const response = await searchAPI.multiSearch(currentQuery, nextPage);
      const filteredMovies = filterMovies(response.data.results);
      
      setResults(prev => [...prev, ...filteredMovies]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < response.data.total_pages && nextPage < 5); // Ограничиваем до 5 страниц
    } catch (err) {
      console.error('Ошибка при загрузке дополнительных результатов:', err);
      setError('Произошла ошибка при загрузке дополнительных результатов');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    hasMore,
    searchFailed,
    searchMovies,
    loadMore
  };
}
