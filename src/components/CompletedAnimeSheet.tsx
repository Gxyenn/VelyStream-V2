import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/Pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle } from 'lucide-react';

interface CompletedAnimeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompletedAnimeSheet = ({ open, onOpenChange }: CompletedAnimeSheetProps) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['complete_anime_sheet', page],
    queryFn: () => api.getCompleteAnime(page),
    keepPreviousData: true,
  });

  const animes = data?.completeAnimeData || [];
  const pagination = data?.paginationData;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="flex items-center gap-3 text-2xl">
            <CheckCircle className="h-7 w-7 text-primary" />
            All Completed Anime
          </SheetTitle>
          <SheetDescription>
            Browse the entire collection of completed anime series.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4">
            {isLoading && page === 1 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 py-4">
                {[...Array(24)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3]" />
                ))}
              </div>
            ) : isError ? (
              <div className="py-20 text-center text-destructive">
                <p>Failed to load anime. Please try again later.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 py-4">
                  {animes.map((anime) => (
                    <AnimeCard key={anime.slug} anime={anime} className="w-full" />
                  ))}
                  {isFetching && <div className="col-span-full text-center py-4">Loading more...</div>}
                </div>
              </>
            )}
          </ScrollArea>
        </div>
        {pagination && pagination.last_visible_page > 1 && (
          <div className="px-4 py-2 border-t">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_visible_page}
              onPageChange={handlePageChange}
              hasNextPage={pagination.has_next_page}
              hasPreviousPage={pagination.has_previous_page}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};