'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import { torrentsAPI, type TorrentResult } from '@/lib/neoApi';

interface TorrentSelectorProps {
  imdbId: string | null;
  type: 'movie' | 'tv';
  title?: string;
  originalTitle?: string;
  year?: string;
}

export default function TorrentSelector({ imdbId, type, title, originalTitle, year }: TorrentSelectorProps) {
  const [torrents, setTorrents] = useState<TorrentResult[] | null>(null);
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(type === 'movie' ? 1 : null);
  const [selectedMagnet, setSelectedMagnet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Для TV показов получаем доступные сезоны из названий торрентов
  useEffect(() => {
    if (type === 'tv' && title && !availableSeasons.length) {
      fetchAvailableSeasons();
    }
  }, [type, title, originalTitle, year]);

  // Для TV показов автоматически выбираем первый сезон
  useEffect(() => {
    if (type === 'tv' && availableSeasons.length > 0 && !selectedSeason) {
      setSelectedSeason(availableSeasons[0]);
    }
  }, [type, availableSeasons, selectedSeason]);

  useEffect(() => {
    if (!imdbId) return;
    
    // Для фильмов загружаем сразу
    if (type === 'movie') {
      fetchTorrents();
    }
    // Для TV показов загружаем только когда выбран сезон
    else if (type === 'tv' && selectedSeason) {
      fetchTorrents();
    }
  }, [imdbId, type, selectedSeason]);

  const fetchAvailableSeasons = async () => {
    if (!title) return;
    
    try {
      const response = await torrentsAPI.getAvailableSeasons(title, originalTitle, year);
      setAvailableSeasons(response.data.seasons || []);
    } catch (err) {
      console.error('Failed to fetch available seasons:', err);
      // Если не удалось получить сезоны, используем пустой массив
      setAvailableSeasons([]);
    }
  };

  const fetchTorrents = async () => {
    setLoading(true);
    setError(null);
    setSelectedMagnet(null);
    try {
      const options: any = {};
      
      if (type === 'tv' && selectedSeason) {
        options.season = selectedSeason;
      }
      
      const response = await torrentsAPI.searchTorrents(imdbId!, type, options);
      
      if (response.data.total === 0) {
        setError('Торренты не найдены.');
      } else {
        setTorrents(response.data.results);
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить список торрентов.');
    } finally {
      setLoading(false);
    }
  };

  const handleQualitySelect = (torrent: TorrentResult) => {
    setSelectedMagnet(torrent.magnet);
    setIsCopied(false);
  };

  const handleCopy = () => {
    if (!selectedMagnet) return;
    navigator.clipboard.writeText(selectedMagnet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Загрузка торрентов...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-md bg-red-100 p-3 text-sm text-red-700">
        <AlertTriangle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (!torrents) return null;

  const renderTorrentButtons = (list: TorrentResult[]) => {
    if (!list?.length) {
      return (
        <p className="text-sm text-muted-foreground">
          Торрентов для выбранного сезона нет.
        </p>
      );
    }

    return list.map(torrent => {
      // Преобразуем размер в ГБ, если это байты (число или строка)
      let sizeLabel = '';
      if (torrent.size) {
        let sizeNum = Number(torrent.size);
        if (!isNaN(sizeNum) && sizeNum > 0) {
          sizeLabel = (sizeNum / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        } else {
          sizeLabel = torrent.size;
        }
      }
      const label = torrent.title || 'Раздача';

      return (
        <Button
          key={torrent.magnet}
          asChild
          onClick={() => handleQualitySelect(torrent)}
          variant="outline"
          className="w-full items-center text-left px-3 py-2"
        >
          <a
            href={torrent.magnet}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <span className="flex-1 truncate whitespace-nowrap overflow-hidden">{label}</span>
            {sizeLabel && (
              <span className="text-xs text-muted-foreground">{sizeLabel}</span>
            )}
          </a>
        </Button>
      );
    });
  };

  return (
    <div className="mt-4 space-y-4">
      {type === 'tv' && availableSeasons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Сезоны</h3>
          <div className="flex flex-wrap gap-2">
            {availableSeasons.map(season => (
              <Button 
                key={season} 
                onClick={() => {setSelectedSeason(season); setSelectedMagnet(null);}} 
                variant={selectedSeason === season ? 'default' : 'outline'}
              >
                Сезон {season}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedSeason && torrents && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Раздачи</h3>
          <div className="space-y-2">
            {renderTorrentButtons(torrents)}
          </div>
        </div>
      )}

      {selectedMagnet && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Magnet-ссылка</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-secondary/50 px-3 py-2 text-sm">
              {selectedMagnet}
            </div>
            <Button onClick={handleCopy} size="icon" variant="outline">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
