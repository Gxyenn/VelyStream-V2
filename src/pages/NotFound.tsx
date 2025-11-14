import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-purple">
            <span className="text-5xl font-bold text-primary-foreground">V</span>
          </div>
        </div>
        
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The anime you're looking for seems to have disappeared into another dimension.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-5 w-5" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/search">
              <Search className="h-5 w-5" />
              Search Anime
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
