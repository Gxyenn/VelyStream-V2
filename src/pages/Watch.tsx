import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, StreamServer } from '@/lib/api'; // Impor tipe StreamServer
import { storage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Monitor,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

  const { data: animeDetail } = useQuery({
    queryKey: ['anime', episode?.anime.slug],
    queryFn: () => api.getAnimeDetail(episode!.anime.slug.replace('https:/otakudesu.best/anime/', '').replace('/', '')),
    enabled: !!episode?.anime.slug
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
    if (episode?.stream_url && !currentStreamUrl) {
      setCurrentStreamUrl(episode.stream_url);
    }
  }, [episode, currentStreamUrl]);

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

  // Helper function to get quality label for server groups
  const getQualityLabel = (serverGroup: StreamServer) => {
    // Prioritaskan 'quality' jika ada isinya
    if (serverGroup.quality) {
      return `Quality: ${serverGroup.quality}`;
    }
    // Jika tidak ada, coba ekstrak dari 'id' server pertama
    if (serverGroup.servers && serverGroup.servers.length > 0) {
      const firstServerId = serverGroup.servers[0].id;
      // Regex untuk mengambil resolusi (e.g., -360p, -480p, -720p)
      const match = firstServerId.match(/-(\d+p)$/); 
      if (match && match[1]) {
        return `Quality: ${match[1]}`;
      }
    }
    // Fallback jika tidak ditemukan
    return 'Servers';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 h-96 w-full" />
          <div className="grid gap-6 lg:grid-cols-2">
             <Skeleton className="h-[300px] w-full" />
             <Skeleton className="h-[300px] w-full" />
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

          <div 
            className="relative w-full overflow-hidden rounded-xl border border-border bg-black" 
            style={{ aspectRatio: '16/9' }}
          >
            {loadingServer && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}
            <iframe
              key={currentStreamUrl}
              src={currentStreamUrl}
              className="absolute top-0 left-0 h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Episode Navigation */}
          <div className="mt-4 flex gap-2">
            {episode.has_previous_episode && episode.previous_episode && (
              <Button
                variant="outline"
                onClick={() => navigate(`/watch/${episode.previous_episode!.slug}`)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Episode
              </Button>
            )}
            {episode.has_next_episode && episode.next_episode && (
              <Button
                onClick={() => navigate(`/watch/${episode.next_episode!.slug}`)}
                className="ml-auto gap-2"
              >
                Next Episode
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
              <div className="space-y-2">
                {episode.stream_servers.map((serverGroup, idx) => (
                  <Collapsible key={idx} defaultOpen={idx === 0}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left font-semibold hover:bg-secondary/80">
                      {getQualityLabel(serverGroup)}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 mt-2 space-y-1">
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
                              <span className="ml-auto text-xs text-primary">● Active</span>
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
              <div className="space-y-4">
                {episode.download_urls.mp4.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">MP4 Format</h3>
                    {episode.download_urls.mp4.map((quality) => (
                      <Collapsible key={quality.resolution}>
                        <CollapsibleTrigger className="mb-1 flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left hover:bg-secondary/80">
                          <span className="font-semibold">{quality.resolution}</span>
                          <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1">
                            {quality.urls.map((dl, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to download ${episode.episode} (${quality.resolution}) from ${dl.provider}?`)) {
                                    window.open(dl.url, '_blank');
                                  }
                                }}
                                className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                              >
                                {dl.provider}
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {episode.download_urls.mkv.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">MKV Format</h3>
                    {episode.download_urls.mkv.map((quality) => (
                      <Collapsible key={quality.resolution}>
                        <CollapsibleTrigger className="mb-1 flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left hover:bg-secondary/80">
                          <span className="font-semibold">{quality.resolution}</span>
                          <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1">
                            {quality.urls.map((dl, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to download ${episode.episode} (${quality.resolution}) from ${dl.provider}?`)) {
                                    window.open(dl.url, '_blank');
                                  }
                                }}
                                className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                              >
                                {dl.provider}
                              </button>
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

        {/* All Episodes List */}
        {animeDetail && animeDetail.episode_lists.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-bold">All Episodes</h2>
            <ScrollArea className="h-[200px]">
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {animeDetail.episode_lists.map((ep) => (
                  <Button
                    key={ep.slug}
                    variant={ep.slug === slug ? 'default' : 'outline'}
                    asChild
                    size="sm"
                  >
                    <Link to={`/watch/${ep.slug}`}>
                      Episode {ep.episode_number}
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;