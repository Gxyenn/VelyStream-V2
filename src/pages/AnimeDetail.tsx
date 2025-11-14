import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimeCard } from '@/components/AnimeCard';
import { Star, Calendar, Clock, Film, Bookmark, BookmarkCheck, Play, Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

const BatchDownloadDialog = ({ batch, animeTitle }: { batch: any, animeTitle: string }) => {
  const { data: batchDetail, isLoading } = useQuery({
    queryKey: ['batch', batch.slug],
    queryFn: () => api.getBatchDetail(batch.slug),
    enabled: !!batch.slug,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          Download Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download Batch: {animeTitle}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? <p>Loading download links...</p> : (
            <div className="space-y-4 pr-4">
              {batchDetail?.downloadUrl.formats.map((format, formatIdx) => (
                <div key={formatIdx}>
                  <h3 className="font-semibold mb-2">{format.title}</h3>
                  <div className="space-y-2">
                    {format.qualities.map((quality, qualityIdx) => (
                      <div key={qualityIdx} className="p-3 rounded-md bg-secondary">
                        <p className="font-medium">{quality.title} ({quality.size})</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {quality.urls.map((link, linkIdx) => (
                            <Button key={linkIdx} size="sm" variant="ghost" asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.title}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

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
    
    // Ensure the anime object for storage has all necessary properties
    const animeDataForStorage = {
      title: anime.title,
      slug: anime.slug,
      poster: anime.poster,
      rating: anime.rating,
      otakudesu_url: anime.otakudesu_url || anime.episode_lists?.[0]?.otakudesu_url || '',
    };
    
    if (isInList) {
      storage.removeFromMyList(anime.slug);
    } else {
      storage.addToMyList(animeDataForStorage);
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
          <img
            src={anime.poster}
            alt=""
            className="h-full w-full object-cover opacity-20 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-[300px_1fr]">
            {/* Poster */}
            <div className="mx-auto w-full max-w-sm">
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full rounded-xl border border-border shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h1 className="mb-2 text-4xl font-bold">{anime.title}</h1>
              {anime.japanese_title && (
                <p className="mb-4 text-lg text-muted-foreground">{anime.japanese_title}</p>
              )}

              {/* Stats */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{anime.rating || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  <span>{anime.episode_count || 'N/A'} Episodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{anime.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{anime.release_date}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="mb-6 flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <Badge key={genre.slug} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Meta */}
              <div className="mb-6 space-y-2 text-sm">
                <p><span className="font-semibold">Type:</span> {anime.type}</p>
                <p><span className="font-semibold">Status:</span> {anime.status}</p>
                <p><span className="font-semibold">Studio:</span> {anime.studio}</p>
                {anime.produser && (
                  <p><span className="font-semibold">Producer:</span> {anime.produser}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                {anime.episode_lists.length > 0 && (
                  <Button asChild size="lg" className="gap-2">
                    <Link to={`/watch/${anime.episode_lists[0].slug}`}>
                      <Play className="h-5 w-5" fill="currentColor" />
                      Watch Now
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleList}
                  className="gap-2"
                >
                  {isInList ? (
                    <>
                      <BookmarkCheck className="h-5 w-5" />
                      In My List
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5" />
                      Add to List
                    </>
                  )}
                </Button>
                {anime.batch && <BatchDownloadDialog batch={anime.batch} animeTitle={anime.title} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Synopsis */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold">Synopsis</h2>
          <p className="leading-relaxed text-muted-foreground">{anime.synopsis}</p>
        </section>

        {/* Episodes */}
        {anime.episode_lists.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Episodes</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {anime.episode_lists.map((episode) => (
                <Link
                  key={episode.slug}
                  to={`/watch/${episode.slug}`}
                  className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-glow-purple"
                >
                  <p className="font-semibold">Episode {episode.episode_number}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {anime.recommendations?.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
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