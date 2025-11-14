import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/Pagination';

const Home = () => {
  const [ongoingPage, setOngoingPage] = useState(1);
  const [completePage, setCompletePage] = useState(1);

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome
  });

  const { data: ongoingData, isLoading: isLoadingOngoing } = useQuery({
    queryKey: ['ongoing', ongoingPage],
    queryFn: () => api.getOngoingAnime(ongoingPage),
    keepPreviousData: true,
  });

  const { data: completeData, isLoading: isLoadingComplete } = useQuery({
    queryKey: ['complete', completePage],
    queryFn: () => api.getCompleteAnime(completePage),
    keepPreviousData: true,
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {[...Array(14)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {homeData?.ongoing_anime && (
              <section className="mb-12">
                <div className="mb-6 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Currently Airing</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                  {homeData.ongoing_anime.map((anime) => (
                    <AnimeCard key={anime.slug} anime={anime} />
                  ))}
                </div>
              </section>
            )}

            {/* Complete & Ongoing Tabs */}
            <section>
              <Tabs defaultValue="ongoing" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="ongoing" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Ongoing
                  </TabsTrigger>
                  <TabsTrigger value="complete" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ongoing">
                  {isLoadingOngoing ? (
                     <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                       {[...Array(14)].map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
                     </div>
                  ) : ongoingData?.ongoingAnimeData && (
                    <>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                        {ongoingData.ongoingAnimeData.map((anime) => (
                          <AnimeCard key={anime.slug} anime={anime} />
                        ))}
                      </div>
                      
                      {ongoingData.paginationData && ongoingData.paginationData.last_visible_page > 1 && (
                        <div className="mt-8">
                          <Pagination
                            currentPage={ongoingData.paginationData.current_page}
                            totalPages={ongoingData.paginationData.last_visible_page}
                            onPageChange={setOngoingPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="complete">
                  {isLoadingComplete ? (
                     <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                       {[...Array(14)].map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
                     </div>
                  ) : completeData?.completeAnimeData && (
                    <>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                        {completeData.completeAnimeData.map((anime) => (
                          <AnimeCard key={anime.slug} anime={anime} />
                        ))}
                      </div>
                      
                      {completeData.paginationData && completeData.paginationData.last_visible_page > 1 && (
                        <div className="mt-8">
                           <Pagination
                            currentPage={completeData.paginationData.current_page}
                            totalPages={completeData.paginationData.last_visible_page}
                            onPageChange={setCompletePage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
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