import { useQuery } from '@tanstack/react-query';
import { api, AllAnimeItem } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const AllAnime = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['all-anime'],
    queryFn: api.getAllAnime
  });

  const [searchTerm, setSearchTerm] = useState('');

  const allAnime = useMemo(() => {
    if (!data?.list) return [];
    return data.list.flatMap(group => group.animeList);
  }, [data]);

  const filteredAnime = useMemo(() => {
    if (!searchTerm) return allAnime;
    return allAnime.filter(anime =>
      anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allAnime]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">All Anime</h1>
          <p className="text-muted-foreground">Browse all available anime ({allAnime.length} entries)</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in all anime..."
            className="w-full rounded-lg bg-secondary pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(30)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredAnime.map((anime) => (
              <Link
                key={anime.animeId}
                to={`/anime/${anime.animeId}`}
                className="block truncate rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                title={anime.title}
              >
                {anime.title}
              </Link>
            ))}
          </div>
        )}
        
        {filteredAnime.length === 0 && !isLoading && (
            <div className="py-20 text-center">
                <p className="text-muted-foreground">No anime found for "{searchTerm}"</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default AllAnime;