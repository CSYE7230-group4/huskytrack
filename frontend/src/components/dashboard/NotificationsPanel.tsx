import { useNavigate } from "react-router-dom";
import DashboardWidget from "./DashboardWidget";
import { DashboardNotification } from "../../services/dashboardApi";

interface NotificationsPanelProps {
  notifications: DashboardNotification[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function NotificationsPanel({
  notifications,
  loading,
  error,
  onRefresh,
}: NotificationsPanelProps) {
  const navigate = useNavigate();
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <DashboardWidget
      title="Notifications"
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      {!hasNotifications ? (
        <p className="text-xs text-gray-500">No notifications.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {notifications.slice(0, 5).map((n) => (
            <li
              key={n._id}
              className="flex flex-col gap-0.5 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1.5"
              onClick={() => {
                if (n.actionUrl) {
                  navigate(n.actionUrl.startsWith("/") ? n.actionUrl : `/app${n.actionUrl}`);
                }
              }}
            >
              <span className="font-medium text-gray-900">{n.title}</span>
              <span className="text-gray-600">{n.message}</span>
              <span className="text-[10px] text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}


