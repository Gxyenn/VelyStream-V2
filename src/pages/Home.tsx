import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { AnimeListHorizontal } from '@/components/AnimeListHorizontal';

const Home = () => {
  const { data: ongoingData, isLoading: isLoadingOngoing } = useQuery({
    queryKey: ['ongoing_all'],
    queryFn: () => api.getOngoingAnime(1) // Fetch first page, assuming it returns enough data
  });

  const { data: completeData, isLoading: isLoadingComplete } = useQuery({
    queryKey: ['complete_all'],
    queryFn: () => api.getCompleteAnime(1) // Fetch first page
  });

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
        {/* Ongoing Anime Section */}
        {isLoading ? (
          <div className="mb-12">
            <Skeleton className="mb-6 h-8 w-48" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            {/* Terbaru Section (Previously Ongoing Tab) */}
            <section className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Terbaru</h2>
              </div>
              {ongoingData?.ongoingAnimeData && (
                <AnimeListHorizontal animes={ongoingData.ongoingAnimeData} />
              )}
            </section>

            {/* Tamat Section (Previously Complete Tab) */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Tamat</h2>
              </div>
              {completeData?.completeAnimeData && (
                <AnimeListHorizontal animes={completeData.completeAnimeData} />
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
