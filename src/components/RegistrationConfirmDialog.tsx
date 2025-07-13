"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/lib/types";

interface RegistrationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onConfirm: () => void;
}

export function RegistrationConfirmDialog({
  open,
  onOpenChange,
  event,
  onConfirm,
}: RegistrationConfirmDialogProps) {
  if (!event) return null;

  const startDate = new Date(`${event.date}T${event.time}`);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>You are about to register for the following event:</p>
              
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                
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
              </div>
              
              <p className="text-sm text-muted-foreground">
                You will receive a digital ticket that you can use for entry.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Registration
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
