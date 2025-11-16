
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Share2 } from "lucide-react";

interface DonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationDialog({ isOpen, onClose }: DonationDialogProps) {
  const handleDonation = () => {
    window.open("https://saweria.co/Gxyenn", "_blank");
  };

  const handleTikTok = () => {
    window.open("https://tiktok.com/Gxyenn", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Hai Kamu!</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-muted-foreground">
            Yuk support Dev Supaya Lebih Semangat Update dengan Cara Donasi/Follow TiktokDev
          </p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button onClick={handleDonation}>
            <Coffee className="mr-2 h-4 w-4" /> Donasi
          </Button>
          <Button variant="secondary" onClick={handleTikTok}>
            <Share2 className="mr-2 h-4 w-4" /> Follow TikTok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
