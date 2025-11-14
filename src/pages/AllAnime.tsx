import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const AllAnime = () => {
  const [activeTab, setActiveTab] = useState<string>('#');
  
  const { data, isLoading } = useQuery({
    queryKey: ['all-anime'],
    queryFn: api.getAllAnime
  });

  const alphabets = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">All Anime</h1>
          <p className="text-muted-foreground">Browse all available anime</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(24)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
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
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {group.animeList.map((anime) => (
                        <AnimeCard 
                          key={anime.animeId} 
                          anime={{
                            title: anime.title,
                            slug: anime.animeId,
                            poster: 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(anime.title),
                            otakudesu_url: anime.otakudesuUrl
                          }} 
                        />
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

        {/* Credit */}
        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Created by <span className="font-semibold text-primary">Gxyenn 正式</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllAnime;
