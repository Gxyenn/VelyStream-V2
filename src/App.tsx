import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DonationDialog } from "@/components/DonationDialog";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Genres from "./pages/Genres";
import GenreDetail from "./pages/GenreDetail";
import MyList from "./pages/MyList";
import History from "./pages/History";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import AllAnime from "./pages/AllAnime";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();
const WATCH_COUNT_KEY = "vely_stream_watch_count";
const DONATION_DIALOG_SHOWN_KEY = "vely_stream_donation_shown";

const App = () => {
  const [isDonationDialogOpen, setDonationDialogOpen] = useState(false);

  const triggerDonationDialog = () => {
    const alreadyShown = sessionStorage.getItem(DONATION_DIALOG_SHOWN_KEY);
    if (alreadyShown) return;

    const count = parseInt(localStorage.getItem(WATCH_COUNT_KEY) || "0");
    if (count >= 3) {
      setDonationDialogOpen(true);
      sessionStorage.setItem(DONATION_DIALOG_SHOWN_KEY, "true");
      localStorage.removeItem(WATCH_COUNT_KEY); // Reset count after showing dialog
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WelcomeDialog />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <DonationDialog 
              isOpen={isDonationDialogOpen}
              onClose={() => setDonationDialogOpen(false)}
            />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/genre/:slug" element={<GenreDetail />} />
              <Route path="/all-anime" element={<AllAnime />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/mylist" element={<MyList />} />
              <Route path="/history" element={<History />} />
              <Route path="/anime/:slug" element={<AnimeDetail />} />
              <Route path="/watch/:slug" element={<Watch onWatch={() => {
                const count = parseInt(localStorage.getItem(WATCH_COUNT_KEY) || "0") + 1;
                localStorage.setItem(WATCH_COUNT_KEY, count.toString());
                triggerDonationDialog();
              }} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;