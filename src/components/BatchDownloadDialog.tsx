import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download, HardDrive, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BatchDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchSlug: string;
  animeTitle: string;
}

export const BatchDownloadDialog = ({
  isOpen,
  onClose,
  batchSlug,
  animeTitle,
}: BatchDownloadDialogProps) => {
  // State ini sebenarnya tidak terlalu terpakai karena kita langsung window.open, 
  // tapi bagus untuk efek visual sesaat
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const { data: batchData, isLoading, isError } = useQuery({
    queryKey: ["batch", batchSlug],
    queryFn: () => api.getBatchDetail(batchSlug),
    enabled: isOpen && !!batchSlug,
  });

  // FUNGSI DOWNLOAD BATCH
  const handleAutoDownload = async (url: string, provider: string) => {
    // KITA LANGSUNG BUKA TAB BARU
    // Karena OtakuDrive dll adalah halaman Safelink, bukan file video langsung.
    // Kalau dipaksa 'fetch', akan error CORS atau download file HTML sampah.
    
    toast.success(`Membuka ${provider}...`, {
        description: "Silakan klik 'Tetap Download' di halaman yang terbuka."
    });
    
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Download Batch: {animeTitle}</DialogTitle>
          <DialogDescription>
            Pilih kualitas dan provider untuk mengunduh seluruh episode.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError || !batchData ? (
            <div className="flex h-40 flex-col items-center justify-center text-destructive">
              <AlertTriangle className="mb-2 h-8 w-8" />
              <p>Gagal memuat data batch.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <Accordion type="single" collapsible className="w-full">
                {(Array.isArray(batchData.downloadUrl?.formats) 
                    ? batchData.downloadUrl.formats 
                    : []
                ).map((format, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-primary"/>
                            <span className="font-semibold">{format.title}</span>
                            {format.size && <span className="text-xs text-muted-foreground">({format.size})</span>}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {format.urls.map((link, linkIdx) => (
                          <Button
                            key={linkIdx}
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2"
                            onClick={() => handleAutoDownload(link.url, link.title)}
                          >
                            <Download className="h-3 w-3" />
                            {link.title}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {(!batchData.downloadUrl?.formats || batchData.downloadUrl.formats.length === 0) && (
                  <p className="py-4 text-center text-sm text-muted-foreground">Link batch belum tersedia.</p>
              )}
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};