/**
 * Notification Routes
 * Handles all notification-related endpoints
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/notifications/me
 * Get all notifications for authenticated user
 * Query params: isRead, type, page, limit
 */
router.get('/me', notificationController.getNotifications);

/**
 * GET /api/v1/notifications/unread/count
 * Get count of unread notifications
 */
router.get('/unread/count', notificationController.getUnreadCount);

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;

