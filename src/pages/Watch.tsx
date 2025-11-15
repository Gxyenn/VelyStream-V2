import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, StreamServer } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Download, Monitor, Loader2, ListVideo, Clapperboard, Server } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface WatchProps {
  onWatch?: () => void;
}

// Helper to parse quality from server ID
const getQualityFromServerId = (id: string): string => {
  const match = id.match(/-(\d+p)$/);
  return match ? match[1] : 'Auto';
};

const Watch = ({ onWatch }: WatchProps) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [loadingServer, setLoadingServer] = useState(false);

  const { data: episode, isLoading, isError } = useQuery({
    queryKey: ['episode', slug],
    queryFn: () => api.getEpisodeDetail(slug!),
    enabled: !!slug,
  });

  const { data: animeDetail } = useQuery({
    queryKey: ['anime', episode?.anime.slug],
    queryFn: () => api.getAnimeDetail(episode!.anime.slug.replace('https:/otakudesu.best/anime/', '').replace('/', '')),
    enabled: !!episode?.anime.slug,
  });

  // Memoize the available qualities and servers
  const qualities = useMemo(() => {
    if (!episode) return [];
    const qualityMap = new Map<string, StreamServer['servers']>();
    episode.stream_servers.forEach(group => {
      group.servers.forEach(server => {
        const quality = getQualityFromServerId(server.id);
        if (!qualityMap.has(quality)) {
          qualityMap.set(quality, []);
        }
        qualityMap.get(quality)!.push(server);
      });
    });
    // Sort qualities: 1080p, 720p, 480p, etc.
    return Array.from(qualityMap.entries()).sort((a, b) => {
        const qualityA = parseInt(a[0]);
        const qualityB = parseInt(b[0]);
        if (isNaN(qualityA)) return 1;
        if (isNaN(qualityB)) return -1;
        return qualityB - qualityA;
    });
  }, [episode]);

  const serversForSelectedQuality = useMemo(() => {
    if (!selectedQuality || qualities.length === 0) return [];
    const found = qualities.find(([quality]) => quality === selectedQuality);
    return found ? found[1] : [];
  }, [selectedQuality, qualities]);

  // Effect to set the best quality on initial load
  useEffect(() => {
    if (qualities.length > 0 && !selectedQuality) {
      const bestQuality = qualities[0][0];
      const firstServer = qualities[0][1][0];
      setSelectedQuality(bestQuality);
      handleServerChange(firstServer.id);
    }
  }, [qualities]);


  useEffect(() => {
    if (onWatch) onWatch();
  }, [slug, onWatch]);

  useEffect(() => {
    if (episode && animeDetail) {
      storage.addToHistory(
        { title: animeDetail.title, slug: animeDetail.slug, poster: animeDetail.poster, otakudesu_url: episode.anime.otakudesu_url },
        episode.episode
      );
    }
  }, [episode, animeDetail]);

  const handleServerChange = async (serverId: string) => {
    setLoadingServer(true);
    setSelectedServerId(serverId);
    try {
      const url = await api.getServerUrl(serverId);
      setCurrentStreamUrl(url);
    } catch (error) {
      console.error('Failed to load server:', error);
      // Optionally show a toast to the user
    } finally {
      setLoadingServer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 aspect-video w-full" />
        <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (isError || !episode) {
    return <div className="flex min-h-screen items-center justify-center"><p>Episode not found.</p></div>;
  }
  
  const selectedServerName = serversForSelectedQuality.find(s => s.id === selectedServerId)?.name;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="truncate text-xl font-bold">{episode.episode}</h1>
          {animeDetail && (
            <Button variant="link" asChild className="h-auto p-0 text-muted-foreground hover:text-primary">
                <Link to={`/anime/${animeDetail.slug}`}>← Back to {animeDetail.title}</Link>
            </Button>
          )}
        </div>

        <div className="relative mb-4 w-full overflow-hidden rounded-xl border bg-black" style={{ aspectRatio: '16/9' }}>
          {loadingServer && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {currentStreamUrl ? (
            <iframe
              key={currentStreamUrl}
              src={currentStreamUrl}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <p>Pilih kualitas dan server untuk memulai.</p>
            </div>
          )}
        </div>
        
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                {/* Quality Selector */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 w-32" disabled={qualities.length === 0}>
                            <Clapperboard className="h-4 w-4"/> {selectedQuality || 'Kualitas'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1">
                        {qualities.map(([quality, servers]) => (
                            <Button
                                key={quality}
                                variant={selectedQuality === quality ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => {
                                    setSelectedQuality(quality);
                                    handleServerChange(servers[0].id); // Auto-select first server of new quality
                                }}
                            >
                                {quality}
                            </Button>
                        ))}
                    </PopoverContent>
                </Popover>

                {/* Server Selector */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 w-32" disabled={!selectedQuality}>
                            <Server className="h-4 w-4"/> {selectedServerName || 'Server'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1">
                        {serversForSelectedQuality.map(server => (
                            <Button
                                key={server.id}
                                variant={selectedServerId === server.id ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleServerChange(server.id)}
                            >
                                {server.name}
                            </Button>
                        ))}
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="flex items-center gap-2">
                {animeDetail && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2"><ListVideo/> All Episodes</Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader><SheetTitle>All Episodes</SheetTitle></SheetHeader>
                            <ScrollArea className="h-[calc(100%-4rem)] pr-4">
                                <div className="grid grid-cols-2 gap-2 py-4">
                                    {animeDetail.episode_lists.map((ep) => (
                                        <Button key={ep.slug} variant={ep.slug === slug ? 'default' : 'outline'} asChild size="sm">
                                            <Link to={`/watch/${ep.slug}`}>Eps {ep.episode_number}</Link>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                )}
                {/* Download button can be added here if needed */}
            </div>
        </div>
        
        <div className="flex gap-2">
          {episode.has_previous_episode && episode.previous_episode && (
            <Button variant="secondary" onClick={() => navigate(`/watch/${episode.previous_episode!.slug}`)} className="gap-2">
              <ChevronLeft /> Previous
            </Button>
          )}
          {episode.has_next_episode && episode.next_episode && (
            <Button variant="secondary" onClick={() => navigate(`/watch/${episode.next_episode!.slug}`)} className="ml-auto gap-2">
              Next <ChevronRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;