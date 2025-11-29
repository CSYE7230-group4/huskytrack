import api from "./api";

import { EventDto } from "../components/ui/EventCard";

export interface UserStats {
  attended: number;
  registered: number;
  bookmarked: number;
}

export interface DashboardNotification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  status: string;
  actionUrl?: string;
}

export interface CalendarData {
  start: string;
  end: string;
  dates: Record<string, number>;
}

export interface DashboardFeedResponse {
  upcomingEvents: EventDto[];
  bookmarks: EventDto[];
  recommendations: EventDto[];
  stats: UserStats;
  notifications: DashboardNotification[];
  calendar: CalendarData;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getDashboardFeed(): Promise<DashboardFeedResponse> {
  const res = await api.get<ApiResponse<DashboardFeedResponse>>("/dashboard/feed");

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Failed to load dashboard feed");
  }

  return res.data.data;
}


