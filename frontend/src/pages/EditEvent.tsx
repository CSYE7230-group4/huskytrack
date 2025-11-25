import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageWrapper from "../components/ui/PageWrapper";
import EventForm from "../components/events/EventForm";
import Skeleton from "../components/ui/Skeleton";

import { getEventById, updateEvent } from "../api/events";
import { EventFormValues } from "../types/events";
import { useToast } from "../hooks/useToast";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [initialValues, setInitialValues] = useState<EventFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  // Load event data first
  useEffect(() => {
    async function load() {
      try {
        const response = await getEventById(id!);

        const event = response.data || response;

        setInitialValues({
          title: event.title,
          description: event.description,
          category: event.category,
          tags: event.tags || [],

          startDate: event.startDate?.split("T")[0] || "",
          startTime: event.startDate?.split("T")[1]?.slice(0, 5) || "",

          endDate: event.endDate?.split("T")[0] || "",
          endTime: event.endDate?.split("T")[1]?.slice(0, 5) || "",

          location: {
            venue: event.location?.venue || "",
            address: event.location?.address || "",
            room: event.location?.room || "",
            latitude: event.location?.latitude ?? null,
            longitude: event.location?.longitude ?? null,
          },

          capacity: event.capacity ?? null,
          requiresApproval: event.requiresApproval ?? false,

          imageFile: null,
          imageUrl: event.imageUrl ?? undefined
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        showToast("Failed to load event", "error");
        navigate("/app/events");
      }
    }

    load();
  }, [id]);

  // SUBMIT HANDLER — FIXED TYPE
  async function handleSubmit(
    values: EventFormValues,
    action: "draft" | "publish"
  ) {
    try {
      await updateEvent(id!, values, action);

      showToast("Event updated successfully!", "success");

      navigate(`/app/events/${id}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Update failed", "error");
    }
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

      {loading || !initialValues ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      ) : (
        <EventForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      )}
    </PageWrapper>
  );
}
