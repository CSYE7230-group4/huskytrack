export type EventStatus = "draft" | "published";

export type EventCategory =
  | "workshop"
  | "seminar"
  | "cultural"
  | "sports";

export interface EventLocation {
  venue: string;
  address: string;
  room?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface EventFormValues {
  id?: string;

  title: string;
  description: string; // HTML from TipTap

  category: EventCategory | "";
  tags: string[];

  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;

  location: EventLocation;

  capacity: number | null;
  requiresApproval: boolean;

  imageFile?: File | null;
  imageUrl?: string;

  status?: EventStatus;
}
