import { EventFormValues, EventStatus } from "../types/events";

const API_BASE = "/api/v1/events";

// -------------------------
// CREATE EVENT
// -------------------------
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

// -------------------------
// UPDATE EVENT
// -------------------------
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

// -------------------------
// GET EVENT BY ID
// -------------------------
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

// -------------------------
// Build FormData (helper)
// -------------------------
function buildEventFormData(
  values: EventFormValues,
  status?: EventStatus
): FormData {
  const fd = new FormData();

  fd.append("title", values.title);
  fd.append("description", values.description);
  fd.append("category", values.category);

  // Tags as JSON string
  fd.append("tags", JSON.stringify(values.tags));

  fd.append("startDate", values.startDate);
  fd.append("startTime", values.startTime);
  fd.append("endDate", values.endDate);
  fd.append("endTime", values.endTime);

  // Location object → JSON string
  fd.append("location", JSON.stringify(values.location));

  if (values.capacity !== null && values.capacity !== undefined) {
    fd.append("capacity", String(values.capacity));
  }

  fd.append("requiresApproval", String(values.requiresApproval));

  if (status) {
    fd.append("status", status);
  }

  // Image file
  if (values.imageFile) {
    fd.append("image", values.imageFile);
  }

  return fd;
}

// -------------------------
// Safe error extraction helper
// -------------------------
async function safeError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.message || json.error || "Something went wrong";
  } catch {
    return await res.text();
  }
}
