'use client';

import { useState } from 'react';
import { useMovies, MovieCategory } from '@/hooks/useMovies';
import MovieTile from '@/components/MovieTile';
import Pagination from '@/components/Pagination';
import HorizontalSlider from '@/components/HorizontalSlider';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MovieCategory>('popular');
  const { movies, loading, error, totalPages, currentPage, setPage } = useMovies({ category: activeTab });

  const handleTabClick = (tab: MovieCategory) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (loading && !movies.length) {
    return (
      <div className="flex min-h-[calc(100vh-128px)] items-center justify-center text-gray-500 dark:text-gray-400">
        Загрузка...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-128px)] items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const sliderMovies = movies.slice(0, 10);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => { setActiveTab('popular'); setPage(1); }}
              className={`${ 
                activeTab === 'popular'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
            >
              Популярные
            </button>
            <button
              onClick={() => setActiveTab('now-playing')}
              className={`${ 
                activeTab === 'now-playing'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
            >
              Новинки
            </button>
             <button
              onClick={() => setActiveTab('top-rated')}
              className={`${ 
                activeTab === 'top-rated'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
            >
              Топ рейтинга
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${ 
                activeTab === 'upcoming'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
            >
              Скоро
            </button>
          </nav>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((movie) => (
               <MovieTile key={movie.id} movie={movie} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          {activeTab === 'popular' && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          )}
        </div>
      </div>
    </main>
  );
}
