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
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import type { Event } from "@/lib/types";
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(`${event.date}T${event.time}`);

  return (
    <Link href={`/events/${event.id}`} className="group">
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
            <Badge className="absolute top-2 right-2" variant="secondary">{event.category}</Badge>
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
        <CardFooter>
            <Button variant="link" className="p-0 h-auto group-hover:text-primary">
              View Details <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EventCard;
