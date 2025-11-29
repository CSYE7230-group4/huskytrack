/**
 * Registration Controller
 * Handles HTTP requests for event registrations
 */

const registrationService = require('../services/registrationService');
const { RegistrationStatus } = require('../models/EventRegistration');

// ✅ ADD THIS IMPORT (Required for Step 8.2)
const {
  sendRegistrationConfirmationEmail
} = require('../services/notificationService');

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Register for an event
 * POST /api/v1/events/:id/register
 */
const register = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const eventId = req.params.id;

  // Perform registration
  const result = await registrationService.registerForEvent(userId, eventId);

  // Extract event + user data for email
  const event =
    result.event ||
    result.eventData ||
    result.registration?.event;

  const user = req.user;

  // 🔵 Send confirmation email ONLY if user is fully registered (not waitlisted)
  if (result.status === 'REGISTERED' && event) {
    await sendRegistrationConfirmationEmail({
      to: user.email,
      userName: user.firstName || user.name || "User",
      eventName: event.title,
      eventDate: new Date(event.startDate).toLocaleString(),
      eventLocation: event.location?.name || "Campus",
      eventUrl: `https://huskytrack.app/events/${event._id}`,
      unsubscribeUrl: "https://huskytrack.app/unsubscribe/preview"
    });
  }

  // Return response
  res.status(result.status === 'REGISTERED' ? 201 : 200).json({
    success: true,
    message: result.message,
    data: {
      registration: result.registration,
      status: result.status,
      waitlistPosition: result.waitlistPosition || null
    }
  });
});

/**
 * Cancel a registration
 * DELETE /api/v1/registrations/:id
 */
const cancelRegistration = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const registrationId = req.params.id;

  const result = await registrationService.cancelRegistration(registrationId, userId);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      registration: result.registration
    }
  });
});

/**
 * Get user's registrations
 * GET /api/v1/registrations/me
 */
const getUserRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page, limit, sort } = req.query;

  const filters = {};
  if (status) {
    filters.status = status.toUpperCase();
  }

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
    sort: sort || { createdAt: -1 }
  };

  const result = await registrationService.getUserRegistrations(userId, filters, options);

  res.status(200).json({
    success: true,
    message: 'User registrations retrieved successfully',
    data: {
      registrations: result.registrations,
      pagination: result.pagination
    }
  });
});

/**
 * Get event attendees (organizer only)
 * GET /api/v1/events/:id/attendees
 */
const getEventAttendees = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const eventId = req.params.id;
  const { status, page, limit } = req.query;

  const filters = {};
  if (status) {
    filters.status = status.toUpperCase();
  }

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 100
  };

  const result = await registrationService.getEventAttendees(eventId, userId, filters, options);

  res.status(200).json({
    success: true,
    message: 'Event attendees retrieved successfully',
    data: {
      attendees: result.registrations,
      pagination: result.pagination
    }
  });
});

/**
 * Mark attendance for a registration
 * POST /api/v1/registrations/:id/attendance
 */
const markAttendance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const registrationId = req.params.id;
  const { attended } = req.body;

  const result = await registrationService.markAttendance(
    registrationId,
    userId,
    attended !== undefined ? attended : true
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      registration: result.registration
    }
  });
});

/**
 * Get registration details
 * GET /api/v1/registrations/:id
 */
const getRegistrationDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const registrationId = req.params.id;

  const registration = await registrationService.getRegistrationDetails(registrationId, userId);

  res.status(200).json({
    success: true,
    message: 'Registration details retrieved successfully',
    data: {
      registration: registration
    }
  });
});

/**
 * Check eligibility for event registration
 * GET /api/v1/events/:id/eligibility
 */
const checkEligibility = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const eventId = req.params.id;

  const eligibility = await registrationService.checkEligibility(userId, eventId);

  res.status(200).json({
    success: true,
    message: 'Eligibility checked successfully',
    data: eligibility
  });
});

/**
 * Get registration statistics for an event (organizer only)
 * GET /api/v1/events/:id/registration-stats
 */
const getRegistrationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const eventId = req.params.id;

  const stats = await registrationService.getRegistrationStats(eventId, userId);

  res.status(200).json({
    success: true,
    message: 'Registration statistics retrieved successfully',
    data: stats
  });
});

module.exports = {
  register,
  cancelRegistration,
  getUserRegistrations,
  getEventAttendees,
  markAttendance,
  getRegistrationDetails,
  checkEligibility,
  getRegistrationStats
};
