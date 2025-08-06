import { Metadata } from 'next';
import { moviesAPI } from '@/lib/neoApi';
import MoviePage from '@/app/movie/[id]/MoviePage';

interface PageProps {
  params: {
    id: string;
  };
}

// Генерация метаданных для страницы
export async function generateMetadata(props: Promise<PageProps>): Promise<Metadata> {
  const { params } = await props;
  // В Next.js 14, нужно сначала получить данные фильма,
  // а затем использовать их для метаданных
  try {
    // Получаем id для использования в запросе
    const movieId = params.id;
    
    // Запрашиваем данные фильма
    const { data: movie } = await moviesAPI.getMovie(movieId);
    
    // Создаем метаданные на основе полученных данных
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

// Получение данных для страницы
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