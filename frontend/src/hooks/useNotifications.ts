/**
 * useNotifications Hook
 * Manages notification state, fetching, polling, and mark as read functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Notification,
  NotificationFilters,
  NotificationStatus,
} from "../types/notifications";
import {
  getNotifications as fetchNotificationsApi,
  getUnreadCount as fetchUnreadCountApi,
  markNotificationAsRead as markAsReadApi,
  markAllNotificationsAsRead as markAllAsReadApi,
} from "../api/notifications";
import { useToast } from "./useToast";

const POLLING_INTERVAL = 60000; // 60 seconds (reduced frequency to improve performance)
const DEFAULT_LIMIT = 50; // Increased to show more notifications

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

        // Ensure we don't filter by isRead unless explicitly requested
        // IMPORTANT: By default, fetch ALL notifications (read and unread)
        const fetchFilters: NotificationFilters = {
          ...filters,
          limit: filters?.limit || limit,
        };
        
        // Explicitly remove isRead filter if not set, to ensure we get ALL notifications
        // Only include isRead if it's explicitly set to true or false
        if (filters?.isRead === undefined || filters?.isRead === null) {
          delete fetchFilters.isRead;
          console.log('[Notifications Hook] Fetching ALL notifications (read + unread) - no isRead filter');
        } else {
          console.log(`[Notifications Hook] Fetching notifications with isRead filter: ${filters.isRead}`);
        }

        const response = await fetchNotificationsApi(
          fetchFilters,
          abortController.signal
        );
        
        console.log(`[Notifications Hook] Received ${response.notifications.length} notifications from API`);
        console.log(`[Notifications Hook] Response details:`, {
          notificationCount: response.notifications.length,
          pagination: response.pagination,
          firstNotification: response.notifications[0] || null
        });

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Map and ensure isRead property is correctly set
        const mappedNotifications = response.notifications.map((n) => {
          const isReadValue = n.status === "READ" || n.isRead === true;
          return {
            ...n,
            isRead: isReadValue,
            status: n.status || (isReadValue ? NotificationStatus.READ : NotificationStatus.UNREAD), // Ensure status is set
          };
        });

        if (append) {
          // Append to existing notifications, but deduplicate by _id
          setNotifications((prev) => {
            const existingIds = new Set(prev.map(n => n._id));
            const newNotifications = mappedNotifications.filter(n => !existingIds.has(n._id));
            return [...prev, ...newNotifications];
          });
        } else {
          // Replace notifications and deduplicate by _id
          const uniqueNotifications = mappedNotifications.reduce((acc, n) => {
            if (!acc.find(existing => existing._id === n._id)) {
              acc.push(n);
            }
            return acc;
          }, [] as Notification[]);
          console.log(`[Notifications Hook] Setting ${uniqueNotifications.length} unique notifications (from ${mappedNotifications.length} received)`);
          console.log(`[Notifications Hook] Notification IDs:`, uniqueNotifications.map(n => ({ id: n._id, title: n.title, status: n.status, isRead: n.isRead })));
          setNotifications(uniqueNotifications);
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
        if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || abortController.signal.aborted) {
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
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const count = await fetchUnreadCountApi(controller.signal);
      if (controller.signal.aborted) {
        return;
      }
      console.log(`[Notifications Hook] Unread count: ${count}`);
      setUnreadCount(count);
      } catch (err: any) {
        // Ignore canceled/aborted errors - these are expected when requests are superseded
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
          return;
        }
        console.error("[Notifications Hook] Error fetching unread count:", err);
        // Don't show error toast for polling failures, just log
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  /**
   * Mark a notification as read (optimistic update)
   * Notification stays visible, just marked as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Store previous state for potential rollback
      const previousNotifications = notifications.map(n => ({ ...n }));
      const previousUnreadCount = unreadCount;
      
      // Optimistic update - notification stays in list, just marked as read
      // Create a new object to ensure React detects the change
      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === notificationId) {
            return { 
              ...n, 
              isRead: true, 
              status: NotificationStatus.READ,
              readAt: new Date().toISOString()
            };
          }
          return n;
        })
      );

      if (previousUnreadCount > 0) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await markAsReadApi(notificationId);
        // Refresh unread count to ensure accuracy
        await fetchUnreadCount();
        // Don't refresh notifications list - keep optimistic updates visible
        console.log(`[Notifications Hook] Successfully marked notification ${notificationId} as read`);
      } catch (err: any) {
        // Revert optimistic update on error
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);

        const errorMessage = err?.message || "Failed to mark notification as read";
        showErrorToast(errorMessage);
        console.error("Error marking notification as read:", err);
      }
    },
    [notifications, unreadCount, fetchUnreadCount, showErrorToast]
  );

  /**
   * Mark all notifications as read (optimistic update)
   */
  const markAllAsRead = useCallback(async () => {
    // Optimistic update - mark all as read immediately
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications((prev) =>
      prev.map((n) => ({ 
        ...n, 
        isRead: true, 
        status: NotificationStatus.READ,
        readAt: n.readAt || new Date().toISOString()
      }))
    );
    setUnreadCount(0);

    try {
      await markAllAsReadApi();
      // Refresh unread count to ensure accuracy
      await fetchUnreadCount();
      // Don't refresh notifications list - keep optimistic updates visible
      // Only refresh if we want to get updated readAt timestamps (optional)
    } catch (err: any) {
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);

      const errorMessage = err?.message || "Failed to mark all notifications as read";
      showErrorToast(errorMessage);
      console.error("Error marking all notifications as read:", err);
    }
  }, [notifications, unreadCount, fetchUnreadCount, showErrorToast]);

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
   * Fetches ALL notifications (both read and unread), excluding archived
   */
  const refreshNotifications = useCallback(async () => {
    console.log('[Notifications Hook] refreshNotifications called');
    setPagination(null);
    try {
      // Fetch all notifications (read and unread) - don't filter by isRead
      // fetchNotifications sets state internally, so we don't need to capture the return value
      await Promise.all([
        fetchNotifications({ page: 1, limit }), // No isRead filter = get all
        fetchUnreadCount()
      ]);
      console.log('[Notifications Hook] refreshNotifications completed successfully');
    } catch (err) {
      console.error('[Notifications Hook] Error in refreshNotifications:', err);
      throw err;
    }
  }, [fetchNotifications, fetchUnreadCount, limit]);

  /**
   * Initialize: fetch notifications and unread count (only once on mount)
   */
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (autoFetch && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Fetch ALL notifications (read and unread) on mount - no filters
      console.log('[Notifications Hook] Initial fetch - getting ALL notifications (read and unread)');
      Promise.all([
        fetchNotifications({ page: 1, limit }), // Explicitly pass empty filters to get all
        fetchUnreadCount()
      ]);
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

    // Set up new interval - poll unread count (refresh notifications only if center is open)
    const pollUnreadAndRefresh = () => {
      fetchUnreadCount()
        .then(() => {
          // If notification center is open, also refresh the notifications list
          if (isOpen && !isRefreshingRef.current) {
            fetchNotifications({ page: 1, limit }, false).catch(err => {
              // Only log non-canceled errors
              if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED' && err.message !== 'canceled') {
                console.error('Error refreshing notifications during poll:', err);
              }
            });
          }
        })
        .catch(err => {
          // Only log non-canceled errors
          if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED' && err.message !== 'canceled') {
            console.error('Error fetching unread count during poll:', err);
          }
        });
    };

    // Don't poll immediately - wait for first interval to reduce initial load
    pollingIntervalRef.current = setInterval(pollUnreadAndRefresh, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingEnabled, isOpen]); // Include isOpen to refresh notifications when center opens

  /**
   * Fetch notifications when notification center opens (always refresh to get latest)
   * Fetches ALL notifications (both read and unread)
   * Only refresh if not already loading to prevent duplicate requests
   */
  const lastOpenTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);
  useEffect(() => {
    if (isOpen && !isRefreshingRef.current) {
      const now = Date.now();
      // Debounce to prevent rapid successive opens from triggering multiple fetches
      if (now - lastOpenTimeRef.current > 300) {
        console.log('[Notifications] Notification center opened, refreshing ALL notifications...');
        lastOpenTimeRef.current = now;
        isRefreshingRef.current = true;
        
        // Force refresh all notifications when center opens - no filters
        fetchNotifications({ page: 1, limit })
          .then(() => {
            console.log('[Notifications] Fetch completed after opening center');
          })
          .catch(err => {
            // Don't log canceled errors as they're expected
            if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED' && err?.message !== 'canceled') {
              console.error('[Notifications] Error fetching on open:', err);
              setError(err?.message || 'Failed to fetch notifications');
            }
          })
          .finally(() => {
            isRefreshingRef.current = false;
          });
        
        // Also refresh unread count (but don't block on it)
        fetchUnreadCount().catch(err => {
          // Don't log canceled errors
          if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED' && err?.message !== 'canceled') {
            console.error('[Notifications] Error fetching unread count on open:', err);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen to avoid unnecessary refreshes

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
