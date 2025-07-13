"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, GraduationCap, Ticket } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRegistrations } from '@/contexts/RegistrationContext';
import { useEvents } from '@/contexts/EventContext';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userRegistrations, loading: registrationsLoading } = useRegistrations();
  const { getEventById, events } = useEvents();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const registeredEvents = userRegistrations
    .map(reg => getEventById(reg.eventId))
    .filter((event): event is NonNullable<typeof event> => event !== undefined && event !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  if (loading || !user || registrationsLoading) {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="profile avatar" />
                <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
            <CardDescription className="capitalize text-accent">{user.role}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-4 text-lg">
            <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
                <span>{user.email}</span>
            </div>
            {user.studentId && (
                 <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span>Student ID: {user.studentId}</span>
                </div>
            )}
        </CardContent>

        {user.role === 'student' && (
          <>
            <Separator className="my-2" />
            <div id="my-tickets" className="scroll-mt-20">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">My Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {registeredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {registeredEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(`${event.date}T${event.time}`), "PPp")}</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/ticket/${event.id}`}>
                            <Ticket className="mr-2 h-4 w-4" />
                            View Ticket
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">You haven't registered for any events yet.</p>
                )}
              </CardContent>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
