/**
 * Dashboard Service
 * Aggregates data for the user dashboard feed
 */

const eventRepository = require('../repositories/eventRepository');
const eventRegistrationRepository = require('../repositories/eventRegistrationRepository');
const { EventRegistration, RegistrationStatus } = require('../models/EventRegistration');
const { Bookmark } = require('../models/Bookmark');
const { Notification, NotificationStatus } = require('../models/Notification');
const { EventStatus } = require('../models/Event');
const recommendationService = require('./recommendationService');

class DashboardService {
  /**
   * Get dashboard feed data for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardFeed(userId) {
    const now = new Date();

    // 1. Upcoming registrations (next 5)
    const upcomingRegsPromise = eventRegistrationRepository.findByUser(userId, {
      page: 1,
      limit: 5,
      sort: { 'event.startDate': 1 },
      populate: true,
      lean: true
    });

    // 2. Recent bookmarks (5 most recent)
    const bookmarksPromise = Bookmark.findByUser(userId, { limit: 5 });

    // 3. User stats (attended, registered, bookmarked)
    const statsPromise = this._getUserStats(userId);

    // 4. Unread notifications (5 most recent)
    const notificationsPromise = Notification.find({
      user: userId,
      status: NotificationStatus.UNREAD
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 5. Recommended events
    const recommendationsPromise = recommendationService.getRecommendedEvents(userId, {
      limit: 10
    });

    // 6. Calendar data (current and next month)
    const calendarPromise = this._getCalendarData(userId, now);

    // 7. Upcoming events created by user (organizer view)
    const myUpcomingEventsPromise = eventRepository.findAll(
      {
        organizer: userId,
        status: EventStatus.PUBLISHED,
        startDate: { $gt: now },
      },
      {
        page: 1,
        limit: 5,
        sort: { startDate: 1 },
        populate: true,
        lean: true,
      }
    );

    const [
      upcomingRegs,
      bookmarks,
      stats,
      notifications,
      recommendations,
      calendar,
      myUpcomingEvents
    ] = await Promise.all([
      upcomingRegsPromise,
      bookmarksPromise,
      statsPromise,
      notificationsPromise,
      recommendationsPromise,
      calendarPromise,
      myUpcomingEventsPromise
    ]);

    const upcomingEventsFromRegs = (upcomingRegs.registrations || [])
      .filter((reg) => reg.event && reg.event.startDate > now)
      .slice(0, 5)
      .map((reg) => ({
        ...reg.event,
        registrationId: reg._id,
        registrationStatus: reg.status
      }));

    const myUpcomingEventsList = (myUpcomingEvents.events || []).filter(
      (ev) => ev && ev.startDate > now
    );

    // Merge and de‑duplicate by _id
    const seen = new Set();
    const mergedUpcoming = [];

    for (const ev of [...upcomingEventsFromRegs, ...myUpcomingEventsList]) {
      const id = ev._id?.toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        mergedUpcoming.push(ev);
      }
      if (mergedUpcoming.length >= 5) break;
    }

    const bookmarkedEvents = (bookmarks || [])
      .filter((b) => b.event)
      .slice(0, 5)
      .map((b) => b.event);

    return {
      upcomingEvents: mergedUpcoming,
      bookmarks: bookmarkedEvents,
      recommendations: recommendations || [],
      stats,
      notifications,
      calendar
    };
  }

  /**
   * Calculate user statistics
   * @param {String} userId
   * @returns {Promise<Object>}
   */
  async _getUserStats(userId) {
    const [attendedCount, registeredCount, bookmarkedCount] = await Promise.all([
      EventRegistration.countDocuments({
        user: userId,
        status: RegistrationStatus.ATTENDED
      }),
      EventRegistration.countDocuments({
        user: userId,
        status: {
          $in: [RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED]
        }
      }),
      Bookmark.countDocuments({ user: userId })
    ]);

    return {
      attended: attendedCount,
      registered: registeredCount,
      bookmarked: bookmarkedCount
    };
  }

  /**
   * Get calendar data for current and next month
   * Returns map of date (YYYY-MM-DD) -> count
   * @param {String} userId
   * @param {Date} now
   * @returns {Promise<Object>}
   */
  async _getCalendarData(userId, now) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);

    // Fetch all upcoming events user is registered for within range
    const { registrations } = await eventRegistrationRepository.findByUser(userId, {
      page: 1,
      limit: 200,
      sort: { 'event.startDate': 1 },
      populate: true,
      lean: true
    });

    const eventsInRange = (registrations || [])
      .filter(
        (reg) =>
          reg.event &&
          reg.event.startDate &&
          reg.event.startDate >= startOfMonth &&
          reg.event.startDate < startOfNextNextMonth
      )
      .map((reg) => reg.event);

    const byDate = {};
    eventsInRange.forEach((ev) => {
      const d = new Date(ev.startDate);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDate[key] = (byDate[key] || 0) + 1;
    });

    return {
      start: startOfMonth.toISOString(),
      end: startOfNextNextMonth.toISOString(),
      dates: byDate
    };
  }
}

module.exports = new DashboardService();


