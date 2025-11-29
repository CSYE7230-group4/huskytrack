/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 */

const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/errors');

/**
 * Get user's notifications
 * GET /api/v1/notifications/me
 * Access: Authenticated users
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 20,
    status,
    type
  } = req.query;

  const result = await notificationService.getUserNotifications(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    type
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread/count
 * Access: Authenticated users
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const count = await notificationService.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:id/read
 * Access: Authenticated users (own notifications only)
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await notificationService.markAsRead(id, userId);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/read-all
 * Access: Authenticated users
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await notificationService.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 * Access: Authenticated users (own notifications only)
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await notificationService.deleteNotification(id, userId);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

/**
 * Get notification by ID
 * GET /api/v1/notifications/:id
 * Access: Authenticated users (own notifications only)
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notificationRepository = require('../repositories/notificationRepository');
  const notification = await notificationRepository.findById(id, {
    populate: ['event', 'comment', 'registration']
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check ownership
  if (notification.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this notification'
    });
  }

  res.status(200).json({
    success: true,
    data: { notification }
  });
});

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationById
};



