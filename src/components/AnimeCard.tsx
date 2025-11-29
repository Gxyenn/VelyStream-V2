import { Link } from 'react-router-dom';
import { Star, Calendar, Play } from 'lucide-react';
import { Anime } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  episodeSlug?: string;
  size?: 'small' | 'normal';
}

export const AnimeCard = ({ anime, className, episodeSlug, size = 'normal' }: AnimeCardProps) => {
  if (!anime) {
    return null;
  }

  // Defensively clean up the slug, in case the API returns a full URL
  const cleanSlug = (slug: string) => {
    try {
      // If it's a full URL, take the last part
      if (slug.startsWith('http')) {
        const url = new URL(slug);
        // Split pathname and filter out empty strings from trailing slashes
        const pathParts = url.pathname.split('/').filter(Boolean);
        return pathParts[pathParts.length - 1];
      }
      // Otherwise, assume it's a clean slug
      return slug;
    } catch (error) {
      console.error("Invalid slug format:", slug);
      return slug; // fallback to original slug
    }
  };

  const finalSlug = cleanSlug(anime.slug);
  const destination = episodeSlug ? `/watch/${episodeSlug}` : `/anime/${finalSlug}`;
  
  const displayEpisode = anime.current_episode?.startsWith("Total ") 
    ? anime.current_episode.replace("Episode ") + " Terbaru" 
    : (anime.current_episode || (anime.episode_count ? `${anime.episode_count}` : null));


  return (
    <Link
      to={destination}
      data-aos="zoom-in-down"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-gradient-card transition-all hover:scale-105 hover:shadow-glow-primary',
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
            <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {anime.rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{anime.rating}</span>
          </div>
        )}

        {displayEpisode && (
          <div className="absolute left-2 top-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {displayEpisode}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2">
        <h3 className={cn(
          "mb-2 line-clamp-2 flex-grow font-semibold leading-tight",
          size === 'small' ? 'text-xs line-clamp-1' : 'text-sm'
        )}>
          {anime.title}
        </h3>
        
        {size === 'normal' && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {anime.release_day && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{anime.release_day}</span>
                </div>
              )}
              {anime.newest_release_date && (
                <span>• {anime.newest_release_date}</span>
              )}
              {anime.last_release_date && (
                <span>• {anime.last_release_date}</span>
              )}
            </div>

            {anime.genres?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {anime.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre.slug}
                    className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
};