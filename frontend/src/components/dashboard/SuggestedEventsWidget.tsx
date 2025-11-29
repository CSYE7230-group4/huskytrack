import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWidget from "./DashboardWidget";
import { EventDto } from "../ui/EventCard";

interface SuggestedEventsWidgetProps {
  events: EventDto[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function SuggestedEventsWidget({
  events,
  loading,
  error,
  onRefresh,
}: SuggestedEventsWidgetProps) {
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visible = (events || []).filter((e) => e._id && !dismissedIds.has(e._id));

  const handleDismiss = (id?: string) => {
    if (!id) return;
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleInterested = (id?: string) => {
    if (!id) return;
    // For now just optimistic: keep it and maybe in future send feedback to backend
    // eslint-disable-next-line no-console
    console.log("User interested in recommendation", id);
  };

  const hasEvents = visible.length > 0;

  return (
    <DashboardWidget
      title="Suggested for you"
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      {!hasEvents ? (
        <p className="text-xs text-gray-500">
          No suggestions right now. Join some events to improve recommendations.
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {visible.slice(0, 10).map((event) => (
            <li
              key={event._id}
              className="border border-gray-100 rounded-lg p-2 hover:border-primary/50 transition"
            >
              <button
                type="button"
                className="text-left w-full"
                onClick={() => navigate(`/app/events/${event._id}`)}
              >
                <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                <p className="text-[11px] text-gray-500">
                  Based on your interests
                </p>
              </button>
              <div className="flex items-center justify-end gap-2 mt-1.5">
                <button
                  type="button"
                  className="text-[11px] text-gray-400 hover:text-gray-600"
                  onClick={() => handleDismiss(event._id)}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="text-[11px] text-primary hover:underline"
                  onClick={() => handleInterested(event._id)}
                >
                  Interested
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}


