import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api, Episode } from "@/lib/api";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDown } from "lucide-react";

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  animeTitle: string;
}

export const DownloadDialog = ({ isOpen, onClose, episodes, animeTitle }: DownloadDialogProps) => {
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quality, setQuality] = useState("720p"); // Default quality

  const handleSelectAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map((ep) => ep.slug));
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    for (const slug of selectedEpisodes) {
      try {
        // This is a simplified example. In a real app, you'd need to get 
        // the download link for the specific quality.
        const episodeDetail = await api.getEpisodeDetail(slug);
        const server = episodeDetail.stream_servers
          .flatMap(s => s.servers)
          .find(s => s.id.includes(quality));

        if (server) {
          const url = await api.getServerUrl(server.id);
          window.open(url, "_blank");
        }
      } catch (error) {
        console.error(`Failed to download ${slug}`, error);
      }
    }
    setIsDownloading(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Download Episodes: {animeTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Select episodes to download.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between">
          <Button onClick={handleSelectAll}>
            {selectedEpisodes.length === episodes.length ? "Deselect All" : "Select All"}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {quality} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              {["1080p", "720p", "480p", "360p"].map((q) => (
                <Button
                  key={q}
                  variant={quality === q ? "secondary" : "ghost"}
                  onClick={() => setQuality(q)}
                  className="w-full justify-start"
                >
                  {q}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div key={ep.slug} className="flex items-center gap-2">
                <Checkbox
                  id={ep.slug}
                  checked={selectedEpisodes.includes(ep.slug)}
                  onCheckedChange={() => {
                    setSelectedEpisodes((prev) =>
                      prev.includes(ep.slug)
                        ? prev.filter((s) => s !== ep.slug)
                        : [...prev, ep.slug]
                    );
                  }}
                />
                <Label htmlFor={ep.slug}>Episode {ep.episode_number}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDownload} disabled={isDownloading || selectedEpisodes.length === 0}>
            {isDownloading ? "Downloading..." : `Download ${selectedEpisodes.length} Episodes`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};