import { Metadata } from 'next';
import { moviesAPI } from '@/lib/neoApi';
import MoviePage from '@/app/movie/[id]/MoviePage';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(props: Promise<PageProps>): Promise<Metadata> {
  const { params } = await props;
  try {
    const movieId = params.id;
    
    const { data: movie } = await moviesAPI.getMovie(movieId);
    
    return {
      title: `${movie.title} - NeoMovies`,
      description: movie.overview,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Фильм - NeoMovies',
    };
  }
}

async function getData(id: string) {
  try {
    const { data: movie } = await moviesAPI.getMovie(id);
    return { id, movie };
  } catch (error) {
    throw new Error('Failed to fetch movie');
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = params;
  const data = await getData(id);
  return <MoviePage movieId={data.id} movie={data.movie} />;
}