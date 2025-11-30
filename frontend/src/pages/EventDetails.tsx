import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getEventById } from "../api/events";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await getEventById(id);
        setEvent(data);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to load event";
        console.error('[EventDetails] Error loading event:', {
          id,
          error: errorMessage,
          status: err?.response?.status,
          fullError: err
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const image =
    event?.imageUrl || event?.bannerImageUrl || "/placeholder-event.png";

  const startDate = event?.startDate ? new Date(event.startDate) : null;
  const endDate = event?.endDate ? new Date(event.endDate) : null;

  const formattedDate =
    startDate &&
    startDate.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formattedTime =
    startDate &&
    `${startDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })}${
      endDate
        ? ` – ${endDate.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}`
        : ""
    }`;

  const locationText =
    typeof event?.location === "string"
      ? event.location
      : event?.location?.name ||
        event?.location?.city ||
        event?.location?.address ||
        (event?.location?.isVirtual ? "Online event" : "");

  if (isLoading) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto space-y-4 text-center">
        <p className="text-gray-500">
          {error || "Event not found or is not accessible."}
        </p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-primary hover:underline"
      >
        ← Back
      </button>

      {/* Banner */}
      <img
        src={image}
        alt={event.title}
        className="w-full h-72 object-cover rounded-xl shadow"
      />

      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">
          {event.category || "Event"}
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          {event.title}
        </h1>
        {formattedDate && (
          <p className="text-gray-600">
            {formattedDate}
            {formattedTime && ` • ${formattedTime}`}
          </p>
        )}
        {locationText && (
          <p className="text-gray-600 font-medium">{locationText}</p>
        )}
      </div>

      {/* Full Description */}
      <div className="text-gray-700 leading-relaxed">
        {event.description}
      </div>

      {/* Organizer */}
      <p className="text-sm text-gray-500">
        <strong>Organizer:</strong>{" "}
        {event.organizer?.firstName
          ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`
          : "Organizer"}
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button>Register for Event</Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/events/${id}/edit`)}
        >
          Edit Event
        </Button>
      </div>
    </div>
  );
}
