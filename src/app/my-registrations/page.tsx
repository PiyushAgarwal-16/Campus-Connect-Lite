"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRegistrations } from "@/contexts/RegistrationContext";
import { useEvents } from "@/contexts/EventContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin, Ticket, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyRegistrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { userRegistrations, loading: regLoading } = useRegistrations();
  const { events, loading: eventsLoading } = useEvents();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || regLoading || eventsLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  // Get events for registered events
  const registeredEvents = userRegistrations
    .map(reg => {
      const event = events.find(e => e.id === reg.eventId);
      return event ? { ...event, registration: reg } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

  const upcomingEvents = registeredEvents.filter(e => 
    new Date(e!.date) >= new Date()
  );
  
  const pastEvents = registeredEvents.filter(e => 
    new Date(e!.date) < new Date()
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">My Event Registrations</h1>
        <p className="text-muted-foreground">
          Manage your event registrations and view your tickets
        </p>
      </div>

      {registeredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <Ticket className="h-16 w-16 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Registrations Yet</h3>
                <p className="text-muted-foreground">
                  You haven&apos;t registered for any events yet. Browse available events to get started!
                </p>
              </div>
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold font-headline">Upcoming Events</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((item) => {
                  const event = item!;
                  const startDate = new Date(`${event.date}T${event.time}`);
                  
                  return (
                    <Card key={event.id} className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                          <Badge variant="secondary">{event.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Registered on {format(new Date(event.registration.registrationDate), 'MMM d, yyyy')}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {format(startDate, 'p')}
                              {event.endTime && ` - ${format(new Date(`${event.date}T${event.endTime}`), 'p')}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        {event.registration.checkedIn && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Checked In</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="flex-1">
                            <Link href={`/ticket/${event.id}`}>
                              <Ticket className="h-4 w-4 mr-1" />
                              View Ticket
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/events/${event.id}`}>Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold font-headline">Past Events</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((item) => {
                  const event = item!;
                  const startDate = new Date(`${event.date}T${event.time}`);
                  
                  return (
                    <Card key={event.id} className="h-full flex flex-col opacity-75">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(startDate, 'MMMM d, yyyy')}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
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
                        
                        <div className="flex items-center gap-2">
                          {event.registration.checkedIn ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Attended</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-sm">Not attended</span>
                            </div>
                          )}
                        </div>
                        
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
