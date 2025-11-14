import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, StreamServer, DownloadQuality } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Monitor,
  Loader2,
  ListVideo
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Watch = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [loadingServer, setLoadingServer] = useState(false);

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episode', slug],
    queryFn: () => api.getEpisodeDetail(slug!),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const { data: animeDetail } = useQuery({
    queryKey: ['anime', episode?.anime.slug],
    queryFn: () => api.getAnimeDetail(episode!.anime.slug.replace('https:/otakudesu.best/anime/', '').replace('/', '')),
    enabled: !!episode?.anime.slug,
  });

  useEffect(() => {
    if (episode && animeDetail) {
      storage.addToHistory(
        {
          title: animeDetail.title,
          slug: animeDetail.slug,
          poster: animeDetail.poster,
          otakudesu_url: episode.anime.otakudesu_url,
        },
        episode.episode
      );
    }
  }, [episode, animeDetail]);

  useEffect(() => {
    if (episode?.stream_url) {
      setCurrentStreamUrl(episode.stream_url);
      setSelectedServer('Default'); 
    }
  }, [episode]);

  const handleServerChange = async (serverId: string, serverName: string) => {
    setLoadingServer(true);
    setSelectedServer(serverName);
    try {
      const url = await api.getServerUrl(serverId);
      setCurrentStreamUrl(url);
    } catch (error) {
      console.error('Failed to load server:', error);
    } finally {
      setLoadingServer(false);
    }
  };

  const handleDownload = (provider: string, resolution: string, url: string) => {
    if (window.confirm(`Are you sure you want to download ${episode?.episode} (${resolution}) from ${provider}?`)) {
      window.open(url, '_blank');
    }
  };
  
  const getQualityLabel = (serverGroup: StreamServer) => {
    if (serverGroup.quality) return serverGroup.quality;
    if (serverGroup.servers.length > 0) {
      const match = serverGroup.servers[0].id.match(/-(\d+p)$/);
      if (match && match[1]) return match[1];
    }
    return 'Other';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 aspect-video w-full" />
        </div>
      </div>
    );
  }

  if (!episode) {
    return <div className="flex min-h-screen items-center justify-center"><p>Episode not found</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="truncate text-2xl font-bold">{episode.episode}</h1>
          {animeDetail && (
            <Button variant="link" asChild className="p-0 h-auto">
                <Link to={`/anime/${animeDetail.slug}`}>← Back to {animeDetail.title}</Link>
            </Button>
          )}
        </div>

        {/* Video Player */}
        <div className="relative mb-4 w-full overflow-hidden rounded-xl border border-border bg-black" style={{ aspectRatio: '16/9' }}>
          {loadingServer && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          <iframe
            key={currentStreamUrl}
            src={currentStreamUrl}
            className="h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          
          {/* Player Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center gap-2">
                {/* Tombol Ganti Server/Resolusi */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" size="sm" className="gap-2"><Monitor/>Server</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                        <ScrollArea className="h-64">
                            <h3 className="px-2 py-1 font-semibold">Servers</h3>
                            {episode.stream_servers.map((group, idx) => (
                                <div key={idx}>
                                    <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{getQualityLabel(group)}</p>
                                    {group.servers.map(server => (
                                    <Button
                                        key={server.id}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => handleServerChange(server.id, server.name)}
                                    >
                                        {server.name}
                                        {selectedServer === server.name && <span className="ml-auto text-xs text-primary">●</span>}
                                    </Button>
                                    ))}
                                </div>
                            ))}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center gap-2">
                {/* Tombol Download */}
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="secondary" size="sm" className="gap-2"><Download/>Download</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2">
                        <ScrollArea className="h-64">
                            {['mp4', 'mkv'].map(format => (
                                episode.download_urls[format as 'mp4' | 'mkv'].length > 0 && (
                                <div key={format}>
                                    <h3 className="px-2 py-1.5 text-sm font-semibold uppercase">{format}</h3>
                                    {episode.download_urls[format as 'mp4' | 'mkv'].map((quality: DownloadQuality) => (
                                        <Popover key={quality.resolution}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                                    {quality.resolution} <ChevronRight/>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent side="right" className="w-48 p-1">
                                                {quality.urls.map(dl => (
                                                    <Button key={dl.provider} variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleDownload(dl.provider, quality.resolution, dl.url)}>
                                                        {dl.provider}
                                                    </Button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>
                                )
                            ))}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
          </div>
        </div>
        
        {/* Navigasi & All Episodes */}
        <div className="flex gap-2">
          {episode.has_previous_episode && episode.previous_episode && (
            <Button variant="outline" onClick={() => navigate(`/watch/${episode.previous_episode!.slug}`)} className="gap-2">
              <ChevronLeft /> Previous
            </Button>
          )}
          {episode.has_next_episode && episode.next_episode && (
            <Button onClick={() => navigate(`/watch/${episode.next_episode!.slug}`)} className="ml-auto gap-2">
              Next <ChevronRight />
            </Button>
          )}
          {animeDetail && (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2"><ListVideo/> All Episodes</Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader><SheetTitle>All Episodes</SheetTitle></SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)] pr-4">
                        <div className="grid grid-cols-2 gap-2 py-4">
                            {animeDetail.episode_lists.map((ep) => (
                                <Button key={ep.slug} variant={ep.slug === slug ? 'default' : 'outline'} asChild size="sm">
                                    <Link to={`/watch/${ep.slug}`}>Episode {ep.episode_number}</Link>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;