import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AllAnime = () => {
  const [activeTab, setActiveTab] = useState<string>('#');
  
  const { data, isLoading } = useQuery({
    queryKey: ['all-anime'],
    queryFn: api.getAllAnime
  });

  const alphabets = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">All Anime</h1>
          <p className="text-muted-foreground">Browse all available anime</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1">
              {alphabets.map((letter) => {
                const hasAnime = data?.list?.some((group) => group.startWith === letter);
                return (
                  <TabsTrigger 
                    key={letter} 
                    value={letter}
                    disabled={!hasAnime}
                    className="min-w-[40px]"
                  >
                    {letter}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {alphabets.map((letter) => {
              const group = data?.list?.find((g) => g.startWith === letter);
              return (
                <TabsContent key={letter} value={letter}>
                  {group?.animeList && group.animeList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {group.animeList.map((anime) => (
                        <Link
                          key={anime.animeId}
                          to={`/anime/${anime.animeId}`}
                          className="block rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                        >
                          {anime.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground">No anime found starting with "{letter}"</p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AllAnime;