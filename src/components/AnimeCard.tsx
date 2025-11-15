import { Link } from 'react-router-dom';
import { Star, Calendar, Play } from 'lucide-react';
import { Anime } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
}

export const AnimeCard = ({ anime, className }: AnimeCardProps) => {
  // Jika karena suatu alasan data anime tidak ada, jangan render apapun untuk mencegah error.
  if (!anime) {
    return null;
  }

  return (
    <Link
      to={`/anime/${anime.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-gradient-card transition-all hover:scale-105 hover:shadow-glow-purple',
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          // Gunakan placeholder jika poster tidak ada
          src={anime.poster || `https://via.placeholder.com/400x600/020817/FFFFFF?text=No+Image`}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
            <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {/* Rating Badge (aman jika rating tidak ada) */}
        {anime.rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{anime.rating}</span>
          </div>
        )}

        {/* Episode/Status Badge (aman jika tidak ada) */}
        {(anime.current_episode || anime.episode_count) && (
          <div className="absolute left-2 top-2 rounded-lg bg-primary/90 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
            {anime.current_episode || `${anime.episode_count} Eps`}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2">
        <h3 className="mb-1 line-clamp-2 flex-grow text-xs font-semibold leading-tight">
          {anime.title}
        </h3>
        
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {/* Release Info (aman jika tidak ada) */}
          {anime.release_day && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{anime.release_day}</span>
            </div>
          )}
          {anime.newest_release_date && (
            <span className="hidden sm:inline">• {anime.newest_release_date}</span>
          )}
          {anime.last_release_date && (
            <span className="hidden sm:inline">• {anime.last_release_date}</span>
          )}
        </div>
      </div>
    </Link>
  );
};