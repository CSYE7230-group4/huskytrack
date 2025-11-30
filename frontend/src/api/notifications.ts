/**
 * Notification API Service
 * API calls for notification operations
 */

import api from "../services/api";
import {
  Notification,
  NotificationResponse,
  UnreadCountResponse,
  NotificationFilters,
} from "../types/notifications";

const API_BASE = "/notifications";

/**
 * Get notifications for the authenticated user
 */
export async function getNotifications(
  filters?: NotificationFilters,
  signal?: AbortSignal
): Promise<NotificationResponse> {
  try {
    const params = new URLSearchParams();

    if (filters?.isRead !== undefined) {
      params.append("isRead", String(filters.isRead));
    }
    if (filters?.type) {
      params.append("type", filters.type);
    }
    if (filters?.page) {
      params.append("page", String(filters.page));
    }
    if (filters?.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}/me?${queryString}` : `${API_BASE}/me`;

    const res = await api.get(url, { signal });
    const payload = res.data;

    if (!payload?.success) {
      throw new Error(payload?.message || "Failed to fetch notifications");
    }

    // Map notifications and ensure isRead property exists
    // Normalize event field - backend may return 'event' but API docs show 'relatedEventId'
    const notifications: Notification[] = (payload.data?.notifications || []).map((n: any) => {
      // Handle both 'event' and 'relatedEventId' fields
      const eventId = n.relatedEventId || n.event;
      
      return {
        ...n,
        relatedEventId: eventId,
        isRead: n.status === "READ" || n.isRead === true,
      };
    });

    return {
      notifications,
      pagination: payload.data?.pagination,
    };
  } catch (err: any) {
    throw new Error(err?.message || "Failed to fetch notifications");
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const res = await api.get(`${API_BASE}/unread/count`);
    const payload = res.data;

    if (!payload?.success) {
      throw new Error(payload?.message || "Failed to fetch unread count");
    }

    return payload.data?.unreadCount || 0;
  } catch (err: any) {
    throw new Error(err?.message || "Failed to fetch unread count");
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  try {
    const res = await api.patch(`${API_BASE}/${notificationId}/read`);
    const payload = res.data;

    if (!payload?.success) {
      throw new Error(payload?.message || "Failed to mark notification as read");
    }

    const notification = payload.data?.notification || payload.data;
    return {
      ...notification,
      isRead: true,
      status: "READ",
    };
  } catch (err: any) {
    throw new Error(err?.message || "Failed to mark notification as read");
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<number> {
  try {
    const res = await api.patch(`${API_BASE}/read-all`);
    const payload = res.data;

    if (!payload?.success) {
      throw new Error(payload?.message || "Failed to mark all notifications as read");
    }

    return payload.data?.updatedCount || 0;
  } catch (err: any) {
    throw new Error(err?.message || "Failed to mark all notifications as read");
  }
}
