
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Mail, Send } from "lucide-react";

const DISCLAIMER_KEY = "vely_stream_disclaimer_accepted";

export function DisclaimerDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(DISCLAIMER_KEY);
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <AlertDialogTitle>Pemberitahuan & Persyaratan</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 pt-4">
            <p>
              VelyStream adalah situs streaming anime non-profit dan ilegal (tidak resmi). Kami tidak menyimpan file video apa pun di server kami. Semua konten disediakan oleh pihak ketiga yang tidak terafiliasi.
            </p>
            <p>
              Dengan melanjutkan, Anda setuju bahwa <span className="font-bold">Anda bertanggung jawab penuh atas apa yang Anda tonton</span>. Beberapa konten mungkin mengandung unsur 18+. Risiko dan konsekuensi ditanggung oleh masing-masing pengguna.
            </p>
            <p className="font-bold">
              Admin (Gxyenn 正式) tidak bertanggung jawab atas hal tersebut.
            </p>
            <div className="space-y-2 rounded-lg border p-4">
                <h4 className="font-semibold">Hubungi Admin:</h4>
                 <a href="mailto:gxyenndev@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Mail className="h-4 w-4" />
                    <span>gxyenndev@gmail.com</span>
                </a>
                <a href="https://t.me/Gxyenn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Send className="h-4 w-4" />
                    <span>t.me/Gxyenn</span>
                </a>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction onClick={handleAccept}>
            Saya Mengerti dan Setuju
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
