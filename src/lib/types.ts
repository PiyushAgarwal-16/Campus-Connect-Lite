
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  category: string;
  organizer: {
    name: string;
    contact: string;
  };
  banner?: {
    url: string;
    generatedAt: string;
    prompt: string;
  };
}

export interface User {
  id: string;
  name:string;
  email: string;
  role: 'student' | 'organizer';
  studentId?: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}
