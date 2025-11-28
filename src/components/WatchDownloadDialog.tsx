import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api, BatchQuality } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WatchDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchSlug: string;
  animeTitle: string;
}

export const WatchDownloadDialog = ({
  isOpen,
  onClose,
  batchSlug,
  animeTitle,
}: WatchDownloadDialogProps) => {
  const { data: batchDetail, isLoading } = useQuery({
    queryKey: ["batchDetail", batchSlug],
    queryFn: () => api.getBatchDetail(batchSlug),
    enabled: isOpen && !!batchSlug,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Download Batch: {animeTitle}</DialogTitle>
          <DialogDescription>
            Pilih resolusi dan provider untuk mengunduh.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="py-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !batchDetail || !batchDetail.downloadUrl?.formats ? (
                <p className="text-center text-muted-foreground">
                    Tidak ada link download ditemukan.
                </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {batchDetail.downloadUrl.formats.map((quality: BatchQuality) => (
                  <AccordionItem value={quality.title} key={quality.title}>
                    <AccordionTrigger>
                      <div className="flex w-full items-center justify-between pr-4">
                        <span className="font-semibold">{quality.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {quality.size}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2 pt-2">
                        {quality.urls.map((link) => (
                          <Button
                            key={link.url}
                            variant="ghost"
                            className="justify-between"
                            asChild
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>{link.title}</span>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};