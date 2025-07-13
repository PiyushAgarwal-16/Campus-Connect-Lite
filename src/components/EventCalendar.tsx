"use client";

import { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Event } from '@/lib/types';

interface EventCalendarProps {
  events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const eventDays = events.map(event => parseISO(event.date));

  const selectedDayEvents = date
    ? events.filter(event => isSameDay(parseISO(event.date), date))
    : [];

  const modifiers = {
    hasEvent: eventDays,
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
      color: 'var(--primary)',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      borderRadius: '9999px'
    },
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <Card className="md:col-span-2">
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0 [&_td]:w-14 [&_td]:h-14"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            {date ? format(date, 'EEEE, MMMM d') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayEvents.length > 0 ? (
            <ul className="space-y-4">
              {selectedDayEvents.map(event => {
                const startDate = new Date(`${event.date}T${event.time}`);
                return (
                  <li key={event.id} className="border-l-4 border-primary pl-4 py-2 hover:bg-secondary/50 rounded-r-md">
                    <Link href={`/events/${event.id}`} className="group">
                        <p className="font-semibold group-hover:text-primary">{event.title}</p>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {format(startDate, 'p')}
                                    {event.endTime && ` - ${format(new Date(`${event.date}T${event.endTime}`), 'p')}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No events scheduled for this day.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
