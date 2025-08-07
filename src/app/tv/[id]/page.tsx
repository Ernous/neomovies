import { Metadata } from 'next';
import { tvShowsAPI } from '@/lib/neoApi';
import TVPage from '@/app/tv/[id]/TVPage';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(props: Promise<PageProps>): Promise<Metadata> {
  const { params } = await props;
  try {
    const showId = params.id;
    const { data: show } = await tvShowsAPI.getTVShow(showId);
    
    return {
      title: `${show.name} - NeoMovies`,
      description: show.overview,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Сериал - NeoMovies',
    };
  }
}

async function getData(id: string) {
  try {
    const { data: show } = await tvShowsAPI.getTVShow(id);
    return { id, show };
  } catch (error) {
    throw new Error('Failed to fetch TV show');
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = params;
  const data = await getData(id);
  return <TVPage showId={data.id} show={data.show} />;
}
