
"use client";

import { useEffect, useState } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/contexts/EventContext';
import { useRegistrations } from '@/contexts/RegistrationContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, User, Building2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Event } from '@/lib/types';
import QRCode from 'qrcode.react';

export default function TicketPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { getEventById } = useEvents();
  const { userRegistrations, isUserRegistered, loading: regLoading } = useRegistrations();

  const [event, setEvent] = useState<Event | null | undefined>(null);
  
  useEffect(() => {
    const foundEvent = getEventById(id);
    setEvent(foundEvent);
  }, [getEventById, id]);

  useEffect(() => {
    if (!authLoading && !regLoading && event !== null) {
      if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to view your ticket.' });
        router.push('/login');
        return;
      }
      if (!isUserRegistered(id)) {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'You are not registered for this event.' });
        router.push(`/events/${id}`);
        return;
      }
    }
  }, [user, authLoading, regLoading, isUserRegistered, id, router, toast, event]);
  
  if (event === undefined) {
      notFound();
  }
  
  const registration = userRegistrations.find(reg => reg.eventId === id);

  if (authLoading || regLoading || !event || !user || !isUserRegistered(id)) {
    return (
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader className="text-center p-6">
                    <Skeleton className="h-8 w-3/4 mx-auto"/>
                    <Skeleton className="h-5 w-1/2 mx-auto mt-2"/>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="border-dashed border-2 border-muted p-6 rounded-lg space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex justify-center pt-4">
                            <Skeleton className="h-40 w-40 rounded-md" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  const startDate = new Date(`${event.date}T${event.time}`);
  const qrCodeValue = JSON.stringify({
    userId: user.id,
    eventId: event.id,
    userName: user.name,
    eventName: event.title,
    registrationId: `${user.id}-${event.id}`
  });

  return (
    <div className="max-w-md mx-auto">
        <Card className="bg-card overflow-hidden shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-lg font-bold">
                    <Building2/>
                    <span>CampusConnect Lite</span>
                </div>
                <CardTitle className="text-3xl font-headline mt-2">{event.title}</CardTitle>
                <CardDescription className="text-primary-foreground/80">Event Admission Ticket</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="border-dashed border-2 border-muted-foreground/50 p-6 rounded-lg text-center space-y-4 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background h-6 w-12 rounded-full border-2 border-dashed border-muted-foreground/50" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-background h-6 w-12 rounded-full border-2 border-dashed border-muted-foreground/50" />
                    
                    <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-md">
                            <QRCode
                                value={qrCodeValue}
                                size={180}
                                level={"H"}
                            />
                        </div>
                    </div>

                    <div className="text-left space-y-3 pt-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="font-medium">{format(startDate, "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="font-medium">
                              {format(startDate, "p")}
                              {event.endTime && ` - ${format(new Date(`${event.date}T${event.endTime}`), "p")}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span className="font-medium">{event.location}</span>
                        </div>
                    </div>

                    {registration?.checkedIn && (
                        <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-green-100 p-3 text-center font-medium text-green-900">
                            <CheckCircle className="h-5 w-5" />
                            <span>Attendance Marked</span>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    </div>
  );
}
