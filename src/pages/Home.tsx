import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CheckCircle } from 'lucide-react';

const Home = () => {
  // Query untuk data utama halaman home (termasuk "currently airing")
  const { data: homeData, isLoading: isLoadingHome } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome
  });

  // Query untuk mendapatkan halaman pertama dari anime yang sudah tamat
  const { data: completeData, isLoading: isLoadingComplete } = useQuery({
    queryKey: ['complete-home'],
    queryFn: () => api.getCompleteAnime(1)
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
        {/* Currently Airing Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Currently Airing</h2>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {[...Array(14)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {homeData?.ongoing_anime?.map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          )}
        </section>

        {/* Completed Anime Section */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Completed Anime</h2>
          </div>
          {isLoadingComplete ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {[...Array(14)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {completeData?.completeAnimeData?.map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          )}
        </section>

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