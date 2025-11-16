import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';

const GenreDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['genre', slug],
    queryFn: () => api.getAnimeByGenre(slug!, 1), // Fetch all, assuming API returns all on page 1 or handles it
    enabled: !!slug
  });

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold capitalize">{slug?.replace(/-/g, ' ')}</h1>
          <p className="text-muted-foreground">Browse anime by genre</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(18)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))}
          </div>
        ) : (
          <>
            {data?.anime && data.anime.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {data.anime.map((anime) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted-foreground">No anime found in this genre</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenreDetail;
