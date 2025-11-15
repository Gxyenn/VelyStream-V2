import { Heart, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Tentang VelyStream</h1>
          <p className="text-lg text-muted-foreground">
            Informasi lebih lanjut mengenai proyek ini.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <span>Pengembang</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Pembuatan dan pengembangan platform streaming ini sepenuhnya dikerjakan oleh:
            </p>
            <p className="text-2xl font-semibold mt-2">Gxyenn 正式</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Send className="h-6 w-6" />
                <span>Kontak & Sosial Media</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Punya pertanyaan, saran, atau ingin melaporkan bug? Hubungi saya melalui Telegram.
              </p>
              <Button asChild className="w-full">
                <a href="https://t.me/Gxyenn969" target="_blank" rel="noopener noreferrer">
                  <Send className="mr-2 h-4 w-4" /> Telegram
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-red-500" />
                <span>Donasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Suka dengan VelyStream? Dukung pengembang agar proyek ini tetap berjalan dan bebas iklan.
              </p>
              <Button asChild className="w-full bg-pink-600 hover:bg-pink-700">
                <a href="https://saweria.co/Gxyenn" target="_blank" rel="noopener noreferrer">
                  <Heart className="mr-2 h-4 w-4" /> Dukung di Saweria
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
