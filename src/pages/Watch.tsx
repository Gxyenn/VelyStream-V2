import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Monitor,
  Loader2,
  ListVideo,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

// Helper to extract resolution from server ID
const getResolutionFromServerId = (serverId: string): string => {
  const match = serverId.match(/(\d{3,4}p)$/);
  return match ? match[1] : 'SD';
};

const Watch = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [loadingServer, setLoadingServer] = useState(false);

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episode', slug],
    queryFn: () => api.getEpisodeDetail(slug!),
    enabled: !!slug
  });
  
  const animeSlug = episode?.anime.slug.replace('https:/otakudesu.best/anime/', '').replace('/', '');

  const { data: animeDetail } = useQuery({
    queryKey: ['anime', animeSlug],
    queryFn: () => api.getAnimeDetail(animeSlug!),
    enabled: !!animeSlug
  });

  // Save to history when episode loads
  useEffect(() => {
    if (episode && animeDetail) {
      storage.addToHistory(
        {
          title: animeDetail.title,
          slug: animeDetail.slug,
          poster: animeDetail.poster,
          otakudesu_url: episode.anime.otakudesu_url
        },
        episode.episode
      );
    }
  }, [episode, animeDetail]);

  // Set default stream URL
  useEffect(() => {
    if (episode?.stream_url) {
      setCurrentStreamUrl(episode.stream_url);
    }
  }, [episode?.stream_url]);

  const handleServerChange = async (serverId: string, serverName: string) => {
    setLoadingServer(true);
    setSelectedServer(serverName);
    try {
      const url = await api.getServerUrl(serverId);
      setCurrentStreamUrl(url);
    } catch (error) {
      console.error('Failed to load server:', error);
      // You can add a toast notification here to inform the user
    } finally {
      setLoadingServer(false);
    }
  };
  
  // Group servers by resolution
  const groupedServers = React.useMemo(() => {
    if (!episode?.stream_servers) return [];
    
    const groups: { [key: string]: typeof episode.stream_servers[0]['servers'] } = {};

    episode.stream_servers.forEach(group => {
        group.servers.forEach(server => {
            const resolution = getResolutionFromServerId(server.id);
            if (!groups[resolution]) {
                groups[resolution] = [];
            }
            groups[resolution].push(server);
        });
    });

    return Object.entries(groups).map(([resolution, servers]) => ({
        quality: resolution,
        servers,
    }));
  }, [episode?.stream_servers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full aspect-video mb-4" />
          <Skeleton className="h-10 w-1/4 mb-4" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Episode not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Video Player */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{episode.episode}</h1>
            {animeDetail && (
              <Link 
                to={`/anime/${animeDetail.slug}`}
                className="text-primary hover:underline"
              >
                ← Back to {animeDetail.title}
              </Link>
            )}
          </div>

          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black aspect-video">
            {loadingServer && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}
            <iframe
              key={currentStreamUrl} // Force re-render on URL change
              src={currentStreamUrl}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Episode Navigation */}
          <div className="mt-4 flex flex-wrap gap-2 justify-between">
            {episode.has_previous_episode && episode.previous_episode && (
              <Button
                variant="outline"
                onClick={() => navigate(`/watch/${episode.previous_episode!.slug}`)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            
            <div className="flex-grow" />

            {animeDetail && animeDetail.episode_lists.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ListVideo className="h-4 w-4" />
                    All Episodes
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                   <SheetHeader>
                     <SheetTitle>All Episodes</SheetTitle>
                     <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                       <X className="h-4 w-4" />
                       <span className="sr-only">Close</span>
                     </SheetClose>
                   </SheetHeader>
                   <ScrollArea className="h-[calc(50vh-4rem)] mt-4">
                     <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pr-6">
                       {animeDetail.episode_lists.map((ep) => (
                          <SheetClose asChild key={ep.slug}>
                            <Button
                              variant={ep.slug === slug ? 'default' : 'outline'}
                              asChild
                              size="sm"
                              className="w-full"
                            >
                              <Link to={`/watch/${ep.slug}`}>
                                Episode {ep.episode_number}
                              </Link>
                            </Button>
                          </SheetClose>
                       ))}
                     </div>
                   </ScrollArea>
                </SheetContent>
              </Sheet>
            )}

            {episode.has_next_episode && episode.next_episode && (
              <Button
                onClick={() => navigate(`/watch/${episode.next_episode!.slug}`)}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stream Servers */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Stream Servers</h2>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {groupedServers.map((serverGroup, idx) => (
                  <Collapsible key={idx} defaultOpen={idx === 0}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left font-semibold hover:bg-secondary/80">
                      Resolution: {serverGroup.quality}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 mt-2 grid grid-cols-2 gap-1">
                        {serverGroup.servers.map((server) => (
                          <Button
                            key={server.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleServerChange(server.id, server.name)}
                          >
                            {server.name}
                            {selectedServer === server.name && (
                              <span className="ml-auto text-xs text-primary">●</span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Download Links */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Download</h2>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {episode.download_urls.mp4.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">MP4</h3>
                    {episode.download_urls.mp4.map((quality) => (
                      <Collapsible key={quality.resolution}>
                        <CollapsibleTrigger className="mb-1 flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left hover:bg-secondary/80">
                          <span className="font-semibold">{quality.resolution}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1">
                            {quality.urls.map((dl, idx) => (
                               <Button key={idx} asChild variant="link" className="p-0 h-auto justify-start">
                                <a href={dl.url} target="_blank" rel="noopener noreferrer">
                                  {dl.provider}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {episode.download_urls.mkv.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">MKV</h3>
                    {episode.download_urls.mkv.map((quality) => (
                      <Collapsible key={quality.resolution}>
                        <CollapsibleTrigger className="mb-1 flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left hover:bg-secondary/80">
                          <span className="font-semibold">{quality.resolution}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1">
                            {quality.urls.map((dl, idx) => (
                              <Button key={idx} asChild variant="link" className="p-0 h-auto justify-start">
                                <a href={dl.url} target="_blank" rel="noopener noreferrer">
                                  {dl.provider}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;