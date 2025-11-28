import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, StreamServer } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { WatchDownloadDialog } from '@/components/WatchDownloadDialog';
import { ChevronLeft, ChevronRight, Download, Loader2, ListVideo, Clapperboard, Server, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";

interface WatchProps {
  onWatch?: () => void;
}

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
  const [isDownloadDialogOpen, setDownloadDialogOpen] = useState(false);

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

  useEffect(() => {
    setSelectedQuality(null);
    setSelectedServerId(null);
    setCurrentStreamUrl('');
  }, [slug]);

  useEffect(() => {
    if (qualities.length > 0 && !selectedQuality) {
      const bestQuality = qualities[0][0];
      const firstServer = qualities[0][1][0];
      setSelectedQuality(bestQuality);
      handleServerChange(firstServer.id);
    }
  }, [qualities, selectedQuality]);

  useEffect(() => {
    if (onWatch) onWatch();
  }, [slug, onWatch]);

  useEffect(() => {
    if (episode && animeDetail && slug) {
      storage.addToHistory(
        { title: animeDetail.title, slug: animeDetail.slug, poster: animeDetail.poster, otakudesu_url: episode.anime.otakudesu_url },
        { title: episode.episode, slug: slug }
      );
    }
  }, [episode, animeDetail, slug]);

  const handleServerChange = async (serverId: string) => {
    setLoadingServer(true);
    setSelectedServerId(serverId);
    try {
      const url = await api.getServerUrl(serverId);
      setCurrentStreamUrl(url);
    } catch (error) {
      console.error('Failed to load server:', error);
    } finally {
      setLoadingServer(false);
    }
  };

  const EpisodeListComponent = () => (
    <SheetContent side="right">
        <SheetHeader><SheetTitle>All Episodes</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] pr-4">
            <div className="grid grid-cols-2 gap-2 py-4">
                {animeDetail?.episode_lists.map((ep) => (
                    <Button key={ep.slug} variant={ep.slug === slug ? 'default' : 'outline'} asChild size="sm">
                        <Link to={`/watch/${ep.slug}`}>Eps {ep.episode_number}</Link>
                    </Button>
                ))}
            </div>
        </ScrollArea>
    </SheetContent>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 aspect-video w-full rounded-2xl" />
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
    <div className="min-h-screen flex flex-col items-center bg-background/50">
      {/* Main Content Area */}
      <div className="w-full max-w-[1600px] px-2 md:px-6">

        {/* Back Button Section */}
        <div className="w-full pt-6">
            {animeDetail && (
              <Button variant="ghost" size="sm" asChild className="h-auto p-0 text-muted-foreground hover:text-primary hover:bg-transparent gap-1 mb-1">
                  <Link to={`/anime/${animeDetail.slug.replace('https:/otakudesu.best/anime/', '').replace('/', '')}`}>
                      <ArrowLeft className="h-4 w-4" /> Back to Anime Detail
                  </Link>
              </Button>
            )}
        </div>

        {/* Video Player Section */}
        <div className="w-full mt-2 mb-4">
          <div 
              className="relative w-full overflow-hidden bg-black shadow-2xl rounded-2xl border border-white/10 touch-none select-none" 
              style={{ aspectRatio: '16/9', touchAction: 'none' }}
          >
            
            {/* --- WATERMARK (Updated) --- */}
            <div 
              className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-none select-none opacity-50 hover:opacity-80 transition-opacity duration-500"
              style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            >
              {/* Logo V */}
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-primary to-accent shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                <span className="text-sm font-bold text-primary-foreground">V</span>
              </div>
              {/* Teks VelyStream */}
              <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-tight text-white drop-shadow-md leading-none">
                      Vely<span className="text-primary">Stream</span>
                  </span>
              </div>
            </div>
            {/* --- END WATERMARK --- */}

            {loadingServer && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">Memuat server...</p>
                </div>
              </div>
            )}
            
            {currentStreamUrl ? (
              <iframe
                key={currentStreamUrl}
                src={currentStreamUrl}
                className="h-full w-full border-0 rounded-2xl"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ touchAction: 'none' }}
              />
            ) : !isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white/80 gap-2 bg-zinc-900">
                  <Server className="h-10 w-10 opacity-50 mb-2"/>
                  <p className="text-lg font-medium">Siap Memutar</p>
                  <p className="text-sm text-muted-foreground">Pilih kualitas dan server di bawah untuk memulai.</p>
              </div>
            )}
          </div>
        </div>

        {/* Header Section (Title Only) */}
        <div className="w-full mb-6">
          <h1 className="w-full text-lg md:text-xl font-bold leading-tight line-clamp-2 break-words">
            {episode.episode}
          </h1>
        </div>
      
        {/* Controls & Navigation Section */}
        <div className="w-full mb-6 flex flex-wrap items-center justify-between gap-3 bg-secondary/30 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 w-32 border-white/10 bg-black/20 hover:bg-white/10" disabled={qualities.length === 0}>
                            <Clapperboard className="h-4 w-4 text-primary"/> {selectedQuality || 'Kualitas'}
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
                                    handleServerChange(servers[0].id);
                                }}
                            >
                                {quality}
                            </Button>
                        ))}
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 w-32 border-white/10 bg-black/20 hover:bg-white/10" disabled={!selectedQuality}>
                            <Server className="h-4 w-4 text-primary"/> {selectedServerName || 'Server'}
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
                            <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-black/20 hover:bg-white/10"><ListVideo className="h-4 w-4"/> Show All</Button>
                        </SheetTrigger>
                        <EpisodeListComponent />
                    </Sheet>
                )}
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={() => setDownloadDialogOpen(true)}
                    disabled={!animeDetail?.batch}
                >
                    <Download className="h-4 w-4"/> Download
                </Button>
            </div>
        </div>
        
        <div className="w-full flex items-center justify-between mt-4 gap-2 pb-12">
          {episode.has_previous_episode && episode.previous_episode ? (
            <Button variant="secondary" onClick={() => navigate(`/watch/${episode.previous_episode!.slug}`)} className="gap-2 pl-2 hover:bg-primary/20">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
          ) : (
             <div />
          )}
          
          {episode.has_next_episode && episode.next_episode ? (
            <Button variant="default" onClick={() => navigate(`/watch/${episode.next_episode!.slug}`)} className="gap-2 pr-2 shadow-glow-primary">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
             animeDetail && (
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" className="gap-2">
                            Show All Episodes <ListVideo className="h-4 w-4"/>
                        </Button>
                    </SheetTrigger>
                    <EpisodeListComponent />
                </Sheet>
             )
          )}
        </div>
      </div>
      
      {animeDetail?.batch && (
        <WatchDownloadDialog
            isOpen={isDownloadDialogOpen}
            onClose={() => setDownloadDialogOpen(false)}
            batchSlug={animeDetail.batch.slug}
            animeTitle={animeDetail.title}
        />
      )}
    </div>
  );
};

export default Watch;