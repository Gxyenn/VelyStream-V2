import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api, Episode } from "@/lib/api";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Loader2, Download } from "lucide-react";

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  animeSlug: string;
  animeTitle: string;
}

export const DownloadDialog = ({ isOpen, onClose, episodes, animeSlug, animeTitle }: DownloadDialogProps) => {
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<string>("720p");
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map(ep => ep.slug));
    }
  };

  const handleDownload = async () => {
    if (selectedEpisodes.length === 0) {
      toast({
        title: "No Episodes Selected",
        description: "Please select at least one episode to download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Starting Download...",
      description: `Preparing ${selectedEpisodes.length} episode(s). This may take a while.`,
    });

    const zip = new JSZip();
    const animeFolder = zip.folder(animeTitle.replace(/[^a-zA-Z0-9]/g, '_'));

    for (const slug of selectedEpisodes) {
        try {
            const epDetail = await api.getEpisodeDetail(slug);
            const quality = epDetail.download_urls.mp4.find(q => q.resolution.includes(selectedResolution));
            
            if (quality && quality.urls.length > 0) {
                const downloadUrl = quality.urls[0].url; // Just pick the first provider
                const episodeData = await fetch(downloadUrl).then(res => res.blob());
                const episodeNumber = episodes.find(e => e.slug === slug)?.episode_number || 'XX';
                animeFolder?.file(`Eps_${episodeNumber}_${slug}.mp4`, episodeData);
                
                toast({
                    title: `Fetched Episode ${episodeNumber}`,
                    description: `Added to zip archive.`,
                });
            } else {
                 toast({
                    title: `Download Failed for Episode`,
                    description: `Could not find ${selectedResolution} quality for an episode.`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(`Failed to download episode ${slug}:`, error);
            toast({
                title: "Download Error",
                description: `An error occurred while fetching an episode.`,
                variant: "destructive",
            });
        }
    }

    toast({
      title: "Zipping files...",
      description: "Please wait while the zip file is being created.",
    });

    zip.generateAsync({ type: "blob" })
      .then(function(content) {
        saveAs(content, `${animeTitle}_${selectedResolution}.zip`);
        setIsDownloading(false);
        onClose();
        setSelectedEpisodes([]);
         toast({
            title: "Download Complete!",
            description: "Your file has been saved.",
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download Episodes for {animeTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 my-4">
            <div className="col-span-3 sm:col-span-1">
                <h4 className="font-semibold mb-2">Options</h4>
                <div className="space-y-4">
                    <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Resolution" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="480p">480p</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="select-all"
                            checked={selectedEpisodes.length === episodes.length && episodes.length > 0}
                            onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium leading-none">
                            Select All ({selectedEpisodes.length}/{episodes.length})
                        </label>
                    </div>
                </div>
            </div>
            <div className="col-span-3 sm:col-span-2">
                 <h4 className="font-semibold mb-2">Episode List</h4>
                <ScrollArea className="h-64 border rounded-md">
                    <div className="p-4 space-y-2">
                        {episodes.map(ep => (
                            <div key={ep.slug} className="flex items-center space-x-2">
                                <Checkbox
                                    id={ep.slug}
                                    checked={selectedEpisodes.includes(ep.slug)}
                                    onCheckedChange={(checked) => {
                                        setSelectedEpisodes(prev => 
                                            checked ? [...prev, ep.slug] : prev.filter(s => s !== ep.slug)
                                        );
                                    }}
                                />
                                <label htmlFor={ep.slug} className="text-sm flex-1">
                                    Eps {ep.episode_number}: {ep.episode}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleDownload} disabled={isDownloading || selectedEpisodes.length === 0}>
            {isDownloading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Download ({selectedEpisodes.length})</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
