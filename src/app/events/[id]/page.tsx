"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, User, Users, Edit, Download } from "lucide-react";
import { format } from "date-fns";
import { useEvents } from "@/contexts/EventContext";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useRegistrations } from "@/contexts/RegistrationContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { RegistrationConfirmDialog } from "@/components/RegistrationConfirmDialog";

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { getEventById, exportAttendeeData } = useEvents();
  const [event, setEvent] = useState<Event | undefined | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();
  const { isUserRegistered, registerForEvent } = useRegistrations();
  const { toast } = useToast();

  useEffect(() => {
    const foundEvent = getEventById(id);
    setEvent(foundEvent);
  }, [getEventById, id]);

  useEffect(() => {
    const fetchRegistrationCount = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, 'registrations'), where('eventId', '==', id));
        const querySnapshot = await getDocs(q);
        setRegistrationCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching registration count:", error);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchRegistrationCount();
  }, [id]);

  const handleRegister = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = async () => {
    if (!event || !user) return;

    try {
      await registerForEvent(event.id);
      toast({
        title: "Registration Successful!",
        description: `You are now registered for ${event.title}.`
      });
      setShowConfirmDialog(false);
      const q = query(collection(db, 'registrations'), where('eventId', '==', id));
      const querySnapshot = await getDocs(q);
      setRegistrationCount(querySnapshot.size);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleExportAttendees = async () => {
    if (!event) return;

    try {
      await exportAttendeeData(event.id);
      toast({
        title: "Export Successful!",
        description: "Attendee data has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (event === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Event Not Found</h1>
          <p className="text-muted-foreground mt-2">The event you are looking for does not exist.</p>
          <Link href="/events">
            <Button variant="outline" className="mt-4">
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-96 w-full overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="max-w-4xl mx-auto p-6 -mt-20 relative z-10">
          <Card className="backdrop-blur-sm bg-background/95 border shadow-xl">
            <CardHeader className="p-0">
              <div className="p-6 pb-0">
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const startDate = new Date(`${event.date}T${event.time}`);
  const isRegistered = user ? isUserRegistered(event.id) : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-96 w-full overflow-hidden">
        <Image
          src={event.banner?.url || "https://placehold.co/1200x400.png"}
          alt={event.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-4xl mx-auto p-6 -mt-20 relative z-10">
        <Card className="backdrop-blur-sm bg-background/95 border shadow-xl">
          <CardHeader className="p-0">
            <div className="p-6 pb-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline" className="text-lg">{event.category}</Badge>
                {event.banner && (
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                    AI Banner
                  </Badge>
                )}
                {loadingCount ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <Badge variant="secondary">{registrationCount} registered</Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-headline font-bold mb-2">{event.title}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold font-headline mb-3">Description</h3>
                <p className="text-foreground/80 leading-relaxed">{event.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold font-headline">Details</h3>
                
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
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

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-medium">{event.organizer.name}</span>
                    <br />
                    <span className="text-sm text-muted-foreground">{event.organizer.contact}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {user && user.role === 'student' && (() => {
                // Calculate if registration is still allowed (until 15 minutes before event starts)
                const eventStartTime = new Date(`${event.date} ${event.time}`);
                const currentTime = new Date();
                const registrationCutoff = new Date(eventStartTime.getTime() - 15 * 60 * 1000); // 15 minutes before
                return currentTime < registrationCutoff;
              })() && (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {isRegistered ? (
                      <div className="space-y-3">
                        <p className="font-semibold text-primary">You are registered for this event!</p>
                        <Button asChild className="w-full">
                          <Link href={`/ticket/${event.id}`}>View Your Ticket</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleRegister} className="w-full">
                        Register for Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {user && user.role === 'organizer' && user.email === event.organizer.contact && (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Event Management</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <Button asChild className="w-full">
                      <Link href={`/events/${event.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Event Details
                      </Link>
                    </Button>
                    
                    {(() => {
                      // Check if event has concluded
                      const eventDateTime = new Date(`${event.date} ${event.endTime || event.time}`);
                      const currentTime = new Date();
                      const isEventConcluded = currentTime > eventDateTime;
                      
                      return isEventConcluded && (
                        <Button 
                          onClick={handleExportAttendees}
                          className="w-full"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Attendee Data
                        </Button>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {loadingCount ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {registrationCount}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        registered
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <RegistrationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        event={event}
        onConfirm={handleConfirmRegistration}
      />
    </div>
  );
}
