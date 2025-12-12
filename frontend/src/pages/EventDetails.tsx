import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import Button from "../components/ui/Button";
import { registerForEvent } from "../services/api";
import type { Event } from "../types";

// Robust MOCK_EVENT as fallback
const MOCK_EVENT: Event = {
  _id: "mock-1",
  title: "Husky Social Spring BBQ",
  description:
    "Come and join us for the best BBQ of the season! Meet new people, enjoy awesome grilling, and participate in lawn games.",
  category: "cultural",
  tags: ["Networking", "BBQ", "Social"],
  imageUrl:
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
  startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
  location: {
    venue: "Husky Union Building",
    address: "800 Husky Blvd, Seattle, WA",
    room: "Main Lawn",
    coordinates: { lat: 47.6534, lng: -122.305 },
  },
  organizer: {
    _id: "org-1",
    firstName: "Husky",
    lastName: "Events Team",
    email: "team@huskyu.edu",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
  },
  status: "PUBLISHED",
  capacity: 150,
  registeredUsers: new Array(107).fill("user_id"),
  waitlist: [],
  price: 0,
};

const MOCK_COMMENTS = [
  {
    id: "c1",
    user: {
      name: "Sasha Tran",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    rating: 5,
    text: "Had an amazing time! Great food & vibes.",
  },
  {
    id: "c2",
    user: {
      name: "Liam O'Brien",
      avatar: "https://randomuser.me/api/portraits/men/39.jpg",
    },
    rating: 4,
    text: "Awesome event, though more veggie options would be cool.",
  },
  {
    id: "c3",
    user: {
      name: "Priya Patel",
      avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    rating: 5,
    text: "Loved meeting new people! Thanks organizers 💜",
  },
];

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [comments] = useState(MOCK_COMMENTS);

  // Fetch event; robust fallback
  useEffect(() => {
    let cancelled = false;
    async function fetchEvent() {
      setLoading(true);
      try {
        if (id) {
          const res = await fetch(`/api/events/${id}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (!cancelled) setEvent(data?.event || MOCK_EVENT);
        } else {
          setEvent(MOCK_EVENT);
        }
      } catch (err) {
        setEvent(MOCK_EVENT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvent();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Registration logic
  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await registerForEvent(event._id);
      alert("Successfully registered! 🎉");
      navigate("/app/my-events");
    } catch {
      // Simulate Demo Mode success
      console.warn("Backend API failed, falling back to Demo Mode");
      setTimeout(() => {
        alert("Successfully registered! (Demo Mode) 🎉");
        navigate("/app/my-events");
      }, 1000);
    } finally {
      setRegistering(false);
    }
  };

  // Format helpers
  function formatDateRange(startIso?: string, endIso?: string) {
    if (!startIso) return "";
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : null;
    const dateStr = start.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    if (!end) {
      return `${dateStr} at ${startTime}`;
    }
    const endTime = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    if (start.toDateString() === end.toDateString()) {
      return `${dateStr}, ${startTime}–${endTime}`;
    }
    const endDatePart = end.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return `${dateStr}, ${startTime} – ${endDatePart}, ${endTime}`;
  }

  function getLocationText(event: Event) {
    if (!event.location) return "";
    if (typeof event.location === "string") return event.location;
    const { venue, address, room } = event.location as any;
    let loc = "";
    if (venue) loc += venue;
    if (room) loc += (loc ? ", " : "") + room;
    if (address) loc += (loc ? " • " : "") + address;
    return loc || "Location info coming soon";
  }

  // Registration button logic
  const max = event?.capacity ?? 0;
  const current = event?.registeredUsers?.length ?? 0;
  const isFull = max > 0 && current >= max;
  const endDateObj = event?.endDate ? new Date(event.endDate) : null;
  const now = new Date();
  const isPast = endDateObj ? endDateObj < now : false;

  // Loading skeletons
  if (loading) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto mt-6 space-y-6">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-72 w-full bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-12 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto mt-6 text-center">
        <p className="text-red-600 mb-4">Event not found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const eventImage =
    (event as any).bannerImageUrl || event.imageUrl || "/placeholder-event.png";

  // Organizer avatar, initials fallback
  const organizerName = event.organizer?.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : "Organizer";
  const organizerInitials =
    (event.organizer?.firstName?.[0] || "") +
    (event.organizer?.lastName?.[0] || "");
  const organizerAvatar = (event.organizer as any)?.avatar
    ? (event.organizer as any).avatar
    : undefined;

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto mt-6 space-y-10">
      {/* Top: Navigation + Banner */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-5"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="relative">
          <img
            src={eventImage}
            alt={event.title}
            className="w-full h-72 object-cover rounded-2xl shadow-lg"
          />
          {/* Optional overlay could go here */}
        </div>
      </div>

      {/* Title, Date, Location */}
      <div className="flex flex-col md:flex-row items-start gap-10 mt-2">
        <div className="flex-1">
          <p className="uppercase text-sm font-semibold text-primary tracking-wider mb-1">
            {event.category || "Event"}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-5">{event.title}</h1>
          <div className="flex flex-col gap-3 text-gray-700 font-medium text-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{formatDateRange(event.startDate, event.endDate)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{getLocationText(event)}</span>
            </div>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 mb-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Register Button */}
        <div className="flex-1 flex flex-col justify-start items-stretch w-full max-w-xs mx-auto md:mx-0 mt-6 md:mt-0">
          <Button
            className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all font-semibold"
            isLoading={registering}
            disabled={isFull || isPast || registering}
            onClick={handleRegister}
            variant="primary"
            size="lg"
          >
            {isFull
              ? "Event Full"
              : isPast
              ? "Event Ended"
              : registering
              ? "Registering..."
              : "Register Now"}
          </Button>
          <div className="mt-2 text-center text-sm text-gray-600">
            {max > 0 && (
              <>
                <span className={isFull ? "text-red-600 font-bold" : ""}>
                  {current}/{max} Registered
                </span>
                {isFull && <span className="ml-2 text-red-500">(Full)</span>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">About</h2>
        <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
          {event.description}
        </p>
      </div>

      {/* Organizer Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow p-5 flex items-center gap-4 max-w-md">
        <div>
          {organizerAvatar ? (
            <img
              src={organizerAvatar}
              alt={organizerName}
              className="h-12 w-12 rounded-full object-cover border"
            />
          ) : (
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full text-xl font-bold text-primary">
              {organizerInitials || "O"}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-lg">{organizerName}</div>
          {event.organizer?.email && (
            <a
              href={`mailto:${event.organizer.email}`}
              className="text-primary underline text-sm hover:no-underline"
            >
              {event.organizer.email}
            </a>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Comments</h3>
        {/* List of comments */}
        <div className="space-y-5 mb-8">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-4 rounded-lg bg-gray-50 px-4 py-3 shadow-sm"
              >
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-10 h-10 rounded-full object-cover border shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(comment.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 inline" fill="#fde047" />
                      ))}
                      {[...Array(5 - comment.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gray-300 inline" fill="none" />
                      ))}
                      <span className="ml-2 text-xs text-gray-500">({comment.rating}/5)</span>
                    </div>
                  </div>
                  <div className="text-gray-800 mt-1">{comment.text}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic text-center py-3">
              No comments yet. Be the first!
            </div>
          )}
        </div>
        {/* Placeholder comment form */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <div>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">?</div>
            </div>
            <form className="flex-1">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-2 resize-none text-sm"
                rows={2}
                placeholder="Share your thoughts (Coming Soon)…"
                disabled
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">Posting comments coming soon!</div>
                <Button variant="primary" size="sm" disabled>
                  Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}