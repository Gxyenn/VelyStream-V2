import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/Pagination';
import { useState } from 'react';

const GenreDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['genre', slug, page],
    queryFn: () => api.getAnimeByGenre(slug!, page),
    enabled: !!slug,
    keepPreviousData: true,
  });

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold capitalize">{slug?.replace(/-/g, ' ')}</h1>
          <p className="text-muted-foreground">Browse anime by genre</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {[...Array(21)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))}
          </div>
        ) : (
          <>
            {data?.anime && data.anime.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {data.anime.map((anime) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted-foreground">No anime found in this genre for this page.</p>
              </div>
            )}

            {/* Pagination */}
            {data?.paginationData && data.paginationData.last_visible_page > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={data.paginationData.current_page}
                  totalPages={data.paginationData.last_visible_page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenreDetail;