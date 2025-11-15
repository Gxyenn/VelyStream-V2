import { storage } from '@/lib/storage';
import { AnimeCard } from '@/components/AnimeCard';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HistoryItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';

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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {history.map((item) => (
              <div key={`${item.anime.slug}-${item.timestamp}`}>
                <AnimeCard anime={item.anime} />
                <div className="mt-2 rounded-lg bg-secondary p-2 text-xs">
                  <p className="text-secondary-foreground">Last watched:</p>
                  <p className="font-semibold text-primary">{item.episode}</p>
                </div>
              </div>
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
