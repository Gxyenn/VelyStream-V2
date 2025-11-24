import { Anime } from "@/lib/api";
import { AnimeCard } from "./AnimeCard";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface AnimeListHorizontalProps {
  animes: Anime[];
  size?: 'small' | 'normal';
}

export const AnimeListHorizontal = ({ animes, size = 'normal' }: AnimeListHorizontalProps) => {
  const cardWidth = size === 'small' ? 'w-28' : 'w-48';
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
      <div className="flex w-max space-x-4 p-4">
        {animes.map((anime) => (
          <div key={anime.slug} className={cardWidth}>
            <AnimeCard anime={anime} size={size} />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
