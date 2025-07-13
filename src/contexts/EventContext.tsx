
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import type { Event } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  loading: boolean;
  addEvent: (newEventData: Omit<Event, 'id' | 'organizer'>) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const eventsCollection = collection(db, 'events');
      const q = query(eventsCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
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
    
    try {
      const newEvent = {
        ...newEventData,
        organizer: {
          name: user.name,
          contact: user.email,
        },
      };
      await addDoc(collection(db, 'events'), newEvent);
      // After adding, refetch all events to update the list for all users
      await fetchEvents();
    } catch (error)
      {
      console.error("Error adding event to Firestore:", error);
    }
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  return (
    <EventContext.Provider value={{ events, loading, addEvent, getEventById }}>
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
