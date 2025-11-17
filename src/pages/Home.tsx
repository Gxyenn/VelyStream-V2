// Lokasi File: src/pages/Home.tsx

import { useInfiniteQuery } from '@tanstack/react-query';
import { api, Anime } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, TrendingUp, Star, Calendar, Play } from 'lucide-react';
import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

//================================================================
// BAGIAN 1: KOMPONEN UNTUK MENAMPILKAN SATU KARTU ANIME
// Disesuaikan agar ukurannya kecil/sedang dan judulnya rapi.
//================================================================
interface AnimeCardProps {
  anime: Anime;
}

const SmallAnimeCard = ({ anime }: AnimeCardProps) => {
  if (!anime) {
    return null;
  }

  return (
    <Link
      to={`/anime/${anime.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-lg"
    >
      {/* Poster Anime */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={anime.poster || `https://via.placeholder.com/200x300/020817/FFFFFF?text=No+Image`}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-8 w-8 text-white" fill="currentColor" />
        </div>
      </div>
      
      {/* Judul Anime */}
      <div className="flex-1 p-2">
        <h3 className="line-clamp-2 text-xs font-semibold leading-tight" title={anime.title}>
          {anime.title}
        </h3>
      </div>
    </Link>
  );
};


//================================================================
// BAGIAN 2: KOMPONEN UNTUK DAFTAR ANIME HORIZONTAL DENGAN INFINITE SCROLL
//================================================================
interface AnimeListHorizontalProps {
  animes: Anime[];
  onEndReached: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

const AnimeListHorizontal = ({ animes, onEndReached, hasMore, isFetchingMore }: AnimeListHorizontalProps) => {
  const observer = useRef<IntersectionObserver>();
  
  // Ini adalah "pengamat" yang akan dipasang di item terakhir.
  // Saat item terakhir terlihat di layar, ia akan memanggil onEndReached.
  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onEndReached(); // Panggil fungsi untuk memuat halaman selanjutnya
      }
    });

    if (node) observer.current.observe(node);
  }, [isFetchingMore, hasMore, onEndReached]);

  return (
    <div className="relative">
      {/* Container yang bisa di-scroll ke samping */}
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
        {animes.map((anime, index) => (
          <div 
            // Pasang "pengamat" hanya pada item terakhir di daftar
            ref={animes.length === index + 1 ? lastAnimeElementRef : null} 
            key={`${anime.slug}-${index}`}
            // Ini yang mengatur ukuran poster: kecil (w-36) dan sedang di layar lebih besar (md:w-48)
            className="w-36 flex-shrink-0 md:w-48"
          >
            <SmallAnimeCard anime={anime} />
          </div>
        ))}

        {/* Tampilkan kerangka loading saat data baru sedang diambil */}
        {isFetchingMore && (
          [...Array(5)].map((_, i) => (
            <div key={`skeleton-${i}`} className="w-36 flex-shrink-0 md:w-48">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-3 w-1/2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};


//================================================================
// BAGIAN 3: KOMPONEN UTAMA HALAMAN HOME
//================================================================
const Home = () => {
  // Mengambil data ONGOING dengan infinite query
  const {
    data: ongoingData,
    isLoading: isLoadingOngoing,
    hasNextPage: hasNextOngoingPage,
    fetchNextPage: fetchNextOngoingPage,
    isFetchingNextPage: isFetchingNextOngoingPage,
  } = useInfiniteQuery({
    queryKey: ['ongoing_all_paginated'],
    queryFn: ({ pageParam = 1 }) => api.getOngoingAnime(pageParam),
    // Fungsi ini memberitahu React Query cara mendapatkan nomor halaman berikutnya
    getNextPageParam: (lastPage) =>
      lastPage?.paginationData?.has_next_page ? lastPage.paginationData.next_page : undefined,
    initialPageParam: 1,
  });

  // Mengambil data COMPLETE dengan infinite query
  const {
    data: completeData,
    isLoading: isLoadingComplete,
    hasNextPage: hasNextCompletePage,
    fetchNextPage: fetchNextCompletePage,
    isFetchingNextPage: isFetchingNextCompletePage,
  } = useInfiniteQuery({
    queryKey: ['complete_all_paginated'],
    queryFn: ({ pageParam = 1 }) => api.getCompleteAnime(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.paginationData?.has_next_page ? lastPage.paginationData.next_page : undefined,
    initialPageParam: 1,
  });

  // Gabungkan semua halaman data yang sudah diambil menjadi satu array
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
        {/* Tampilkan skeleton besar HANYA saat loading awal */}
        {(isLoadingOngoing && !allOngoingAnimes.length) ? (
          <div className="mb-12">
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="flex space-x-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 w-36 flex-shrink-0 md:w-48" />)}
            </div>
          </div>
        ) : (
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
        )}

        {(isLoadingComplete && !allCompleteAnimes.length) ? (
          <div className="mb-12">
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="flex space-x-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 w-36 flex-shrink-0 md:w-48" />)}
            </div>
          </div>
        ) : (
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