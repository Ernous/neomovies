'use client';

import PageLayout from '@/components/PageLayout';
import MovieContent from './MovieContent';
import type { MovieDetails } from '@/lib/neoApi';

interface MoviePageProps {
  movieId: string;
  movie: MovieDetails | null;
}

export default function MoviePage({ movieId, movie }: MoviePageProps) {
  if (!movie) {
    return (
      <PageLayout>
        <div className="w-full min-h-screen">
          <div>Фильм не найден</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full">
        <MovieContent movieId={movieId} initialMovie={movie} />
      </div>
    </PageLayout>
  );
}
