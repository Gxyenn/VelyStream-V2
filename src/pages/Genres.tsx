import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';

const Genres = () => {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: api.getGenres
  });

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Browse by Genre</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(20)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {genres?.map((genre) => (
              <Link
                key={genre.slug}
                to={`/genre/${genre.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-gradient-card p-6 text-center transition-all hover:scale-105 hover:border-primary hover:shadow-glow-purple"
              >
                <h3 className="font-semibold group-hover:text-primary">
                  {genre.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Genres;
