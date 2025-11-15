
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Coffee } from "lucide-react";

interface DonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationDialog({ isOpen, onClose }: DonationDialogProps) {
  const handleDonation = () => {
    window.open("https://saweria.com/Gxyenn", "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center flex-col text-center">
             <Heart className="h-12 w-12 text-red-500 mb-4" />
            <DialogTitle>Terima Kasih Sudah Menggunakan VelyStream!</DialogTitle>
            <DialogDescription className="pt-2">
              Sepertinya kamu asik nonton, maaf ya mengganggu.
              Dukunganmu sangat berarti bagi kami untuk terus melanjutkan project ini.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
                Yuk support Developer untuk terus update dengan cara berdonasi atau follow akun sosial media kami.
            </p>
            <div className="mt-4 flex flex-col space-y-2">
                 <a href="https://t.me/GxyennOfficial" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sky-500 hover:underline">
                    Channel Telegram: t.me/GxyennOfficial
                </a>
                <a href="https://tiktok.com/@gxyenn969" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-pink-500 hover:underline">
                    TikTok: tiktok.com/@gxyenn969
                </a>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Nanti Saja
          </Button>
          <Button onClick={handleDonation}>
            <Coffee className="mr-2 h-4 w-4" /> Donasi Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
