// src/api/events.ts

import {
  EventFormValues,
  EventStatus,
  OrganizerEvent,
  OrganizerEventStatus,
  OrganizerStats,
  RecentRegistration,
} from "../types/events";

const API_BASE = "/api/v1/events";

/* =======================================================
   CREATE EVENT
   ======================================================= */
export async function createEvent(
  data: EventFormValues,
  status: EventStatus
) {
  const formData = buildEventFormData(data, status);

  const res = await fetch(API_BASE, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await safeError(res);
    throw new Error(error);
  }

  return res.json();
}

/* =======================================================
   UPDATE EVENT
   ======================================================= */
export async function updateEvent(
  id: string,
  data: EventFormValues,
  status: EventStatus
) {
  const formData = buildEventFormData(data, status);

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await safeError(res);
    throw new Error(error);
  }

  return res.json();
}

/* =======================================================
   GET EVENT BY ID
   ======================================================= */
export async function getEventById(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await safeError(res);
    throw new Error(error);
  }

  return res.json();
}

/* =======================================================
   ORGANIZER DASHBOARD — NEW (TASK 3.7)
   ======================================================= */

/**
 * Fetch organizer dashboard stats and recent registrations.
 */
export async function getOrganizerDashboardData(): Promise<{
  stats: OrganizerStats;
  recentRegistrations: RecentRegistration[];
}> {
  // Replace with real backend later:
  // const res = await fetch("/api/v1/organizer/dashboard", { credentials: "include" });
  // if (!res.ok) throw new Error(await safeError(res));
  // return res.json();

  // TEMP MOCK
  return {
    stats: {
      totalEvents: 3,
      totalAttendees: 89,
      upcomingEventsCount: 1,
      averageFillRate: 62,
    },
    recentRegistrations: [
      {
        id: "reg-1",
        attendeeName: "John Doe",
        eventId: "1",
        eventTitle: "Husky Welcome Meetup",
        registeredAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Fetch organizer's events list.
 */
export async function getOrganizerEvents(options?: {
  status?: OrganizerEventStatus;
  search?: string;
  sort?: "date" | "registrations" | "capacity";
}): Promise<OrganizerEvent[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.search) params.set("search", options.search);
  if (options?.sort) params.set("sort", options.sort);

  // Replace with real backend:
  // const res = await fetch(`/api/v1/organizer/events?${params}`, { credentials: "include" });
  // if (!res.ok) throw new Error(await safeError(res));
  // return res.json();

  // TEMP MOCK
  return [
    {
      id: "1",
      title: "Husky Welcome Meetup",
      category: "workshop",
      status: "published",
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(Date.now() + 3600_000).toISOString(),
      location: {
        venue: "Snell Library",
        address: "360 Huntington Ave",
      },
      capacity: 50,
      registrationsCount: 35,
      tags: ["welcome", "nusoc"],
    },
  ];
}

/**
 * Cancel event (status -> cancelled)
 */
export async function cancelEvent(id: string): Promise<void> {
  // Replace when backend ready:
  // const res = await fetch(`${API_BASE}/${id}/cancel`, {
  //   method: "POST",
  //   credentials: "include",
  // });
  // if (!res.ok) throw new Error(await safeError(res));

  console.log("Mock cancel event:", id);
}

/**
 * Delete event permanently.
 */
export async function deleteEvent(id: string): Promise<void> {
  // Replace with real backend later:
  // const res = await fetch(`${API_BASE}/${id}`, {
  //   method: "DELETE",
  //   credentials: "include",
  // });
  // if (!res.ok) throw new Error(await safeError(res));

  console.log("Mock delete event:", id);
}

/* =======================================================
   FormData Builder — HELPER
   ======================================================= */
function buildEventFormData(
  values: EventFormValues,
  status?: EventStatus
): FormData {
  const fd = new FormData();

  fd.append("title", values.title);
  fd.append("description", values.description);
  fd.append("category", values.category);

  // Tags: JSON
  fd.append("tags", JSON.stringify(values.tags));

  fd.append("startDate", values.startDate);
  fd.append("startTime", values.startTime);
  fd.append("endDate", values.endDate);
  fd.append("endTime", values.endTime);

  // Location object
  fd.append("location", JSON.stringify(values.location));

  if (values.capacity !== null && values.capacity !== undefined) {
    fd.append("capacity", String(values.capacity));
  }

  fd.append("requiresApproval", String(values.requiresApproval));

  if (status) {
    fd.append("status", status);
  }

  if (values.imageFile) {
    fd.append("image", values.imageFile);
  }

  return fd;
}

/* =======================================================
   Safe Error Helper
   ======================================================= */
async function safeError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.message || json.error || "Something went wrong";
  } catch {
    return await res.text();
  }
}
