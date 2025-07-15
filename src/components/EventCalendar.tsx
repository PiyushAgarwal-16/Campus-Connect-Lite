"use client";

import { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, UserPlus, Check, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Event } from '@/lib/types';
import { useAuth } from "@/hooks/useAuth";
import { useRegistrations } from "@/contexts/RegistrationContext";
import { useToast } from "@/hooks/use-toast";

interface EventCalendarProps {
  events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const { isUserRegistered, registerForEvent } = useRegistrations();
  const { toast } = useToast();
  const router = useRouter();
  
  const eventDays = events.map(event => parseISO(event.date));

  const selectedDayEvents = date
    ? events.filter(event => isSameDay(parseISO(event.date), date))
    : [];

  const handleQuickRegister = async (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to register for events.",
      });
      router.push('/login');
      return;
    }

    if (user.role === 'organizer') {
      toast({
        title: "Organizer Account",
        description: "Organizers cannot register for events. Switch to a student account to register.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await registerForEvent(event.id);
      toast({
        title: "Registration Successful!",
        description: `You are now registered for ${event.title}.`,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

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
                const isRegistered = user ? isUserRegistered(event.id) : false;
                // Calculate if registration is still allowed (until 15 minutes before event starts)
                const eventStartTime = new Date(`${event.date} ${event.time}`);
                const currentTime = new Date();
                const registrationCutoff = new Date(eventStartTime.getTime() - 15 * 60 * 1000); // 15 minutes before
                const canStillRegister = currentTime < registrationCutoff;
                
                const canRegister = user?.role === 'student' && canStillRegister && !isRegistered;
                const showRegisterForGuests = !user && canStillRegister;
                const showRegisterForOrganizers = user?.role === 'organizer' && canStillRegister && !isRegistered;
                const canEdit = user?.role === 'organizer' && user.email === event.organizer.contact;
                
                return (
                  <li key={event.id} className="border-l-4 border-primary pl-4 py-3 hover:bg-secondary/50 rounded-r-md">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <Link href={`/events/${event.id}`} className="group flex-1">
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
                        
                        <div className="flex flex-col gap-2 ml-3">
                          {canEdit && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/events/${event.id}/edit`);
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          
                          {isRegistered && (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Registered
                            </Badge>
                          )}
                          
                          {(canRegister || showRegisterForGuests || showRegisterForOrganizers) && (
                            <Button 
                              size="sm" 
                              onClick={(e) => handleQuickRegister(event, e)}
                              className="text-xs px-2 py-1 h-7"
                              variant={showRegisterForGuests ? "outline" : "default"}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              {showRegisterForGuests ? "Login to Register" : "Register"}
                            </Button>
                          )}
                          
                          {isRegistered && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/ticket/${event.id}`);
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              View Ticket
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
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
