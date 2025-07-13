import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, ArrowRight, Check, UserPlus, Edit, Download } from "lucide-react";
import type { Event } from "@/lib/types";
import { format } from 'date-fns';
import { useAuth } from "@/hooks/useAuth";
import { useRegistrations } from "@/contexts/RegistrationContext";
import { useEvents } from "@/contexts/EventContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(`${event.date}T${event.time}`);
  const { user } = useAuth();
  const { isUserRegistered, registerForEvent } = useRegistrations();
  const { exportAttendeeData } = useEvents();
  const { toast } = useToast();
  const router = useRouter();
  
  const isRegistered = user ? isUserRegistered(event.id) : false;
  
  // Calculate if registration is still open (until 15 minutes before event starts)
  const eventStartTime = new Date(`${event.date}T${event.time}`);
  const registrationCutoff = new Date(eventStartTime.getTime() - 15 * 60 * 1000); // 15 minutes before
  const isRegistrationClosed = new Date() > registrationCutoff;
  
  const canRegister = user?.role === 'student' && !isRegistrationClosed && !isRegistered;
  const showRegisterForGuests = !user && !isRegistrationClosed;
  const showRegisterForOrganizers = user?.role === 'organizer' && !isRegistrationClosed && !isRegistered;
  const canEdit = user?.role === 'organizer' && user.email === event.organizer.contact;
  
  // Check if event has concluded
  const eventDateTime = new Date(`${event.date} ${event.endTime || event.time}`);
  const currentTime = new Date();
  const isEventConcluded = currentTime > eventDateTime;
  const canExportAttendees = user?.role === 'organizer' && user.email === event.organizer.contact && isEventConcluded;

  const handleQuickRegister = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to event details
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
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAttendees = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="relative h-40 w-full mb-4 rounded-t-lg overflow-hidden">
            <Image
              src={`https://placehold.co/600x400.png`}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="event cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className="" variant="secondary">{event.category}</Badge>
              {isRegistered && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Registered
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="font-headline text-xl leading-tight">{event.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm pt-1">
             <CalendarDays className="h-4 w-4" />
             <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
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
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="link" className="p-0 h-auto group-hover:text-primary">
            View Details <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          
          <div className="flex gap-2">
            {canEdit && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/events/${event.id}/edit`);
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            
            {canExportAttendees && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleExportAttendees}
              >
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </Button>
            )}
            
            {(canRegister || showRegisterForGuests || showRegisterForOrganizers) && (
              <Button 
                size="sm" 
                onClick={handleQuickRegister}
                variant={showRegisterForGuests ? "outline" : "default"}
              >
                <UserPlus className="w-4 h-4 mr-1" />
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
              >
                View Ticket
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EventCard;
