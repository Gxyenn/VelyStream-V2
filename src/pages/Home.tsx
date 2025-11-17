// Lokasi File: src/pages/Home.tsx

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api, Anime } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, TrendingUp, Play, ArrowRight, Loader2 } from 'lucide-react';
import React, { useRef, useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

//================================================================
// BAGIAN 1: KOMPONEN KARTU ANIME KECIL (UNTUK SEMUA DAFTAR)
//================================================================
const SmallAnimeCard = ({ anime }: { anime: Anime }) => {
  if (!anime) return null;
  return (
    <Link to={`/anime/${anime.slug}`} className="group relative block h-full overflow-hidden rounded-lg border bg-card shadow-sm transition-transform duration-200 hover:scale-105">
      <div className="relative aspect-[2/3] w-full">
        <img src={anime.poster} alt={anime.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <h3 className="line-clamp-2 text-xs font-semibold text-white" title={anime.title}>
          {anime.title}
        </h3>
      </div>
    </Link>
  );
};

//================================================================
// BAGIAN 2: KOMPONEN BARU UNTUK "TERBARU" (4 BARIS, SCROLL HORIZONTAL)
//================================================================
const AnimeListMultiRow = ({ animes, animesPerRow = 8 }: { animes: Anime[], animesPerRow?: number }) => {
  const rows = useMemo(() => {
    const numRows = 4;
    const result: Anime[][] = [];
    for (let i = 0; i < numRows; i++) {
      result.push(animes.slice(i * animesPerRow, (i + 1) * animesPerRow));
    }
    return result.filter(row => row.length > 0); // Hanya tampilkan baris yang ada isinya
  }, [animes, animesPerRow]);

  return (
    <div className="flex flex-col space-y-4">
      {rows.map((rowAnimes, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
          {rowAnimes.map((anime, animeIndex) => (
            <div key={`${anime.slug}-${animeIndex}`} className="w-36 flex-shrink-0 md:w-40">
              <SmallAnimeCard anime={anime} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};


//================================================================
// BAGIAN 3: KOMPONEN UNTUK "TAMAT" (1 BARIS, SCROLL TERBATAS)
//================================================================
const AnimeListHorizontalLimited = ({ animes, onEndReached, hasMore, isFetchingMore }: { animes: Anime[], onEndReached: () => void, hasMore?: boolean, isFetchingMore?: boolean }) => {
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
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
            {animes.map((anime, index) => (
                <div ref={animes.length === index + 1 ? lastAnimeElementRef : null} key={`${anime.slug}-${index}`} className="w-36 flex-shrink-0 md:w-40">
                    <SmallAnimeCard anime={anime} />
                </div>
            ))}
            {isFetchingMore && [...Array(5)].map((_, i) => <Skeleton key={i} className="h-56 w-36 flex-shrink-0 md:w-40" />)}
        </div>
    );
};


//================================================================
// BAGIAN 4: KOMPONEN BARU UNTUK SHEET "SHOW ALL" ANIME TAMAT
//================================================================
const AllCompleteAnimeSheet = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['complete_all_sheet'],
        queryFn: ({ pageParam = 1 }) => api.getCompleteAnime(pageParam),
        getNextPageParam: (lastPage) => lastPage?.paginationData?.has_next_page ? lastPage.paginationData.next_page : undefined,
        initialPageParam: 1,
    });

    const allAnimes = data?.pages.flatMap(page => page.completeAnimeData || []) || [];
    
    // Observer untuk trigger infinite scroll vertikal di dalam sheet
    const observer = useRef<IntersectionObserver>();
    const lastElementRef = useCallback(node => {
        if (isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[85%]">
                <SheetHeader>
                    <SheetTitle>Semua Anime Tamat</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-4rem)] pr-4">
                    {isLoading ? (
                         <div className="grid grid-cols-3 gap-4 py-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                            {[...Array(21)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 py-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                            {allAnimes.map((anime, index) => (
                                <div ref={allAnimes.length === index + 1 ? lastElementRef : null} key={`${anime.slug}-${index}`}>
                                    <SmallAnimeCard anime={anime} />
                                </div>
                            ))}
                        </div>
                    )}
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};


//================================================================
// BAGIAN 5: KOMPONEN UTAMA HALAMAN HOME (YANG DIRAKIT)
//================================================================
const Home = () => {
  const [isSheetOpen, setSheetOpen] = useState(false);

  // Fetch data untuk "Terbaru" (cukup 2 halaman untuk mengisi 4 baris)
  const { data: ongoingData, isLoading: isLoadingOngoing } = useQuery({
    queryKey: ['ongoing_multi_row'],
    queryFn: async () => {
      const [page1, page2] = await Promise.all([
        api.getOngoingAnime(1),
        api.getOngoingAnime(2)
      ]);
      return [...(page1.ongoingAnimeData || []), ...(page2.ongoingAnimeData || [])];
    },
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });

  // Fetch data untuk "Tamat" (terbatas 3 halaman)
  const { data: completeData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isLoadingComplete } = useInfiniteQuery({
    queryKey: ['complete_horizontal_limited'],
    queryFn: ({ pageParam = 1 }) => api.getCompleteAnime(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // HENTIKAN jika sudah mencapai 3 halaman
      if (allPages.length >= 3) return undefined;
      return lastPage?.paginationData?.has_next_page ? lastPage.paginationData.next_page : undefined;
    },
    initialPageParam: 1,
  });

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
        {/* BAGIAN TERBARU */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Terbaru</h2>
          </div>
          {isLoadingOngoing ? (
             <div className="flex flex-col space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                        {[...Array(7)].map((_, j) => <Skeleton key={j} className="h-48 w-36 flex-shrink-0 md:w-40" />)}
                    </div>
                ))}
             </div>
          ) : (
            ongoingData && <AnimeListMultiRow animes={ongoingData} />
          )}
        </section>

        {/* BAGIAN TAMAT */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Tamat</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSheetOpen(true)}>
              Show All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {isLoadingComplete && !allCompleteAnimes.length ? (
            <div className="flex space-x-4">
                {[...Array(7)].map((_, j) => <Skeleton key={j} className="h-56 w-36 flex-shrink-0 md:w-40" />)}
            </div>
          ) : (
            <AnimeListHorizontalLimited
              animes={allCompleteAnimes}
              onEndReached={fetchNextPage}
              hasMore={hasNextPage}
              isFetchingMore={isFetchingNextPage}
            />
          )}
        </section>

        {/* Credit */}
        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Created by <span className="font-semibold text-primary">Gxyenn 正式</span>
          </p>
        </div>
      </div>
      
      {/* Sheet untuk "Show All" akan dirender di sini */}
      <AllCompleteAnimeSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
};

export default Home;