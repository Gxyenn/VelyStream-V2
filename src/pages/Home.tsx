import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { AnimeListHorizontal } from '@/components/AnimeListHorizontal';
import { AnimeCard } from '@/components/AnimeCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import React from 'react';

const Home = () => {
  const { 
    data: ongoingData, 
    isLoading: isLoadingOngoing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['ongoing_infinite'],
    queryFn: ({ pageParam = 1 }) => api.getOngoingAnime(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.paginationData.next_page,
  });

  const { data: completeData, isLoading: isLoadingComplete } = useQuery({
    queryKey: ['complete_home'],
    queryFn: () => api.getCompleteAnime(1),
  });

  const ongoingAnimes = React.useMemo(() => 
    ongoingData?.pages.flatMap(page => page.ongoingAnimeData || []) ?? [], 
  [ongoingData]);

  const isLoading = isLoadingOngoing || isLoadingComplete;

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
        {/* Terbaru Section (Previously Ongoing Tab) */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Terbaru</h2>
          </div>
          {isLoadingOngoing && ongoingAnimes.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {[...Array(14)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-40" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {ongoingAnimes.map((anime) => (
                  <AnimeCard key={anime.slug} anime={anime} className="w-full" />
                ))}
              </div>
              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Tamat Section (Previously Complete Tab) */}
        {isLoadingComplete ? (
            <div className="mb-12">
                <Skeleton className="mb-6 h-8 w-48" />
                <Skeleton className="h-48 w-full" />
            </div>
        ) : (
            completeData?.completeAnimeData && completeData.completeAnimeData.length > 0 && (
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold">Tamat</h2>
                        </div>
                        <Button variant="link" asChild>
                            <Link to="/completed">Show All →</Link>
                        </Button>
                    </div>
                    <AnimeListHorizontal animes={completeData.completeAnimeData} />
                </section>
            )
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