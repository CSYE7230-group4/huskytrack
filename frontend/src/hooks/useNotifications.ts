/**
 * useNotifications Hook
 * Manages notification state, fetching, polling, and mark as read functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Notification,
  NotificationFilters,
} from "../types/notifications";
import {
  getNotifications as fetchNotificationsApi,
  getUnreadCount as fetchUnreadCountApi,
  markNotificationAsRead as markAsReadApi,
  markAllNotificationsAsRead as markAllAsReadApi,
} from "../api/notifications";
import { useToast } from "./useToast";

const POLLING_INTERVAL = 30000; // 30 seconds
const DEFAULT_LIMIT = 20;

interface UseNotificationsOptions {
  autoFetch?: boolean;
  pollingEnabled?: boolean;
  limit?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isOpen: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  } | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toggleNotificationCenter: () => void;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    autoFetch = true,
    pollingEnabled = true,
    limit = DEFAULT_LIMIT,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  } | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { error: showErrorToast } = useToast();

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(
    async (filters?: NotificationFilters, append: boolean = false) => {
      // Prevent duplicate requests
      if (!append && fetchingRef.current) {
        return;
      }

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        fetchingRef.current = true;
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsFetching(true);
        }
        setError(null);

        const response = await fetchNotificationsApi(
          {
            ...filters,
            limit: filters?.limit || limit,
          },
          abortController.signal
        );

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Map and ensure isRead property
        const mappedNotifications = response.notifications.map((n) => ({
          ...n,
          isRead: n.status === "READ" || n.isRead === true,
        }));

        if (append) {
          // Append to existing notifications
          setNotifications((prev) => [...prev, ...mappedNotifications]);
        } else {
          // Replace notifications
          setNotifications(mappedNotifications);
        }

        // Update pagination state
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.totalCount,
            hasMore: response.pagination.currentPage < response.pagination.totalPages,
          });
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        const errorMessage = err?.message || "Failed to fetch notifications";
        setError(errorMessage);
        console.error("Error fetching notifications:", err);
      } finally {
        fetchingRef.current = false;
        setIsFetching(false);
        setIsLoadingMore(false);
        setIsLoading(false);
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [limit]
  );

  /**
   * Load more notifications (next page)
   */
  const loadMoreNotifications = useCallback(async () => {
    if (!pagination?.hasMore || isLoadingMore) {
      return;
    }

    const nextPage = (pagination.currentPage || 1) + 1;
    await fetchNotifications({ page: nextPage, limit }, true);
  }, [pagination, isLoadingMore, fetchNotifications, limit]);

  /**
   * Fetch unread count from API
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCountApi();
      setUnreadCount(count);
    } catch (err: any) {
      console.error("Error fetching unread count:", err);
      // Don't show error toast for polling failures, just log
    }
  }, []);

  /**
   * Mark a notification as read (optimistic update)
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId
            ? { ...n, isRead: true, status: "READ" as const }
            : n
        )
      );

      const previousUnreadCount = unreadCount;
      if (previousUnreadCount > 0) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await markAsReadApi(notificationId);
        // Refresh unread count to ensure accuracy
        await fetchUnreadCount();
      } catch (err: any) {
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId
              ? {
                  ...n,
                  isRead: n.status === "READ",
                  status: n.status,
                }
              : n
          )
        );
        setUnreadCount(previousUnreadCount);

        const errorMessage = err?.message || "Failed to mark notification as read";
        showErrorToast(errorMessage);
        console.error("Error marking notification as read:", err);
      }
    },
    [unreadCount, fetchUnreadCount, showErrorToast]
  );

  /**
   * Mark all notifications as read (optimistic update)
   */
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, status: "READ" as const }))
    );
    setUnreadCount(0);

    try {
      await markAllAsReadApi();
      // Refresh to ensure accuracy
      await fetchUnreadCount();
      // Refresh notifications from first page to get updated readAt timestamps
      await fetchNotifications({ page: 1, limit }, false);
    } catch (err: any) {
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);

      const errorMessage = err?.message || "Failed to mark all notifications as read";
      showErrorToast(errorMessage);
      console.error("Error marking all notifications as read:", err);
    }
  }, [notifications, unreadCount, fetchNotifications, fetchUnreadCount, showErrorToast]);

  /**
   * Toggle notification center open/closed
   */
  const toggleNotificationCenter = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Open notification center
   */
  const openNotificationCenter = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close notification center
   */
  const closeNotificationCenter = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Refresh notifications (resets to first page)
   */
  const refreshNotifications = useCallback(async () => {
    setPagination(null);
    await Promise.all([fetchNotifications({ page: 1, limit }), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount, limit]);

  /**
   * Initialize: fetch notifications and unread count (only once on mount)
   */
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (autoFetch && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      Promise.all([fetchNotifications(), fetchUnreadCount()]);
    }
    
    // Cleanup: cancel any in-flight requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      fetchingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Only run once on mount if autoFetch is true

  /**
   * Set up polling for unread count
   */
  useEffect(() => {
    if (!pollingEnabled) {
      return;
    }

    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up new interval
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingEnabled]); // Removed fetchUnreadCount from deps to prevent interval recreation

  /**
   * Fetch notifications when notification center opens (if empty)
   */
  useEffect(() => {
    if (isOpen && notifications.length === 0 && !isFetching && !fetchingRef.current) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, notifications.length, isFetching]); // Removed fetchNotifications from deps to prevent re-runs

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    isLoadingMore,
    error,
    isOpen,
    pagination,
    fetchNotifications,
    loadMoreNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    toggleNotificationCenter,
    openNotificationCenter,
    closeNotificationCenter,
    refreshNotifications,
  };
}
