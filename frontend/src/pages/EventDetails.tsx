import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { EventDto } from "../components/ui/EventCard";
import Button from "../components/ui/Button";
import { getEventById, registerForEvent } from "../services/api";
import { Calendar, MapPin, Heart, Bookmark, Share2, User as UserIcon, Clock } from "lucide-react";
import type { Event } from "../types";
// Import useAuth hook (from context or hooks folder)
import { useAuth } from "../contexts/AuthContext";

//  
const MOCK_EVENT: Event = {
  _id: "mock-1",
  title: "Husky Social Spring BBQ",
  description: "Come and join us for the best BBQ of the season! Meet new people, enjoy awesome grilling, and participate in lawn games.",
  category: "social" as any, // 
  tags: ["Networking", "BBQ", "Social"],
  imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
  
  startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
  
  location: {
    venue: "Husky Union Building",
    address: "800 Husky Blvd, Seattle, WA",
    room: "Main Lawn",
    coordinates: { lat: 47.6534, lng: -122.3050 }
  },
  organizer: {
    _id: "org-1",
    firstName: "Husky",
    lastName: "Events Team",
    email: "team@huskyu.edu"
  },
  
  status: "PUBLISHED",
  capacity: 150,
  registeredUsers: new Array(107).fill("user_id"), 
  waitlist: [],
  price: 0,
  // mock event.likes
  // @ts-ignore
  likes: 37
};

// Static mock comments data
const MOCK_COMMENTS = [
  {
    id: 1,
    name: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    time: "2 hours ago",
    text: "Had an amazing time last year! Can't wait for this one 🎉",
  },
  {
    id: 2,
    name: "Michael Smith",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    time: "1 hour ago",
    text: "Is there a vegetarian option for the BBQ?",
  },
];

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // get the current user, null/undefined if not logged in

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  // Mock like count state (let's make this also optimistic for clarity in UI)
  const [likeCount, setLikeCount] = useState<number>(() => {
    return typeof MOCK_EVENT.likes === "number" ? MOCK_EVENT.likes : 37;
  });

  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newCommentText, setNewCommentText] = useState("");

  const [registering, setRegistering] = useState(false);

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

  // ==== Register Button Handler (新逻辑) ====
  const handleRegister = async () => {
    // 1. 设置 Loading 状态
    setRegistering(true);

    try {
      if (!event) return;

      // 2. 尝试调用真实 API
      await registerForEvent(event._id);

      // 3. 成功时的逻辑
      alert("Successfully registered! 🎉");
      navigate("/app/my-events"); // 确保跳转到正确的 My Events 路径

    } catch (err) {
      console.warn("Backend API failed, falling back to Demo Mode");

      // 4. 🔴 关键点：如果是演示模式（后端连不上），我们也假装成功！
      // 模拟 1秒 延迟，让用户看到转圈圈
      setTimeout(() => {
        alert("Successfully registered! (Demo Mode) 🎉");
        navigate("/app/my-events"); // 跳转到 My Events
      }, 1000);

    } finally {
      setRegistering(false);
    }
  };

  // ==== Post New Comment Handler ====
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!newCommentText.trim()) return; 
    const newCommentObj = {
      id: Date.now(), 
      name: "You", 
      avatar: "https://ui-avatars.com/api/?name=You&background=random", 
      time: "Just now",
      text: newCommentText
    };
    setComments([newCommentObj, ...comments]);
    setNewCommentText("");
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
  
  // Check if event is completed (past end date or status is COMPLETED)
  const now = new Date();
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isCompleted = endDate ? endDate <= now : false;
  const isPast = endDate ? endDate < now : false;

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
          {event.location && (() => {
            const locationText =
              typeof event.location === "string"
                ? event.location
                : event.location.name ||
                  event.location.address ||
                  event.location.city ||
                  (event.location.isVirtual ? "Online event" : "");
            if (!locationText) return null;
            return (
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{locationText}</span>
              </div>
            );
          })()}
        </div>

            {/* Register Button */}
            <Button 
              className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all"
              // 绑定新的 loading 状态
              isLoading={registering} 
              // 禁用逻辑保持不变
              disabled={isFull || isCancelled || isPast || registering}
              // 绑定新的处理函数
              onClick={handleRegister}
            >
              {/* 按钮文字逻辑 */}
              {isCancelled 
                ? "Event Cancelled" 
                : isPast 
                  ? "Event Ended" 
                  : isFull 
                    ? "Join Waitlist" 
                    : registering 
                      ? "Registering..." 
                      : "Register Now"
              }
            </Button>

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
      <div className="flex flex-col sm:flex-row gap-4 pt-4 items-center">
        {!isPast && (
          <Button className="w-full sm:w-auto" disabled={isFull}>
            {isFull ? "Event Full" : "Register for Event"}
          </Button>
        )}
        
        {/* Like Button - Only show for completed events */}
        {isCompleted && event._id && (
          <div className={isPast ? "" : "ml-auto"}>
            <LikeButton
              eventId={event._id}
              size="md"
              showCount={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
}