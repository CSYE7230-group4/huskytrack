import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { events } from "../data/events"; // replace when backend is integrated

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TEMP: using fake data
  const event = events.find((e) => e.id === Number(id));

  if (!event) {
    return <p className="text-center text-gray-500 mt-20">Event not found.</p>;
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
        src={event.image}
        alt={event.title}
        className="w-full h-72 object-cover rounded-xl shadow"
      />

      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">{event.type}</p>
        <h1 className="text-3xl font-semibold text-gray-900">
          {event.title}
        </h1>
        <p className="text-gray-600">{event.date}</p>
        <p className="text-gray-600">{event.time}</p>
        <p className="text-gray-600 font-medium">{event.location}</p>
      </div>

      {/* Full Description */}
      <div className="text-gray-700 leading-relaxed">
        {event.fullDescription}
      </div>

      {/* Organizer */}
      <p className="text-sm text-gray-500">
        <strong>Organizer:</strong> {event.organizer}
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button>Register for Event</Button>
        <Button variant="outline" onClick={() => navigate(`/app/events/${id}/edit`)}>
          Edit Event
        </Button>
      </div>
    </div>
  );
}
