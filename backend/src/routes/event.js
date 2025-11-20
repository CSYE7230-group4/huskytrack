/**
 * Event Routes
 * Defines all routes for event operations
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateCreateEvent,
  validateUpdateEvent,
  validateGetEvents,
  validateSearchEvents
} = require('../middleware/eventValidation');

// Public routes (no authentication required)

// Get upcoming events (must be before /:id)
router.get('/upcoming', validateGetEvents, eventController.getUpcomingEvents);

// Search events (must be before /:id)
router.get('/search', validateSearchEvents, eventController.searchEvents);

// Get events by category (must be before /:id)
router.get('/category/:category', validateGetEvents, eventController.getEventsByCategory);

// Protected routes (authentication required) - Specific routes before parameter routes

// Create new event (ORGANIZER and ADMIN only)
router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validateCreateEvent,
  eventController.createEvent
);

// Get organizer events (must be before /:id)
router.get(
  '/my/events',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.getMyEvents
);

// Get my draft events (must be before /organizer/:organizerId)
router.get(
  '/organizer/events/drafts',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.getMyDraftEvents
);

// Get events by organizer
router.get(
  '/organizer/:organizerId',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.getEventsByOrganizer
);

// Get event capacity (must be before /:id to avoid conflict)
router.get('/:id/capacity', eventController.getEventCapacity);

// Check if user can register (must be before /:id for clarity)
router.get(
  '/:id/can-register',
  authenticate,
  eventController.canUserRegister
);

// Get all events with filters
router.get('/', validateGetEvents, optionalAuth, eventController.getEvents);

// Get event by ID (public for published events) - Must be last among GET routes
router.get('/:id', optionalAuth, eventController.getEventById);

// Update event (ORGANIZER own events, ADMIN all events)
router.put(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validateUpdateEvent,
  eventController.updateEvent
);

// Publish event
router.post(
  '/:id/publish',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.publishEvent
);

// Cancel event
router.post(
  '/:id/cancel',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.cancelEvent
);

// Delete event
router.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.deleteEvent
);

module.exports = router;

