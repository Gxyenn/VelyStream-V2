import { storage } from '@/lib/storage';
import { AnimeCard } from '@/components/AnimeCard';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HistoryItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Helper function to format time since a timestamp
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your watch history?')) {
      storage.clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Watch History</h1>
          </div>
          
          {history.length > 0 && (
            <Button variant="destructive" onClick={handleClear}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {history.map((item) => (
              <Link to={`/watch/${item.episodeSlug}`} key={`${item.anime.slug}-${item.timestamp}`} className="group">
                <AnimeCard anime={item.anime} />
                <div className="mt-2 text-sm">
                  <p className="font-bold truncate group-hover:text-primary">Eps {item.episodeNumber}: {item.episode}</p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <HistoryIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">No watch history</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recently watched anime will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
