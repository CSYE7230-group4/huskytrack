/**
 * Event Controller
 * Handles HTTP requests for event operations
 */

const eventSearchService = require('../services/eventSearch');
const { asyncHandler } = require('../utils/errors');

/**
 * Get all events with filters and pagination
 * GET /api/v1/events
 * Access: Public
 */
const getEvents = asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        offset,
        category,
        status,
        search,
        searchQuery,
        startDate,
        endDate,
        tags,
        location,
        capacity,
        includePast,
        isPublic,
        sort,
        sortOrder
    } = req.query;

    // Determine if user can see drafts (organizer/admin)
    const userId = req.user?.id;
    const isOrganizerOrAdmin = req.user?.role === 'ORGANIZER' || req.user?.role === 'ADMIN';
    const includeDrafts = isOrganizerOrAdmin && req.query.includeDrafts === 'true';

    // Use advanced search service for better functionality
    const searchOptions = {
        searchQuery: searchQuery || search, // Support both parameter names
        category,
        status,
        startDate,
        endDate,
        tags,
        location,
        capacity,
        includePast: includePast === 'true' || includePast === true,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        sort,
        sortOrder,
        userId,
        includeDrafts
    };

    // Remove undefined values
    Object.keys(searchOptions).forEach(key => {
        if (searchOptions[key] === undefined) {
            delete searchOptions[key];
        }
    });

    const result = await eventSearchService.searchEvents(searchOptions);

    res.status(200).json({
        success: true,
        data: result
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
        searchQuery,
        page,
        limit,
        offset,
        category,
        status,
        startDate,
        endDate,
        tags,
        location,
        capacity,
        includePast,
        sort = 'relevance',
        sortOrder
    } = req.query;

    // Determine if user can see drafts (organizer/admin)
    const userId = req.user?.id;
    const isOrganizerOrAdmin = req.user?.role === 'ORGANIZER' || req.user?.role === 'ADMIN';
    const includeDrafts = isOrganizerOrAdmin && req.query.includeDrafts === 'true';

    // Use searchQuery or q (backward compatibility)
    const query = searchQuery || q;

    // If no search query provided, return all published events (filtering only)
    const searchOptions = {
        searchQuery: query,
        category,
        status,
        startDate,
        endDate,
        tags,
        location,
        capacity,
        includePast: includePast === 'true' || includePast === true,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        sort,
        sortOrder,
        userId,
        includeDrafts
    };

    // Remove undefined values
    Object.keys(searchOptions).forEach(key => {
        if (searchOptions[key] === undefined) {
            delete searchOptions[key];
        }
    });

    const result = await eventSearchService.searchEvents(searchOptions);

    res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = {
    getEvents,
    searchEvents
};

