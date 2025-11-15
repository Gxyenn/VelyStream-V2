import { storage } from '@/lib/storage';
import { AnimeCard } from '@/components/AnimeCard';
import { Bookmark, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Anime } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const MyList = () => {
  const [myList, setMyList] = useState<Anime[]>([]);

  useEffect(() => {
    const handleStorageChange = () => {
      setMyList(storage.getMyList());
    };

    handleStorageChange(); // Initial load

    window.addEventListener('storage_changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage_changed', handleStorageChange);
    };
  }, []);

  const handleRemove = (slug: string) => {
    storage.removeFromMyList(slug);
    setMyList(storage.getMyList());
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My List</h1>
        </div>

        {myList.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {myList.map((anime) => (
              <div key={anime.slug} className="group relative">
                <AnimeCard anime={anime} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2 z-10 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{anime.title}" from your list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(anime.slug)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Bookmark className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your list is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add anime to your list to keep track of what you want to watch
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;