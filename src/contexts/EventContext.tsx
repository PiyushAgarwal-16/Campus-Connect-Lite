
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import type { Event } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, where } from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  loading: boolean;
  addEvent: (newEventData: Omit<Event, 'id' | 'organizer'>) => Promise<void>;
  updateEvent: (eventId: string, updatedData: Partial<Omit<Event, 'id' | 'organizer'>>) => Promise<void>;
  exportAttendeeData: (eventId: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    console.log("Fetching events from Firestore...");
    try {
      const eventsCollection = collection(db, 'events');
      const q = query(eventsCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log("Query snapshot size:", querySnapshot.size);
      
      const fetchedEvents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Event data:", { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data,
        };
      }) as Event[];
      
      console.log("Total fetched events:", fetchedEvents.length);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (newEventData: Omit<Event, 'id' | 'organizer'>) => {
    if (!user || user.role !== 'organizer') {
      console.error("Only organizers can add events.");
      return;
    }
    
    console.log("Attempting to add event:", newEventData);
    console.log("User:", user);
    
    try {
      const newEvent = {
        ...newEventData,
        organizer: {
          name: user.name,
          contact: user.email,
        },
      };
      
      console.log("New event object:", newEvent);
      const docRef = await addDoc(collection(db, 'events'), newEvent);
      console.log("Event added successfully with ID:", docRef.id);
      
      // After adding, refetch all events to update the list for all users
      await fetchEvents();
    } catch (error) {
      console.error("Error adding event to Firestore:", error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  const updateEvent = async (eventId: string, updatedData: Partial<Omit<Event, 'id' | 'organizer'>>) => {
    if (!user || user.role !== 'organizer') {
      console.error("Only organizers can update events.");
      return;
    }

    const eventToUpdate = events.find(event => event.id === eventId);
    if (!eventToUpdate) {
      console.error("Event not found.");
      return;
    }

    // Check if the current user is the organizer of this event
    if (eventToUpdate.organizer.contact !== user.email) {
      console.error("You can only edit events that you created.");
      throw new Error("You can only edit events that you created.");
    }
    
    console.log("Attempting to update event:", eventId, updatedData);
    
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, updatedData);
      console.log("Event updated successfully with ID:", eventId);
      
      // After updating, refetch all events to update the list for all users
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event in Firestore:", error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  const exportAttendeeData = async (eventId: string) => {
    if (!user || user.role !== 'organizer') {
      console.error("Only organizers can export attendee data.");
      return;
    }

    const eventToExport = events.find(event => event.id === eventId);
    if (!eventToExport) {
      console.error("Event not found.");
      return;
    }

    // Check if the current user is the organizer of this event
    if (eventToExport.organizer.contact !== user.email) {
      console.error("You can only export data for events that you created.");
      throw new Error("You can only export data for events that you created.");
    }

    // Check if event is concluded
    const eventDateTime = new Date(`${eventToExport.date} ${eventToExport.endTime || eventToExport.time}`);
    const currentTime = new Date();
    if (currentTime < eventDateTime) {
      throw new Error("Event has not concluded yet. Attendee data can only be exported after the event ends.");
    }
    
    console.log("Attempting to export attendee data for event:", eventId);
    
    try {
      // Fetch registrations for this event
      const registrationsQuery = query(
        collection(db, 'registrations'), 
        where('eventId', '==', eventId)
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);
      
      // Fetch user details for attendees
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      // Combine registration and user data
      const attendeeData = registrationsSnapshot.docs
        .filter(doc => doc.data().checkedIn === true) // Only confirmed attendees
        .map(doc => {
          const registration = doc.data();
          const user = usersMap.get(registration.userId);
          return {
            name: user?.name || 'Unknown',
            email: user?.email || 'Unknown',
            studentId: user?.studentId || 'N/A',
            registrationDate: registration.registrationDate,
            checkedInAt: registration.checkedInAt || 'Not specified',
            eventTitle: eventToExport.title,
            eventDate: eventToExport.date,
            eventTime: eventToExport.time,
            location: eventToExport.location
          };
        });

      if (attendeeData.length === 0) {
        throw new Error("No confirmed attendees found for this event.");
      }

      // Create CSV content
      const csvHeaders = [
        'Name',
        'Email', 
        'Student ID',
        'Registration Date',
        'Checked In At',
        'Event Title',
        'Event Date',
        'Event Time',
        'Location'
      ];
      
      const csvContent = [
        csvHeaders.join(','),
        ...attendeeData.map(attendee => [
          `"${attendee.name}"`,
          `"${attendee.email}"`,
          `"${attendee.studentId}"`,
          `"${attendee.registrationDate}"`,
          `"${attendee.checkedInAt}"`,
          `"${attendee.eventTitle}"`,
          `"${attendee.eventDate}"`,
          `"${attendee.eventTime}"`,
          `"${attendee.location}"`
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${eventToExport.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees_${eventToExport.date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Attendee data exported successfully");
      
    } catch (error) {
      console.error("Error exporting attendee data:", error);
      throw error;
    }
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  return (
    <EventContext.Provider value={{ events, loading, addEvent, updateEvent, exportAttendeeData, getEventById }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
