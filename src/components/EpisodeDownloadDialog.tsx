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
import { api, EpisodeDownloadFormat, EpisodeDownloadQuality } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EpisodeDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  episodeSlug: string;
  episodeTitle: string;
}

export const EpisodeDownloadDialog = ({
  isOpen,
  onClose,
  episodeSlug,
  episodeTitle,
}: EpisodeDownloadDialogProps) => {
  const { data: episodeDetail, isLoading } = useQuery({
    queryKey: ["episodeDetail", episodeSlug],
    queryFn: () => api.getEpisodeDetail(episodeSlug),
    enabled: isOpen && !!episodeSlug,
  });

  const downloadFormats = episodeDetail?.download_urls || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Download Episode: {episodeTitle}</DialogTitle>
          <DialogDescription>
            Pilih format, resolusi, dan provider untuk mengunduh.
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
            ) : !downloadFormats.length ? (
                <p className="text-center text-muted-foreground">
                    Tidak ada link download ditemukan.
                </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {downloadFormats.map((format: EpisodeDownloadFormat) => (
                  <AccordionItem value={format.format} key={format.format}>
                    <AccordionTrigger>
                      <span className="font-semibold text-lg">{format.format}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="single" collapsible className="w-full">
                            {format.qualities.map((quality: EpisodeDownloadQuality) => (
                                <AccordionItem value={quality.quality} key={quality.quality}>
                                    <AccordionTrigger>
                                        <div className="flex w-full items-center justify-between pr-4">
                                            <span className="font-semibold">{quality.quality}</span>
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
                                            <span>{link.provider}</span>
                                            <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        ))}
                                    </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
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
