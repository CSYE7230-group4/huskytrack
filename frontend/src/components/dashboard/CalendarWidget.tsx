import DashboardWidget from "./DashboardWidget";
import { CalendarData } from "../../services/dashboardApi";

interface CalendarWidgetProps {
  calendar: CalendarData | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function CalendarWidget({
  calendar,
  loading,
  error,
  onRefresh,
}: CalendarWidgetProps) {
  const dates = calendar?.dates ?? {};

  const entries = Object.entries(dates).sort(([a], [b]) => (a < b ? -1 : 1));

  return (
    <DashboardWidget title="Calendar" loading={loading} error={error} onRefresh={onRefresh}>
      {entries.length === 0 ? (
        <p className="text-xs text-gray-500">
          No upcoming events in your calendar window.
        </p>
      ) : (
        <ul className="space-y-1 text-xs">
          {entries.map(([date, count]) => (
            <li
              key={date}
              className="flex items-center justify-between rounded-md px-2 py-1 bg-gray-50"
            >
              <span className="text-gray-800">
                {new Date(date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-[11px] text-gray-500">
                {count} event{count === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}


