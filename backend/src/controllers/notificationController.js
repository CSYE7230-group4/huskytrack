/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 */

const { Notification } = require('../models/Notification');
const { asyncHandler } = require('../utils/errors');

/**
 * Get user's notifications
 * GET /api/v1/notifications/me
 * Access: Authenticated users
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { isRead, type, page = 1, limit = 20 } = req.query;

  // Build query options
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
  };

  // Build filter query
  const filterQuery = { user: userId };
  if (isRead !== undefined) {
    filterQuery.status = isRead === 'true' ? 'READ' : 'UNREAD';
  }
  if (type) {
    filterQuery.type = type;
  }

  // Get notifications
  const notifications = await Notification.find(filterQuery)
    .populate('event', '_id title')
    .sort({ createdAt: -1 })
    .limit(options.limit)
    .skip(options.skip)
    .lean();

  // Get total count for pagination
  const totalCount = await Notification.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalCount / options.limit);

  // Format notifications for response
  const formattedNotifications = notifications.map((n) => {
    // Handle event field - could be ObjectId or populated object
    let relatedEventId = undefined;
    if (n.event) {
      if (typeof n.event === 'object' && n.event._id) {
        // Populated event object
        relatedEventId = { _id: n.event._id.toString(), title: n.event.title };
      } else if (typeof n.event === 'string' || n.event.toString) {
        // Just ObjectId string
        relatedEventId = n.event.toString();
      }
    }

    return {
      _id: n._id,
      userId: n.user.toString(),
      type: n.type,
      status: n.status,
      title: n.title,
      message: n.message,
      relatedEventId,
      relatedData: n.metadata || {},
      actionUrl: n.actionUrl,
      readAt: n.readAt,
      archivedAt: n.archivedAt,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      isRead: n.status === 'READ',
    };
  });

  res.status(200).json({
    success: true,
    data: {
      notifications: formattedNotifications,
      pagination: {
        currentPage: options.page,
        totalPages,
        totalCount,
      },
    },
  });
});

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread/count
 * Access: Authenticated users
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    data: {
      unreadCount,
    },
  });
});

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:id/read
 * Access: Notification owner
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  // Find notification and verify ownership
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  if (notification.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this notification',
    });
  }

  // Mark as read
  await notification.markAsRead();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification: {
        _id: notification._id,
        isRead: true,
        readAt: notification.readAt,
      },
    },
  });
});

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/read-all
 * Access: Authenticated users
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await Notification.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      updatedCount: result.modifiedCount || 0,
    },
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

