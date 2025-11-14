import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays } from 'lucide-react';

const Schedule = () => {
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: api.getSchedule,
  });

  const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Jadwal Rilis</h1>
        </div>

        {isLoading ? (
          <div>
            <div className="mb-6 flex gap-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {[...Array(14)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue={daysOrder[new Date().getDay() -1] || "Senin"} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 sm:flex sm:flex-wrap h-auto justify-start">
              {daysOrder.map((day) => (
                <TabsTrigger key={day} value={day}>
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {scheduleData?.map((daySchedule) => (
              <TabsContent key={daySchedule.day} value={daySchedule.day}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
  {daySchedule.anime_list.map((anime) => (
    <AnimeCard 
      key={anime.slug} 
      anime={{
        title: anime.anime_name,
        slug: anime.slug,
        poster: anime.poster,
        otakudesu_url: anime.url,
      }} 
    />
  ))}
</div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Schedule;