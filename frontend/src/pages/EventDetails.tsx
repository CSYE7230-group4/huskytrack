import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { EventDto } from "../components/ui/EventCard";
import Button from "../components/ui/Button";
import BookmarkButton from "../components/ui/BookmarkButton";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../hooks/useToast";

interface EventDetailsData extends EventDto {
  organizer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: string;
  };
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [event, setEvent] = useState<EventDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Event ID is required");
      setIsLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get<{ success: boolean; data: { event: EventDetailsData } }>(
          `/events/${id}`
        );

        setEvent(response.data.data.event);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Failed to load event";
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return "";
    const startDate = new Date(start);
    const datePart = startDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (!end) {
      const time = startDate.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${datePart} at ${time}`;
    }

    const endDate = new Date(end);
    const startTime = startDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${datePart} from ${startTime} to ${endTime}`;
  };

  if (isLoading) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto mt-6 space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto mt-6 text-center">
        <p className="text-red-600 mb-4">{error || "Event not found"}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const image = event.bannerImageUrl || event.imageUrl || "/placeholder-event.png";
  const max = event.maxRegistrations ?? 0;
  const current = event.currentRegistrations ?? 0;
  const hasCapacity = max > 0;
  const spotsRemaining = hasCapacity ? Math.max(max - current, 0) : null;
  const isFull = hasCapacity && spotsRemaining === 0;

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto mt-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Banner Image with Bookmark Button */}
      <div className="relative">
        <img
          src={image}
          alt={event.title}
          className="w-full h-72 object-cover rounded-xl shadow-md"
        />
        {event._id && (
          <div className="absolute top-4 right-4">
            <BookmarkButton
              eventId={event._id}
              size="lg"
              showCount={true}
            />
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            {event.category || "Event"}
          </p>
          <div className="flex items-start justify-between gap-4 mt-2">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {event.startDate && (
            <div className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDateRange(event.startDate, event.endDate)}</span>
            </div>
          )}
          {event.location && (
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Capacity */}
        {hasCapacity && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">
            <Users className="h-4 w-4" />
            <span>
              {isFull
                ? "No spots left"
                : `${spotsRemaining} / ${max} spots remaining`}
            </span>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Event Description */}
      {event.description && (
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">About this event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      )}

      {/* Organizer */}
      {event.organizer && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Organizer:</strong>{" "}
            {event.organizer.firstName} {event.organizer.lastName}
            {event.organizer.university && ` • ${event.organizer.university}`}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button className="w-full sm:w-auto" disabled={isFull}>
          {isFull ? "Event Full" : "Register for Event"}
        </Button>
      </div>
    </div>
  );
}
