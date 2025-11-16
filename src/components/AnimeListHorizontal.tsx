import { Anime } from "@/lib/api";
import { AnimeCard } from "./AnimeCard";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface AnimeListHorizontalProps {
  animes: Anime[];
}

export const AnimeListHorizontal = ({ animes }: AnimeListHorizontalProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
      <div className="flex w-max space-x-4 p-4">
        {animes.map((anime) => (
          <div key={anime.slug} className="w-48">
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
