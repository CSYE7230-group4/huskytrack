/**
 * Event Controller
 * Handles HTTP requests for event operations
 */

const eventService = require('../services/eventService');
const { asyncHandler } = require('../utils/errors');

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

    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
    if (startDate) filters.startDate = { $gte: new Date(startDate) };
    if (endDate) filters.endDate = { $lte: new Date(endDate) };

    // Build sort
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
 * GET /api/v1/events/organizer/:organizerId
 * Access: Organizer (own events), Admin (all events)
 */
const getEventsByOrganizer = asyncHandler(async (req, res) => {
    const { organizerId } = req.params;
    const requesterId = req.user.id;
    const {
        page = 1,
        limit = 20
    } = req.query;

    // Check authorization - only organizer themselves or admin can view
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
 * Get my events (current user's events)
 * GET /api/v1/events/my-events
 * Access: ORGANIZER, ADMIN
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
 * Get my draft events (current user's draft events)
 * GET /api/v1/organizer/events/drafts
 * Access: ORGANIZER, ADMIN
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
 * Update event
 * PUT /api/v1/events/:id
 * Access: Organizer (own events), Admin
 */
const updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const event = await eventService.updateEvent(id, updateData, userId);

    res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: { event }
    });
});

/**
 * Delete event
 * DELETE /api/v1/events/:id
 * Access: Organizer (own events), Admin
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
 * Publish event (DRAFT -> PUBLISHED)
 * POST /api/v1/events/:id/publish
 * Access: Organizer (own events)
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

    const event = await eventService.cancelEvent(id, userId);

    res.status(200).json({
        success: true,
        message: 'Event cancelled successfully',
        data: { event }
    });
});

/**
 * Search events
 * GET /api/v1/events/search
 * Access: Public
 */
const searchEvents = asyncHandler(async (req, res) => {
    const {
        q,
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

    const result = await eventService.searchEvents(q, filters, options);

    res.status(200).json({
        success: true,
        data: result
    });
});

/**
 * Get events by category
 * GET /api/v1/events/category/:category
 * Access: Public
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
 * Check if user can register for event
 * GET /api/v1/events/:id/can-register
 * Access: Authenticated
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
 * Get event capacity information
 * GET /api/v1/events/:id/capacity
 * Access: Public
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

