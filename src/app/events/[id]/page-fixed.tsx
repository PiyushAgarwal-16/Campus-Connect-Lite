"use client";

import { notFound, useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, User, Mail, Users } from "lucide-react";
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
  const { getEventById } = useEvents();
  const [event, setEvent] = useState<Event | undefined | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();
  const { isUserRegistered, registerForEvent } = useRegistrations();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const foundEvent = getEventById(id);
    setEvent(foundEvent);
  }, [getEventById, id]);

  // Fetch registration count
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

  if (event === undefined) {
    notFound();
  }

  const handleRegister = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = async () => {
    if (event) {
      try {
        await registerForEvent(event.id);
        toast({ 
          title: "Registration Successful!", 
          description: `You are now registered for ${event.title}. You can view your ticket in My Registrations.` 
        });
        // Update registration count
        setRegistrationCount(prev => prev + 1);
        setShowConfirmDialog(false);
      } catch (error) {
        console.error('Registration failed:', error);
        toast({
          title: "Registration Failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (event === null) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="h-64 w-full" />
            <div className="p-6">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRegistered = isUserRegistered(event.id);
  const startDate = new Date(`${event.date}T${event.time}`);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative h-64 w-full">
            <Image
              src={`https://placehold.co/1200x400.png`}
              alt={event.title}
              fill
              className="object-cover"
              data-ai-hint="event banner"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <CardTitle className="text-4xl font-headline font-bold mb-2">{event.title}</CardTitle>
              <Badge variant="outline" className="text-lg">{event.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold font-headline">About this event</h3>
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
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {loadingCount ? "Loading..." : `${registrationCount} registered`}
              </span>
            </div>
            <div className="pt-4 mt-4 border-t">
                 <h3 className="text-xl font-semibold font-headline mb-4">Organizer</h3>
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium">{event.organizer.name}</span>
                </div>
                 <div className="flex items-center gap-3 mt-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href={`mailto:${event.organizer.contact}`} className="font-medium text-primary hover:underline">{event.organizer.contact}</a>
                </div>
            </div>
          </div>
        </CardContent>
         {user && user.role === 'student' && new Date(event.date) >= new Date() && (
          <CardFooter className="bg-muted/50 p-6">
            {!isRegistered ? (
              <Button onClick={handleRegister} className="w-full sm:w-auto">
                Register for this Event
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="font-semibold text-primary">You are registered for this event!</p>
                <Button asChild className="w-full sm:w-auto">
                    <Link href={`/ticket/${event.id}`}>View Your Ticket</Link>
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      
      <RegistrationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        event={event}
        onConfirm={handleConfirmRegistration}
      />
    </div>
  );
}
