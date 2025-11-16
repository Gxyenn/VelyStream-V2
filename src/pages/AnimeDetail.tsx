import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimeCard } from '@/components/AnimeCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Calendar, Clock, Film, Bookmark, BookmarkCheck, Play, ListVideo } from 'lucide-react';
import { useState, useEffect } from 'react';

const AnimeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isInList, setIsInList] = useState(false);

  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime', slug],
    queryFn: () => api.getAnimeDetail(slug!),
    enabled: !!slug
  });

  useEffect(() => {
    if (slug) {
      setIsInList(storage.isInMyList(slug));
    }
  }, [slug]);

  const handleToggleList = () => {
    if (!anime) return;
    
    if (isInList) {
      storage.removeFromMyList(anime.slug);
    } else {
      const animeForList = {
        title: anime.title,
        slug: anime.slug,
        poster: anime.poster,
        rating: anime.rating,
        otakudesu_url: anime.episode_lists[0]?.otakudesu_url || '',
        episode_count: anime.episode_count,
      };
      storage.addToMyList(animeForList);
    }
    setIsInList(!isInList);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-8 h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Anime not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img src={anime.poster} alt="" className="h-full w-full object-cover opacity-20 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-[300px_1fr]">
            {/* Poster */}
            <div className="mx-auto w-full max-w-sm">
              <img src={anime.poster} alt={anime.title} className="w-full rounded-xl border border-border shadow-2xl" />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h1 className="mb-2 text-4xl font-bold">{anime.title}</h1>
              {anime.japanese_title && <p className="mb-4 text-lg text-muted-foreground">{anime.japanese_title}</p>}

              {/* Stats */}
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-white"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{anime.rating}</div>
                <div className="flex items-center gap-2"><Film className="h-4 w-4"/>{anime.episode_count} Episodes</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4"/>{anime.duration}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{anime.release_date}</div>
              </div>

              {/* Genres */}
              <div className="mb-6 flex flex-wrap gap-2">
                {anime.genres.map((genre) => <Badge key={genre.slug} variant="secondary">{genre.name}</Badge>)}
              </div>

              {/* Meta */}
              <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p><span className="font-semibold text-muted-foreground">Type:</span> {anime.type}</p>
                <p><span className="font-semibold text-muted-foreground">Status:</span> {anime.status}</p>
                <p><span className="font-semibold text-muted-foreground">Studio:</span> {anime.studio}</p>
                {anime.produser && <p><span className="font-semibold text-muted-foreground">Producer:</span> {anime.produser}</p>}
              </div>

              {/* === PERUBAHAN DIMULAI DI SINI === */}
              {/* Actions */}
              <div className="flex w-full flex-col gap-3">
                {/* Baris Atas: Tombol Watch Now & Favorite */}
                <div className="grid grid-cols-2 gap-3">
                  {anime.episode_lists.length > 0 && (
                    <Button asChild size="lg" className="gap-2">
                      <Link to={`/watch/${anime.episode_lists[0].slug}`}><Play className="h-5 w-5" fill="currentColor" />Watch Now</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={handleToggleList} className="gap-2">
                    {isInList ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    {isInList ? 'In My List' : 'Add to List'}
                  </Button>
                </div>

                {/* Baris Bawah: Tombol Show All Episodes */}
                {anime.episode_lists.length > 0 && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="secondary" size="lg" className="w-full gap-2">
                                <ListVideo className="h-5 w-5"/> Show All Episodes
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[60%]">
                            <SheetHeader>
                                <SheetTitle>Episodes: {anime.title}</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-full pr-4">
                                <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {anime.episode_lists.map((episode) => (
                                    <Button asChild key={episode.slug} variant="outline">
                                    <Link to={`/watch/${episode.slug}`}>Episode {episode.episode_number}</Link>
                                    </Button>
                                ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                )}
              </div>
              {/* === PERUBAHAN BERAKHIR DI SINI === */}

            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Synopsis */}
        <section className="mb-12">
            <div className="mb-4">
                <h2 className="text-2xl font-bold">Synopsis</h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">{anime.synopsis}</p>
        </section>

        {/* Recommendations */}
        {anime.recommendations?.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {anime.recommendations.map((rec) => (
                <AnimeCard key={rec.slug} anime={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnimeDetail;