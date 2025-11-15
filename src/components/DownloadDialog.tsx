import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { api, Episode, BatchQuality, BatchFormat } from "@/lib/api";
import { Skeleton } from "./ui/skeleton";
import { Download, HardDriveDownload } from "lucide-react";

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  animeTitle: string;
  batchSlug: string;
  episodes: Episode[];
}

export function DownloadDialog({ isOpen, onClose, animeTitle, batchSlug, episodes }: DownloadDialogProps) {
  const { data: batchData, isLoading } = useQuery({
    queryKey: ['batch', batchSlug],
    queryFn: () => api.getBatchDetail(batchSlug),
    enabled: isOpen,
  });

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Download: {animeTitle}</DialogTitle>
          <DialogDescription>
            Select a download option. You can download the entire batch as a ZIP file or individual episodes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[60vh] py-4">
          <Tabs defaultValue="batch">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="batch" className="gap-2"><HardDriveDownload className="h-4 w-4"/>Batch (ZIP)</TabsTrigger>
              <TabsTrigger value="individual" className="gap-2"><Download className="h-4 w-4"/>Individual Episodes</TabsTrigger>
            </TabsList>

            {/* Batch Download Tab */}
            <TabsContent value="batch" className="h-full">
              <ScrollArea className="h-full pr-4">
                {isLoading && <div className="space-y-4 mt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>}
                
                {batchData?.downloadUrl.formats.map((format: BatchFormat) => (
                  <div key={format.title} className="mt-4">
                    <h3 className="font-semibold mb-2">{format.title}</h3>
                    <div className="space-y-2">
                      {format.qualities.map((quality: BatchQuality) => (
                        <div key={quality.title} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-semibold">{quality.title}</p>
                            <p className="text-sm text-muted-foreground">{quality.size}</p>
                          </div>
                          <Button onClick={() => handleDownload(quality.urls[0].url)}>Download</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!isLoading && !batchData && <p className="text-center text-muted-foreground mt-10">No batch download links available.</p>}
              </ScrollArea>
            </TabsContent>

            {/* Individual Download Tab */}
            <TabsContent value="individual" className="h-full">
                <ScrollArea className="h-full pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-4">
                        {episodes.map((episode) => (
                            <Button asChild key={episode.slug} variant="outline">
                                <a href={`/watch/${episode.slug}`} target="_blank" rel="noopener noreferrer">
                                    Episode {episode.episode_number}
                                </a>
                            </Button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Note: Individual episode download links are available on the watch page.
                    </p>
                </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
