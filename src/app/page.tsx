
"use client";

import EventCard from "@/components/EventCard";
import { useEvents } from "@/contexts/EventContext";
import type { Event } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { events, loading } = useEvents();

  const upcomingEvents: Event[] = events.filter(
    (event) => new Date(`${event.date}T${event.time}`) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Welcome to CampusConnect Lite</h1>
        <p className="text-muted-foreground mt-2">Your central hub for all campus happenings.</p>
      </div>

      <div>
        <h2 className="text-3xl font-headline font-semibold mb-6">Upcoming Events</h2>
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No upcoming events right now. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
