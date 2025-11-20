import { useParams, useNavigate } from "react-router-dom";
import { events } from "../data/events";
import Button from "../components/ui/Button";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find((e) => e.id === Number(id));

  if (!event) {
    return <p className="text-center text-gray-500 mt-20">Event not found.</p>;
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto mt-6 space-y-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-primary hover:underline"
      >
        ← Back
      </button>

      {/* Banner Image */}
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-72 object-cover rounded-xl shadow-md"
      />

      {/* Event Info */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">{event.type}</p>
        <h1 className="text-3xl font-semibold text-gray-900">{event.title}</h1>
        <p className="text-gray-600">{event.date}</p>
        <p className="text-gray-600">{event.time}</p>
        <p className="text-gray-600 font-medium">{event.location}</p>
      </div>

      {/* Event Description */}
      <div className="text-gray-700 leading-relaxed">
        {event.fullDescription}
      </div>

      {/* Organizer */}
      <p className="text-sm text-gray-500">
        <strong>Organizer:</strong> {event.organizer}
      </p>

      <Button className="w-full md:w-auto">Register for Event</Button>
    </div>
  );
}
