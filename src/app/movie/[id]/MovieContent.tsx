'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { moviesAPI } from '@/lib/neoApi';
import { getImageUrl } from '@/lib/neoApi';
import type { MovieDetails } from '@/lib/neoApi';
import MoviePlayer from '@/components/MoviePlayer';
import TorrentSelector from '@/components/TorrentSelector';
import FavoriteButton from '@/components/FavoriteButton';
import Reactions from '@/components/Reactions';
import { formatDate } from '@/lib/utils';
import { PlayCircle, ArrowLeft } from 'lucide-react';
import { NextSeo } from 'next-seo';

interface MovieContentProps {
  movieId: string;
  initialMovie: MovieDetails;
}

export default function MovieContent({ movieId, initialMovie }: MovieContentProps) {
  const [movie] = useState<MovieDetails>(initialMovie);
  const [externalIds, setExternalIds] = useState<any>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExternalIds = async () => {
      try {
        const data = await moviesAPI.getExternalIds(movieId);
        setExternalIds(data);
        if (data?.imdb_id) {
          setImdbId(data.imdb_id);
        }
      } catch (err) {
        console.error('Error fetching external ids:', err);
      }
    };
    fetchExternalIds();
  }, [movieId]);

  const showControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
  };

  const handleOpenPlayer = () => {
    setIsPlayerFullscreen(true);
    showControls();
  };
  
  const handleClosePlayer = () => {
    setIsPlayerFullscreen(false);
    if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
    }
  };

  return (
    <>
      <NextSeo
        title={`${movie.title} смотреть онлайн`}
        description={movie.overview?.slice(0, 150)}
        canonical={`https://neomovies.ru/movie/${movie.id}`}
        openGraph={{
          url: `https://neomovies.ru/movie/${movie.id}`,
          images: [
            {
              url: getImageUrl(movie.poster_path, 'w780'),
              alt: movie.title,
            },
          ],
        }}
      />
      {/* schema.org Movie */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Movie',
            name: movie.title,
            image: getImageUrl(movie.poster_path, 'w780'),
            description: movie.overview,
            datePublished: movie.release_date,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: movie.vote_average,
              ratingCount: movie.vote_count,
            },
          }),
        }}
      />
      <div className="min-h-screen bg-background text-foreground px-4 py-6 md:px-6 lg:px-8">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left Column: Poster */}
            <div className="md:col-span-1">
              <div className="sticky top-24 max-w-sm mx-auto md:max-w-none md:mx-0">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={getImageUrl(movie.poster_path, 'w500')}
                    alt={`Постер фильма ${movie.title}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Middle Column: Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="mt-1 text-lg text-muted-foreground">{movie.tagline}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-medium">Рейтинг: {movie.vote_average.toFixed(1)}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{movie.runtime} мин.</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{formatDate(movie.release_date)}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-4 text-base text-muted-foreground">
                <p>{movie.overview}</p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                {/* Mobile-only Watch Button */}
                {imdbId && (
                  <button
                    onClick={handleOpenPlayer}
                    className="md:hidden flex items-center justify-center gap-2 rounded-md bg-red-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-600"
                  >
                    <PlayCircle size={20} />
                    <span>Смотреть</span>
                  </button>
                )}
                <FavoriteButton
                  mediaId={movie.id.toString()}
                  mediaType="movie"
                  title={movie.title}
                  posterPath={movie.poster_path}
                  className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80"
                  showText={true}
                />
              </div>

              <div className="mt-8">
                <Reactions mediaId={movie.id.toString()} mediaType="movie" />
              </div>

              {/* Desktop-only Embedded Player */}
              {imdbId && (
                <div className="mt-10 space-y-4">
                <div id="movie-player" className="hidden md:block rounded-lg bg-secondary/50 p-4 shadow-inner">
                   <MoviePlayer
                    id={movie.id.toString()}
                    title={movie.title}
                    poster={movie.poster_path || ''}
                    imdbId={imdbId}
                  />
                  </div>
                <TorrentSelector 
                    imdbId={imdbId}
                    type="movie"
                    title={movie.title}
                    originalTitle={movie.original_title}
                    year={movie.release_date?.split('-')[0]}
                  />
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Player for Mobile */}
      {isPlayerFullscreen && imdbId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onMouseMove={showControls}
          onClick={showControls}
        >
          <MoviePlayer
            id={movie.id.toString()}
            title={movie.title}
            poster={movie.poster_path || ''}
            imdbId={imdbId}
          />
          <button
            onClick={handleClosePlayer}
            className={`absolute top-1/2 left-4 -translate-y-1/2 z-50 rounded-full bg-black/50 p-2 text-white transition-opacity duration-300 hover:bg-black/75 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Назад"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      )}
    </>
  );
}
