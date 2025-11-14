import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Genres from "./pages/Genres";
import GenreDetail from "./pages/GenreDetail";
import MyList from "./pages/MyList";
import History from "./pages/History";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import AllAnime from "./pages/AllAnime";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/genre/:slug" element={<GenreDetail />} />
            <Route path="/all-anime" element={<AllAnime />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="/history" element={<History />} />
            <Route path="/anime/:slug" element={<AnimeDetail />} />
            <Route path="/watch/:slug" element={<Watch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
