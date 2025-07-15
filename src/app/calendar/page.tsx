
"use client";

import EventCalendar from '@/components/EventCalendar';
import { useEvents } from '@/contexts/EventContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const { events, loading } = useEvents();

  if (loading) {
    return (
       <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-[370px] w-full" />
          </div>
          <div className="space-y-4">
              <Skeleton className="h-10 w-2/3 mb-4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
          </div>
        </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary">Event Calendar</h1>
        <p className="text-muted-foreground mt-2">See what&apos;s happening on campus at a glance.</p>
      </div>
      <EventCalendar events={events} />
    </div>
  );
}
