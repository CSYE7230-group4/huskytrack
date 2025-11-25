/**
 * Event Controller
 * Handles HTTP requests for event operations
 */

const eventService = require('../services/eventService');
const { asyncHandler } = require('../utils/errors');

// NEW REQUIRED IMPORTS (unchanged ones kept)
const {
  sendRegistrationConfirmationEmail,
  sendEventUpdateEmail,
  sendEventCancellationEmail,
  sendEventReminderEmail
} = require('../services/notificationService');

// NEW REQUIRED IMPORT
const registrationService = require('../services/registrationService');


/**
 * Create new event
 * POST /api/v1/events
 * Access: ORGANIZER, ADMIN
 */
const createEvent = asyncHandler(async (req, res) => {
    const organizerId = req.user.id;
    const eventData = req.body;

    const event = await eventService.createEvent(eventData, organizerId);

    res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event }
    });
});


/**
 * Get all events with filters and pagination
 * GET /api/v1/events
 * Access: Public
 */
const getEvents = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        category,
        status,
        search,
        startDate,
        endDate,
        isPublic,
        sort = 'startDate'
    } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
    if (startDate) filters.startDate = { $gte: new Date(startDate) };
    if (endDate) filters.endDate = { $lte: new Date(endDate) };

    const sortObj = {};
    if (sort.startsWith('-')) {
        sortObj[sort.substring(1)] = -1;
    } else {
        sortObj[sort] = 1;
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortObj
    };

    const result = await eventService.getEvents(filters, options, req.user?.id);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Get upcoming events
 * GET /api/v1/events/upcoming
 * Access: Public
 */
const getUpcomingEvents = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        category
    } = req.query;

    const filters = {};
    if (category) filters.category = category;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await eventService.getUpcomingEvents(filters, options);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Get event by ID
 * GET /api/v1/events/:id
 * Access: Public (published events), Organizer (own events)
 */
const getEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const event = await eventService.getEventById(id, userId);

    res.status(200).json({
        success: true,
        data: { event }
    });
});


/**
 * Get events by organizer
 */
const getEventsByOrganizer = asyncHandler(async (req, res) => {
    const { organizerId } = req.params;
    const requesterId = req.user.id;
    const {
        page = 1,
        limit = 20
    } = req.query;

    if (organizerId !== requesterId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these events'
        });
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await eventService.getEventsByOrganizer(organizerId, requesterId, options);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Get my events
 */
const getMyEvents = asyncHandler(async (req, res) => {
    const organizerId = req.user.id;
    const {
        page = 1,
        limit = 20
    } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await eventService.getEventsByOrganizer(organizerId, organizerId, options);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Get my draft events
 */
const getMyDraftEvents = asyncHandler(async (req, res) => {
    const organizerId = req.user.id;
    const {
        page = 1,
        limit = 20
    } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await eventService.getDraftEventsByOrganizer(organizerId, options);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * UPDATE EVENT (EMAIL LOGIC ADDED HERE)
 * PUT /api/v1/events/:id
 */
const updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // 1. Update event
    const event = await eventService.updateEvent(id, updateData, userId);

    // 2. Fetch attendees (registered users)
    const attendeesResult = await registrationService.getEventAttendees(id, userId, {}, { page: 1, limit: 500 });
    const attendees = attendeesResult?.registrations || [];

    // 3. Send update email to each attendee
    for (const reg of attendees) {
        const attendee = reg.user;
        if (!attendee || !attendee.email) continue;

        await sendEventUpdateEmail({
            to: attendee.email,
            userName: attendee.firstName || attendee.name || "User",
            eventName: event.title,
            eventDate: new Date(event.startDate).toLocaleString(),
            eventLocation: event.location?.name || "Campus",
            eventUrl: `https://huskytrack.app/events/${event._id}`,
            unsubscribeUrl: "https://huskytrack.app/unsubscribe/preview"
        });
    }

    res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: { event }
    });
});


/**
 * Delete event
 */
const deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const result = await eventService.deleteEvent(id, userId, isAdmin);

    res.status(200).json({
        success: true,
        ...result
    });
});


/**
 * Publish event
 */
const publishEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await eventService.publishEvent(id, userId);

    res.status(200).json({
        success: true,
        message: 'Event published successfully',
        data: { event }
    });
});


/**
 * Cancel event
 * POST /api/v1/events/:id/cancel
 * Access: Organizer (own events), Admin
 */
const cancelEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Cancel the event
    const event = await eventService.cancelEvent(id, userId);

    // 2. Fetch attendees (registered users)
    const attendeesResult = await registrationService.getEventAttendees(
        id,
        userId,
        { status: "REGISTERED" },  // only registered users get cancellation email
        { page: 1, limit: 500 }
    );

    const attendees = attendeesResult?.registrations || [];

    // 3. Send cancellation email to each attendee
    for (const reg of attendees) {
        const attendee = reg.user;
        if (!attendee || !attendee.email) continue;

        await sendEventCancellationEmail({
            to: attendee.email,
            userName: attendee.firstName || attendee.name || "User",
            eventName: event.title,
            eventDate: new Date(event.startDate).toLocaleString(),
            eventLocation: event.location?.name || "Campus",
            eventUrl: `https://huskytrack.app/events/${event._id}`,
            unsubscribeUrl: "https://huskytrack.app/unsubscribe/preview"
        });
    }

    res.status(200).json({
        success: true,
        message: "Event cancelled successfully",
        data: { event }
    });
});



/**
 * Search events
 */
const searchEvents = asyncHandler(async (req, res) => {
    const {
        q,
        page = 1,
        limit = 20,
        category,
        startDate,
        endDate,
        sort = 'relevance'
    } = req.query;

    const filters = {};
    if (category) filters.category = category;

    if (startDate) filters.startDate = { $gte: new Date(startDate) };
    if (endDate) filters.endDate = { $lte: new Date(endDate) };

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
    };

    const result = await eventService.searchEvents(q, filters, options);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Get events by category
 */
const getEventsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const {
        page = 1,
        limit = 20
    } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await eventService.getEventsByCategory(category, options);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Check if user can register
 */
const canUserRegister = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await eventService.canUserRegister(id, userId);

    res.status(200).json({
        success: true,
        data: result
    });
});


/**
 * Get event capacity
 */
const getEventCapacity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const capacity = await eventService.getEventCapacity(id);

    res.status(200).json({
        success: true,
        data: capacity
    });
});


module.exports = {
    createEvent,
    getEvents,
    getUpcomingEvents,
    getEventById,
    getEventsByOrganizer,
    getMyEvents,
    getMyDraftEvents,
    updateEvent,
    deleteEvent,
    publishEvent,
    cancelEvent,
    searchEvents,
    getEventsByCategory,
    canUserRegister,
    getEventCapacity
};
