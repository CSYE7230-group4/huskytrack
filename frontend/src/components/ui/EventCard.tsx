import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <Link
      to={`/app/events/${event.id}`}
      tabIndex={0}
      aria-label={`Open details for ${event.title}`}
      className="block hover-lift focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <img
        src={event.image}
        alt={`Event: ${event.title}`}
        className="h-48 w-full object-cover rounded-t-xl"
      />

      <div className="p-4 space-y-1">
        <p className="text-xs font-medium text-gray-400">{event.type}</p>
        <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
        <p className="text-sm text-gray-500">{event.date}</p>
      </div>
    </Link>
  );
}
