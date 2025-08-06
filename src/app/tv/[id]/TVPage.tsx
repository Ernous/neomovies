'use client';

import PageLayout from '@/components/PageLayout';
import TVContent from '@/app/tv/[id]/TVContent';
import type { TVShowDetails } from '@/lib/neoApi';

interface TVPageProps {
  showId: string;
  show: TVShowDetails | null;
}

export default function TVPage({ showId, show }: TVPageProps) {
  if (!show) {
    return (
      <PageLayout>
        <div className="w-full min-h-screen">
          <div>Сериал не найден</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full">
        <TVContent showId={showId} initialShow={show} />
      </div>
    </PageLayout>
  );
} 