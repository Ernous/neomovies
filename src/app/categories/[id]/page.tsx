'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { categoriesAPI, Movie } from '@/lib/neoApi';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

type MediaType = 'movies' | 'tv';

function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);

  const [categoryName, setCategoryName] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>('movies');
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moviesAvailable, setMoviesAvailable] = useState(true);
  const [tvShowsAvailable, setTvShowsAvailable] = useState(true);

  useEffect(() => {
    async function fetchCategoryName() {
      try {
        const response = await categoriesAPI.getCategory(categoryId);
        setCategoryName(response.data.name);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Не удалось загрузить информацию о категории');
      }
    }
    if (categoryId) {
      fetchCategoryName();
    }
  }, [categoryId]);

  useEffect(() => {
    async function fetchData() {
      if (!categoryId) return;

      setLoading(true);
      setError(null);

      try {
        let response;
        if (mediaType === 'movies') {
          response = await categoriesAPI.getMoviesByCategory(categoryId, page);
          const hasMovies = response.data.results.length > 0;
          if (page === 1) setMoviesAvailable(hasMovies);
          setItems(response.data.results);
          setTotalPages(response.data.total_pages);
          if (!hasMovies && tvShowsAvailable && page === 1) {
            setMediaType('tv');
          }
        } else {
          response = await categoriesAPI.getTVShowsByCategory(categoryId, page);
          const hasTvShows = response.data.results.length > 0;
          if (page === 1) setTvShowsAvailable(hasTvShows);
          const transformedShows = response.data.results.map((show: any) => ({
            ...show,
            title: show.name || show.title,
            release_date: show.first_air_date || show.release_date,
          }));
          setItems(transformedShows);
          setTotalPages(response.data.total_pages);
          if (!hasTvShows && moviesAvailable && page === 1) {
            setMediaType('movies');
          }
        }
      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryId, mediaType, page, moviesAvailable, tvShowsAvailable]);

  const handleMediaTypeChange = (type: MediaType) => {
    if (type === 'movies' && !moviesAvailable) return;
    if (type === 'tv' && !tvShowsAvailable) return;
    setMediaType(type);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const Pagination = useMemo(() => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxPagesToShow = 5;
    let startPage: number;
    let endPage: number;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
        const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
        if (page <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (page + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = page - maxPagesBeforeCurrent;
            endPage = page + maxPagesAfterCurrent;
        }
    }

    // Previous button
    pageButtons.push(
      <button key="prev" onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1 rounded-md bg-card hover:bg-card/80 disabled:opacity-50 disabled:cursor-not-allowed">
        &lt;
      </button>
    );

    if (startPage > 1) {
        pageButtons.push(<button key={1} onClick={() => handlePageChange(1)} className="px-3 py-1 rounded-md bg-card hover:bg-card/80">1</button>);
        if (startPage > 2) {
            pageButtons.push(<span key="dots1" className="px-3 py-1">...</span>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button key={i} onClick={() => handlePageChange(i)} disabled={page === i} className={`px-3 py-1 rounded-md ${page === i ? 'bg-accent text-white' : 'bg-card hover:bg-card/80'}`}>
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(<span key="dots2" className="px-3 py-1">...</span>);
      }
      pageButtons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-3 py-1 rounded-md bg-card hover:bg-card/80">{totalPages}</button>);
    }

    // Next button
    pageButtons.push(
      <button key="next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 rounded-md bg-card hover:bg-card/80 disabled:opacity-50 disabled:cursor-not-allowed">
        &gt;
      </button>
    );

    return <div className="flex justify-center items-center gap-2 my-8 text-foreground">{pageButtons}</div>;
  }, [page, totalPages]);


  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground w-full px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 px-4 py-2 rounded-md bg-card hover:bg-card/80 text-foreground">
          <ArrowLeft size={16} />
          Назад к категориям
        </button>
        <div className="text-red-500 text-center p-8 bg-red-500/10 rounded-lg my-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 px-4 py-2 rounded-md bg-card hover:bg-card/80 text-foreground">
        <ArrowLeft size={16} />
        Назад к категориям
      </button>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
        {categoryName || 'Загрузка...'}
      </h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={() => handleMediaTypeChange('movies')}
          disabled={!moviesAvailable || mediaType === 'movies'}
          className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mediaType === 'movies' ? 'bg-accent text-white' : 'bg-card hover:bg-card/80 text-foreground'}`}
        >
          Фильмы
        </button>
        <button 
          onClick={() => handleMediaTypeChange('tv')}
          disabled={!tvShowsAvailable || mediaType === 'tv'}
          className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mediaType === 'tv' ? 'bg-accent text-white' : 'bg-card hover:bg-card/80 text-foreground'}`}
        >
          Сериалы
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {items.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
              {items.map(item => (
                <MovieCard
                  key={`${mediaType}-${item.id}-${page}`}
                  movie={item}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>Нет {mediaType === 'movies' ? 'фильмов' : 'сериалов'} в этой категории.</p>
            </div>
          )}
          
          {Pagination}
        </>
      )}
    </div>
  );
}

export default CategoryPage;
