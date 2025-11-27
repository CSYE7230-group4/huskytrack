import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { getEventById } from "../services/api";
import { Calendar, MapPin, Heart, Bookmark, Share2, User as UserIcon, Clock } from "lucide-react";
import type { Event } from "../types";

//  
const MOCK_EVENT: Event = {
  _id: "mock-1",
  title: "Husky Social Spring BBQ",
  description: "Come and join us for the best BBQ of the season! Meet new people, enjoy awesome grilling, and participate in lawn games.",
  category: "social" as any, // 
  tags: ["Networking", "BBQ", "Social"],
  imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
  
  startDate: "2024-05-10T12:00:00.000Z",
  endDate: "2024-05-10T16:00:00.000Z",
  
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

  useEffect(() => {
    if (event) {
      setIsSaved(event.isBookmarked || false);

      // Use event.likes if present, fall back to mock
      // @ts-ignore
      setLikeCount(typeof event.likes === "number" ? event.likes : 37);
    }
  }, [event]);

  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error("No ID provided");
        const data = await getEventById(id);
        if (isMounted) setEvent(data);
      } catch (err) {
        console.error("Failed to fetch event, utilizing mock:", err);
        if (isMounted) setEvent(MOCK_EVENT);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvent();
    return () => { isMounted = false; };
  }, [id]);

  // ==== Optimistic Save/Like Handler ====
  const handleSave = () => {
    const newIsSaved = !isSaved;

    setIsSaved(newIsSaved);
    setLikeCount(prevCount => newIsSaved ? prevCount + 1 : prevCount - 1);

    // api.toggleLike(event.id); 
  };

  // ==== Share Button Handler ====
  const handleShare = async () => {
    const shareData = {
      title: event?.title || "Event",
      text: `Check out this event: ${event?.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!"); 
      }
    } catch (err) {
      console.error("Error sharing:", err);
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
  };

  const formatTime = (start: string, end: string) => {
    const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const e = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${s} - ${e}`;
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!event) return <div className="text-center p-20">Event not found</div>;

  const spotsTaken = event.registeredUsers ? event.registeredUsers.length : 0;
  const spotsLeft = Math.max(0, event.capacity - spotsTaken);
  const isFull = spotsLeft === 0;
  const isCancelled = event.status === "CANCELLED";
  const isPast = new Date(event.endDate) < new Date();
  const organizerName = `${event.organizer.firstName} ${event.organizer.lastName}`;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(event.location.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="relative h-80 w-full bg-gray-900">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        )}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-full">
              {event.category}
            </span>
            <h1 className="text-4xl font-bold text-white drop-shadow-md">{event.title}</h1>
          </div>
        </div>
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/90 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition shadow">
          ← Back
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-8 relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About this Event</h2>
            <div className="prose text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
            
            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Location
            </h3>
            <p className="text-gray-600 mb-4">{event.location.venue}, {event.location.address}</p>
            <iframe
              title="map"
              width="100%"
              height="300"
              frameBorder="0"
              src={mapSrc}
              className="rounded-lg bg-gray-100"
            />
          </div>

          {/* Organizer */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {event.organizer.firstName[0]}
            </div>
            <div>
              <p className="text-sm text-gray-500">Organized by</p>
              <p className="font-bold text-gray-900">{organizerName}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">Contact</Button>
          </div>

          {/* Comments Preview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-2">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mr-3">Comments</h3>
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                {comments.length}
              </span>
            </div>
            <form className="flex gap-3 mb-6" onSubmit={handlePostComment}>
              <img
                src="https://ui-avatars.com/api/?name=You&background=random"
                alt="You"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
              />
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary transition"
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                maxLength={200}
              />
              <Button
                type="submit"
                disabled={!newCommentText.trim()}
                className="h-9 px-4"
                size="sm"
              >
                Post
              </Button>
            </form>
            <div className="space-y-4">
              {comments.slice(0,2).map(comment => (
                <div
                  key={comment.id}
                  className="flex gap-3 items-start animate-fadeIn"
                  style={{
                    animation: "fadeIn 0.4s",
                  }}>
                  <img
                    src={comment.avatar}
                    alt={comment.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-700">{comment.name}</span>
                      <span className="text-xs text-gray-400">· {comment.time}</span>
                    </div>
                    <div className="text-gray-600 text-sm">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-6 border-t border-gray-100">
              <button
                className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
                type="button"
                onClick={() => alert("This feature will navigate to a dedicated discussion page in the full version.")}
              >
                View all comments <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
            {/* Date & Time */}
            <div className="flex gap-4 mb-6">
              <div className="p-3 bg-indigo-50 rounded-lg text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{formatDate(event.startDate)}</p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(event.startDate, event.endDate)}
                </p>
              </div>
            </div>

            <hr className="border-gray-100 my-4" />

            {/* Capacity Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Capacity</span>
                <span className="text-primary font-bold">{spotsLeft} spots left</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (spotsTaken / event.capacity) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all"
              disabled={isFull || isCancelled || isPast}
            >
              {isCancelled ? "Event Cancelled" : isPast ? "Event Ended" : isFull ? "Join Waitlist" : "Register Now"}
            </Button>

            {/* Social Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                className={`flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition ${
                  isSaved ? "bg-indigo-50 border-primary text-primary" : ""
                }`}
                onClick={handleSave}
                aria-pressed={isSaved}
              >
                <Heart className="w-4 h-4" fill={isSaved ? "#6366f1" : "none"} />
                {isSaved ? `Saved (${likeCount})` : `Save (${likeCount})`}
              </button>
              <button
                className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}