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

// Get all events with filters
router.get('/', validateGetEvents, optionalAuth, eventController.getEvents);

// Get upcoming events
router.get('/upcoming', validateGetEvents, eventController.getUpcomingEvents);

// Search events
router.get('/search', validateSearchEvents, eventController.searchEvents);

// Get events by category
router.get('/category/:category', validateGetEvents, eventController.getEventsByCategory);

// Get event by ID (public for published events)
router.get('/:id', optionalAuth, eventController.getEventById);

// Get event capacity
router.get('/:id/capacity', eventController.getEventCapacity);

// Protected routes (authentication required)

// Create new event (ORGANIZER and ADMIN only)
router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validateCreateEvent,
  eventController.createEvent
);

// Get my events
router.get(
  '/my/events',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.getMyEvents
);

// Get events by organizer
router.get(
  '/organizer/:organizerId',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  eventController.getEventsByOrganizer
);

// Check if user can register
router.get(
  '/:id/can-register',
  authenticate,
  eventController.canUserRegister
);

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

