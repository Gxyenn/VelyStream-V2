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
  const [quality, setQuality] = useState("720p"); // Default quality

  const handleSelectAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map((ep) => ep.slug));
    }
  };

  const handleDownload = async () => {
    if (selectedEpisodes.length === 0) {
      toast.warning("Tidak ada episode yang dipilih.", {
        description: "Silakan pilih setidaknya satu episode untuk diunduh.",
      });
      return;
    }

    setIsDownloading(true);
    toast.info(
      `Mempersiapkan unduhan untuk ${selectedEpisodes.length} episode...`,
      {
        description: `Kualitas yang dipilih: ${quality}. Browser Anda akan membuka tab baru untuk setiap unduhan.`,
      }
    );

    let successCount = 0;
    let errorCount = 0;

    for (const slug of selectedEpisodes) {
      const ep = episodes.find(e => e.slug === slug);
      try {
        const episodeDetail = await api.getEpisodeDetail(slug);
        const server = episodeDetail.stream_servers
          .flatMap((s) => s.servers)
          .find((s) => s.id.includes(quality));

        if (server) {
          const url = await api.getServerUrl(server.id);
          window.open(url, "_blank");
          successCount++;
        } else {
          errorCount++;
          toast.error(
            `Tidak ada server ${quality} ditemukan untuk Episode ${ep?.episode_number || ''}`
          );
        }
        // Add a small delay to prevent browser from blocking popups
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.error(`Gagal mengunduh Episode ${ep?.episode_number || ''}`, error);
        toast.error(
          `Gagal mengunduh Episode ${ep?.episode_number || ''}`,
          {
            description: "Server mungkin offline atau terjadi kesalahan jaringan.",
          }
        );
      }
    }

    setIsDownloading(false);
    onClose();

    if (errorCount === 0) {
        toast.success("Semua unduhan telah dimulai.", {
            description: `${successCount} episode sedang diproses oleh browser Anda.`
        });
    } else {
        toast.warning("Beberapa unduhan gagal.", {
            description: `${successCount} berhasil, ${errorCount} gagal. Periksa konsol untuk detail.`
        })
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Download Episodes: {animeTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Pilih episode dan kualitas untuk diunduh. Setiap episode akan
            terbuka di tab baru.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between">
          <Button onClick={handleSelectAll} variant="outline" size="sm">
            {selectedEpisodes.length === episodes.length
              ? "Batal Pilih Semua"
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
                Memproses...
              </>
            ) : (
              `Unduh ${selectedEpisodes.length} Episode`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};