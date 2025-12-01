// =============================
// Common Enums & Sub-types
// =============================

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type EventCategory = "workshop" | "seminar" | "cultural" | "sports" | "other";

export interface EventLocation {
  venue: string;
  address: string;
  room?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventOrganizer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email?: string;
}

// =============================
// Main Event Entity
// =============================
export interface Event {
  _id: string;
  title: string;
  description: string;

  category: EventCategory;
  tags: string[];
  imageUrl?: string;

  startDate: string; // ISO string (e.g., "2024-05-10T12:00:00Z")
  endDate: string;   // ISO string

  location: EventLocation;
  organizer: EventOrganizer;

  status: EventStatus;

  // Capacity & Registration Info
  capacity: number;
  registeredUsers: string[]; // array of user IDs
  waitlist: string[];        // array of user IDs

  // Event interaction fields (used in EventDetails and UI)
  price: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
  likes?: number;
}