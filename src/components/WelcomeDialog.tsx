import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

const WELCOME_DIALOG_SHOWN_KEY = "VelyStreamWelcome";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(15); // Diubah menjadi 15 detik

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(WELCOME_DIALOG_SHOWN_KEY);
    if (!alreadyShown) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setIsOpen(false);
        sessionStorage.setItem(WELCOME_DIALOG_SHOWN_KEY, "true");
      }
    }
  }, [isOpen, countdown]);

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        hideCloseButton // Properti baru untuk menyembunyikan tombol close
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to <span className="text-primary">VelyStream</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-center space-y-4">
          <DialogDescription>
            <strong>Disclaimer:</strong> VelyStream adalah layanan pengindeks tidak resmi untuk anime. Kami tidak bertanggung jawab atas konten yang di-hosting. Harap dukung para kreator resmi.
          </DialogDescription>
          <DialogDescription>
            <strong>Peringatan:</strong> Beberapa konten mungkin tidak sesuai untuk semua umur. Kebijaksanaan penonton sangat disarankan.
          </DialogDescription>
        </div>
        <DialogFooter className="flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">Dev: Gxyenn 正式</p>
            <p className="text-sm font-medium">Menutup dalam {countdown}...</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}