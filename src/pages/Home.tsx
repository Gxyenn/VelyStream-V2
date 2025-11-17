import { useInfiniteQuery } from '@tanstack/react-query';
import { api, Anime } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, TrendingUp, Star, Calendar, Play } from 'lucide-react';
import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  episodeSlug?: string;
}

const AnimeCard = ({ anime, className, episodeSlug }: AnimeCardProps) => {
  if (!anime) {
    return null;
  }
  const destination = episodeSlug ? `/watch/${episodeSlug}` : `/anime/${anime.slug}`;

  return (
    <Link
      to={destination}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-gradient-card transition-all hover:scale-105 hover:shadow-glow-primary',
        className
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={anime.poster || `https://via.placeholder.com/400x600/020817/FFFFFF?text=No+Image`}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm">
            <Play className="h-6 w-6 text-primary-foreground" fill="currentColor" />
          </div>
        </div>
        {anime.rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{anime.rating}</span>
          </div>
        )}
        {(anime.current_episode || anime.episode_count) && (
          <div className="absolute left-2 top-2 rounded-lg bg-primary/90 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {anime.current_episode || `${anime.episode_count} Eps`}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2">
        <h3 className="mb-1 line-clamp-2 flex-grow text-sm font-semibold leading-tight">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {anime.release_day && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{anime.release_day}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

interface AnimeListHorizontalProps {
  animes: Anime[];
  onEndReached: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

const AnimeListHorizontal = ({ animes, onEndReached, hasMore, isFetchingMore }: AnimeListHorizontalProps) => {
  const observer = useRef<IntersectionObserver>();
  
  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onEndReached();
      }
    });

    if (node) observer.current.observe(node);
  }, [isFetchingMore, hasMore, onEndReached]);

  return (
    <div className="relative">
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
        {animes.map((anime, index) => (
          <div 
            ref={animes.length === index + 1 ? lastAnimeElementRef : null} 
            key={`${anime.slug}-${index}`}
            className="w-36 flex-shrink-0 md:w-48"
          >
            <AnimeCard anime={anime} />
          </div>
        ))}

        {isFetchingMore && (
          [...Array(5)].map((_, i) => (
            <div key={`skeleton-${i}`} className="w-36 flex-shrink-0 md:w-48">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-1 h-3 w-1/2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const {
    data: ongoingData,
    isLoading: isLoadingOngoing,
    hasNextPage: hasNextOngoingPage,
    fetchNextPage: fetchNextOngoingPage,
    isFetchingNextPage: isFetchingNextOngoingPage,
  } = useInfiniteQuery({
    queryKey: ['ongoing_all'],
    queryFn: ({ pageParam = 1 }) => api.getOngoingAnime(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.paginationData.has_next_page ? lastPage.paginationData.next_page : undefined,
    initialPageParam: 1, // Tambahkan ini
  });

  const {
    data: completeData,
    isLoading: isLoadingComplete,
    hasNextPage: hasNextCompletePage,
    fetchNextPage: fetchNextCompletePage,
    isFetchingNextPage: isFetchingNextCompletePage,
  } = useInfiniteQuery({
    queryKey: ['complete_all'],
    queryFn: ({ pageParam = 1 }) => api.getCompleteAnime(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.paginationData.has_next_page ? lastPage.paginationData.next_page : undefined,
    initialPageParam: 1, // Tambahkan ini
  });

  const isLoading = isLoadingOngoing || isLoadingComplete;

  const allOngoingAnimes = ongoingData?.pages.flatMap(page => page.ongoingAnimeData || []) || [];
  const allCompleteAnimes = completeData?.pages.flatMap(page => page.completeAnimeData || []) || [];

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
        {/* Loading Skeleton Awal */}
        {isLoading && !allOngoingAnimes.length && !allCompleteAnimes.length ? (
          <>
            <div className="mb-12">
              <Skeleton className="mb-6 h-8 w-48" />
              <div className="flex space-x-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-56 w-36 md:w-48" />)}
              </div>
            </div>
            <div>
              <Skeleton className="mb-6 h-8 w-48" />
              <div className="flex space-x-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-56 w-36 md:w-48" />)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Terbaru Section */}
            <section className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Terbaru</h2>
              </div>
              <AnimeListHorizontal
                animes={allOngoingAnimes}
                onEndReached={fetchNextOngoingPage}
                hasMore={hasNextOngoingPage}
                isFetchingMore={isFetchingNextOngoingPage}
              />
            </section>

            {/* Tamat Section */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Tamat</h2>
              </div>
              <AnimeListHorizontal
                animes={allCompleteAnimes}
                onEndReached={fetchNextCompletePage}
                hasMore={hasNextCompletePage}
                isFetchingMore={isFetchingNextCompletePage}
              />
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