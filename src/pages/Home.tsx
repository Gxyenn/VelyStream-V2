import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Home = () => {
  const [ongoingPage, setOngoingPage] = useState(1);
  const [completePage, setCompletePage] = useState(1);

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome
  });

  const { data: ongoingData } = useQuery({
    queryKey: ['ongoing', ongoingPage],
    queryFn: () => api.getOngoingAnime(ongoingPage)
  });

  const { data: completeData } = useQuery({
    queryKey: ['complete', completePage],
    queryFn: () => api.getCompleteAnime(completePage)
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-primary pb-16 pt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to <span className="text-primary">VelyStream</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Stream your favorite anime with subtitles. Discover new series and never miss an episode.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Ongoing Anime Section */}
        {isLoading ? (
          <div className="mb-12">
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Terbaru Section (Previously Ongoing Tab) */}
            <section className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Terbaru</h2>
              </div>
              {ongoingData?.ongoingAnimeData ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {ongoingData.ongoingAnimeData.map((anime) => (
                      <AnimeCard key={anime.slug} anime={anime} />
                    ))}
                  </div>
                  
                  {ongoingData.paginationData && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOngoingPage(p => Math.max(1, p - 1))}
                        disabled={!ongoingData.paginationData.has_previous_page}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <span className="px-4 text-sm">
                        Page {ongoingData.paginationData.current_page} of {ongoingData.paginationData.last_visible_page}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOngoingPage(p => p + 1)}
                        disabled={!ongoingData.paginationData.has_next_page}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
                </div>
              )}
            </section>

            {/* Tamat Section (Previously Complete Tab) */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Tamat</h2>
              </div>
              {completeData?.completeAnimeData ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {completeData.completeAnimeData.map((anime) => (
                      <AnimeCard key={anime.slug} anime={anime} />
                    ))}
                  </div>
                  
                  {completeData.paginationData && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Page {completeData.paginationData.current_page} of {completeData.paginationData.last_visible_page}
                      </p>
                      <div className="flex w-full items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setCompletePage(p => Math.max(1, p - 1))}
                          disabled={!completeData.paginationData.has_previous_page}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-full max-w-xs overflow-x-auto whitespace-nowrap rounded-lg bg-secondary p-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: completeData.paginationData.last_visible_page }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={page === completePage ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 flex-shrink-0"
                                onClick={() => setCompletePage(page)}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setCompletePage(p => p + 1)}
                          disabled={!completeData.paginationData.has_next_page}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
                </div>
              )}
            </section>
          </>
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

export default Home;
