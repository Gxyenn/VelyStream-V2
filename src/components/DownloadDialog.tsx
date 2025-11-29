import { toast } from "sonner";
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
import { ChevronDown, Loader2 } from "lucide-react";

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  animeTitle: string;
}

export const DownloadDialog = ({
  isOpen,
  onClose,
  episodes,
  animeTitle,
}: DownloadDialogProps) => {
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quality, setQuality] = useState("720p");

  const handleSelectAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map((ep) => ep.slug));
    }
  };

  const handleDownload = async () => {
    if (selectedEpisodes.length === 0) {
      toast.warning("Pilih episode dulu ya!");
      return;
    }

    setIsDownloading(true);
    toast.info("Mencari link download...", { description: "Popup tab baru mungkin akan muncul." });

    let successCount = 0;

    // Loop setiap episode yang dipilih
    for (const slug of selectedEpisodes) {
      try {
        const episodeDetail = await api.getEpisodeDetail(slug);
        
        // Cari server dengan kualitas yg dipilih
        const serverGroups = episodeDetail.stream_servers;
        let targetServerId = "";

        // Prioritas pencarian server yang bagus (biasanya direct)
        for (const group of serverGroups) {
            const found = group.servers.find(s => s.id.includes(quality) || group.quality.includes(quality));
            if (found) {
                targetServerId = found.id;
                break;
            }
        }

        // Fallback: kalau kualitas itu gak ada, ambil server pertama aja
        if (!targetServerId && serverGroups.length > 0 && serverGroups[0].servers.length > 0) {
             targetServerId = serverGroups[0].servers[0].id;
        }

        if (targetServerId) {
          const url = await api.getServerUrl(targetServerId);
          
          // Kita pakai window.open karena ini bulk download.
          // Browser akan memblokir jika kita coba auto-download banyak file sekaligus lewat Blob.
          // Window open lebih aman dari blokir browser untuk multi-file.
          window.open(url, "_blank");
          successCount++;
        } 
      } catch (error) {
        console.error(`Skip ${slug}`, error);
      }
      
      // Kasih jeda 1 detik biar browser ga ngira kita spam popup
      await new Promise(r => setTimeout(r, 1000)); 
    }

    setIsDownloading(false);
    onClose();

    if (successCount > 0) {
        toast.success(`${successCount} Tab Terbuka`, {
            description: "Silakan simpan video dari tab baru tersebut."
        });
    } else {
        toast.error("Gagal, server sibuk/kosong.");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Download Episodes: {animeTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Pilih episode. Kami akan membuka tab download untuk setiap episode.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between">
          <Button onClick={handleSelectAll} variant="outline" size="sm">
            {selectedEpisodes.length === episodes.length
              ? "Batal Pilih"
              : "Pilih Semua"}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {quality} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-1">
              {["1080p", "720p", "480p", "360p"].map((q) => (
                <Button
                  key={q}
                  variant={quality === q ? "secondary" : "ghost"}
                  onClick={() => setQuality(q)}
                  className="w-full justify-start"
                  size="sm"
                >
                  {q}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
        <ScrollArea className="h-64 border rounded-md">
          <div className="p-4 space-y-2">
            {episodes.map((ep) => (
              <div key={ep.slug} className="flex items-center gap-3">
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
                <Label htmlFor={ep.slug} className="font-normal">
                  Episode {ep.episode_number}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDownload}
            disabled={isDownloading || selectedEpisodes.length === 0}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Proses...
              </>
            ) : (
              `Unduh (${selectedEpisodes.length})`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};