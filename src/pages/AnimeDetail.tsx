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
  }, [slug, anime]);

  const handleToggleList = () => {
    if (!anime) return;
    
    // Kita buat objek anime yang lebih sederhana untuk disimpan
    const animeToStore = {
      title: anime.title,
      slug: anime.slug,
      poster: anime.poster,
      rating: anime.rating,
      otakudesu_url: anime.recommendations[0]?.otakudesu_url || ''
    };

    if (isInList) {
      storage.removeFromMyList(anime.slug);
    } else {
      storage.addToMyList(animeToStore);
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
            <div className="mx-auto w-full max-w-sm">
              <img src={anime.poster} alt={anime.title} className="w-full rounded-xl border border-border shadow-2xl" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="mb-2 text-4xl font-bold">{anime.title}</h1>
              {anime.japanese_title && <p className="mb-4 text-lg text-muted-foreground">{anime.japanese_title}</p>}
              <div className="mb-6 flex flex-wrap gap-4">{/* ... Stats ... */}</div>
              <div className="mb-6 flex flex-wrap gap-2">{anime.genres.map(g => <Badge key={g.slug}>{g.name}</Badge>)}</div>
              <div className="mb-6 space-y-2 text-sm">{/* ... Meta ... */}</div>

              {/* --- PERUBAHAN UI ACTIONS --- */}
              <div className="flex flex-wrap gap-4">
                {anime.episode_lists.length > 0 && (
                  <Button asChild size="lg" className="gap-2">
                    <Link to={`/watch/${anime.episode_lists[0].slug}`}>
                      <Play className="h-5 w-5" fill="currentColor" />
                      Watch Episode 1
                    </Link>
                  </Button>
                )}
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary" size="lg" className="gap-2">
                      <ListVideo className="h-5 w-5" />
                      Show Episodes
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-3/4">
                    <SheetHeader>
                      <SheetTitle>Episodes: {anime.title}</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-full pr-4">
                      <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {anime.episode_lists.map((episode) => (
                          <Button asChild key={episode.slug} variant="outline">
                            <Link to={`/watch/${episode.slug}`}>
                              Episode {episode.episode_number}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                <Button variant="outline" size="lg" onClick={handleToggleList} className="gap-2">
                  {isInList ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                  {isInList ? 'In My List' : 'Add to List'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">{/* ... Synopsis & Recommendations ... */}</div>
    </div>
  );
};

export default AnimeDetail;