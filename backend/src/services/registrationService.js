/**
 * Registration Service
 * Handles all business logic for event registrations
 * Includes capacity management, waitlist logic, and transaction support
 */

const eventRegistrationRepository = require('../repositories/eventRegistrationRepository');
const eventRepository = require('../repositories/eventRepository');
const { EventRegistration, RegistrationStatus } = require('../models/EventRegistration');
const { Event, EventStatus } = require('../models/Event');
const { Notification, NotificationType } = require('../models/Notification');
const mongoose = require('mongoose');

const {
  sendRegistrationConfirmationEmail,
  sendEventCancellationEmail
} = require('../services/notificationService');


const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  RegistrationExistsError,
  RegistrationClosedError
} = require('../utils/errors');

class RegistrationService {
  
  /**
   * Register user for an event
   * Handles capacity checks, waitlist logic
   * Note: Transactions disabled for standalone MongoDB compatibility
   * @param {String} userId - User ID
   * @param {String} eventId - Event ID
   * @returns {Promise<Object>} Registration result with status
   */
  async registerForEvent(userId, eventId) {
    // Note: Transactions disabled for standalone MongoDB (development)
    // In production with replica set, enable transactions by uncommenting session code

    try {
      // Check if user has any existing registration
      const existingRegistration = await eventRegistrationRepository.findByUserAndEvent(userId, eventId);
      
      // If user has an active registration, block re-registration
      if (existingRegistration && 
          (existingRegistration.status === RegistrationStatus.REGISTERED || 
           existingRegistration.status === RegistrationStatus.WAITLISTED)) {
        throw new RegistrationExistsError('You are already registered for this event');
      }

      // Fetch event and verify it exists
      const event = await eventRepository.findById(eventId, { lean: false });
      
      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Check event status allows registration
      if (event.status !== EventStatus.PUBLISHED) {
        throw new RegistrationClosedError(`Cannot register for ${event.status.toLowerCase()} event`);
      }

      // Check if event has ended
      if (event.endDate < new Date()) {
        throw new RegistrationClosedError('Cannot register for past events');
      }

      // Check event capacity
      const hasCapacity = event.maxRegistrations === null || 
                          event.currentRegistrations < event.maxRegistrations;

      let registration;

      if (hasCapacity) {
        // If reusing a cancelled registration, update it; otherwise create new
        if (existingRegistration && existingRegistration.status === RegistrationStatus.CANCELLED) {
          // Reuse existing cancelled registration
          existingRegistration.status = RegistrationStatus.REGISTERED;
          existingRegistration.registeredAt = new Date();
          existingRegistration.cancelledAt = null;
          existingRegistration.waitlistPosition = null;
          registration = await existingRegistration.save();
        } else {
          // Create new registration with REGISTERED status
          const registrationData = {
            user: userId,
            event: eventId,
            status: RegistrationStatus.REGISTERED,
            registeredAt: new Date()
          };
          registration = await eventRegistrationRepository.create(registrationData);
        }

        // Note: currentRegistrations is automatically updated by EventRegistration post-save hook

        // Trigger notification (don't block on failure)
        this.sendRegistrationConfirmationNotification(userId, eventId, registration._id)
          .catch(err => {
            console.error('[Registration] Notification error in registerForEvent:', err.message);
            console.error('[Registration] Full error:', err);
          });

        // Send email confirmation (do not block if fails)
        try {
          const fullRegistration = await eventRegistrationRepository.findById(registration._id, {
            populate: ['event', 'user']
          });

          await sendRegistrationConfirmationEmail({
            to: fullRegistration.user.email,
            userName: fullRegistration.user.firstName,
            eventName: fullRegistration.event.title,
            eventDate: fullRegistration.event.startDate,
            eventLocation: fullRegistration.event.location,
            organizerName: fullRegistration.event.organizer?.firstName || 'Organizer',
            eventId: fullRegistration.event._id
          });
        } catch (err) {
          console.error('Failed to send registration email:', err);
        }

        // Send EMAIL: Registration Confirmation
        try {
          const populated = await eventRegistrationRepository.findById(registration._id, {
            populate: ['event', 'user']
          });

          await sendRegistrationConfirmationEmail({
            to: populated.user.email,
            userName: populated.user.firstName,
            eventName: populated.event.title,
            eventDate: populated.event.startDate,
            eventLocation: populated.event.location?.name || 'See event page',
            eventUrl: `https://huskytrack.app/events/${eventId}`,
            unsubscribeUrl: `https://huskytrack.app/unsubscribe/preview` // real token logic added in Step 7
          });

        } catch (emailError) {
          console.error("Registration email failed:", emailError);
        }

          return {
          success: true,
          registration: await eventRegistrationRepository.findById(registration._id, { 
            populate: ['event', 'user'] 
          }),
          message: 'Successfully registered for event',
          status: 'REGISTERED'
        };
      } else {
        // Event is full - add to waitlist
        const waitlistPosition = await eventRegistrationRepository.getNextWaitlistPosition(eventId);
        
        // If reusing a cancelled registration, update it; otherwise create new
        if (existingRegistration && existingRegistration.status === RegistrationStatus.CANCELLED) {
          // Reuse existing cancelled registration
          existingRegistration.status = RegistrationStatus.WAITLISTED;
          existingRegistration.registeredAt = new Date();
          existingRegistration.cancelledAt = null;
          existingRegistration.waitlistPosition = waitlistPosition;
          registration = await existingRegistration.save();
        } else {
          // Create new registration with WAITLISTED status
          const registrationData = {
            user: userId,
            event: eventId,
            status: RegistrationStatus.WAITLISTED,
            registeredAt: new Date(),
            waitlistPosition: waitlistPosition
          };
          registration = await eventRegistrationRepository.create(registrationData);
        }

        // Trigger waitlist notification
        this.sendWaitlistNotification(userId, eventId, registration._id, waitlistPosition)
          .catch(err => {
            console.error('[Registration] Waitlist notification error in registerForEvent:', err.message);
            console.error('[Registration] Full error:', err);
          });

        return {
          success: true,
          registration: await eventRegistrationRepository.findById(registration._id, { 
            populate: ['event', 'user'] 
          }),
          message: 'Event is full. You have been added to the waitlist',
          status: 'WAITLISTED',
          waitlistPosition: waitlistPosition
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel a registration
   * Handles waitlist promotion if event was full
   * @param {String} registrationId - Registration ID
   * @param {String} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelRegistration(registrationId, userId) {
    // Note: Transactions disabled for standalone MongoDB (development)

    try {
      // Fetch registration and verify it exists (without population to get raw ObjectIds)
      const registration = await eventRegistrationRepository.findById(registrationId, { lean: false });
      
      if (!registration) {
        throw new NotFoundError('Registration not found');
      }

      // Verify ownership - use Mongoose .equals() for ObjectId comparison
      // Handle both populated (registration.user._id) and unpopulated (registration.user) cases
      const registrationUserId = registration.user._id || registration.user;
      const userIdToCompare = mongoose.Types.ObjectId.isValid(userId) ? userId : mongoose.Types.ObjectId(userId);
      
      // Use .equals() method for proper ObjectId comparison
      if (!registrationUserId.equals(userIdToCompare)) {
        throw new ForbiddenError('You do not have permission to cancel this registration');
      }

      // Check if already cancelled
      if (registration.status === RegistrationStatus.CANCELLED) {
        throw new BadRequestError('Registration is already cancelled');
      }

      const wasRegistered = registration.status === RegistrationStatus.REGISTERED;
      const wasWaitlisted = registration.status === RegistrationStatus.WAITLISTED;
      const eventId = registration.event;

      // Update registration status to CANCELLED
      registration.status = RegistrationStatus.CANCELLED;
      registration.cancelledAt = new Date();
      await registration.save();

      // If user was registered (not waitlisted), handle capacity and promotion
      if (wasRegistered) {
        // Note: currentRegistrations is automatically updated by EventRegistration post-save hook
        
        // Promote first person from waitlist if any
        await this.promoteFromWaitlist(eventId);
      }

      // If user was waitlisted, recalculate positions
      if (wasWaitlisted) {
        await eventRegistrationRepository.recalculateWaitlistPositions(eventId);
      }

      // Send cancellation notification
      this.sendCancellationNotification(userId, eventId)
        .catch(err => console.error('Notification error:', err));

      // Send email on cancellation (non-blocking)
      try {
        const fullRegistration = await eventRegistrationRepository.findById(registrationId, {
          populate: ['event', 'user']
        });

        await sendEventCancellationEmail({
          to: fullRegistration.user.email,
          userName: fullRegistration.user.firstName,
          eventName: fullRegistration.event.title,
          eventDate: fullRegistration.event.startDate,
          eventLocation: fullRegistration.event.location,
          organizerName: fullRegistration.event.organizer?.firstName || 'Organizer'
        });
      } catch (err) {
        console.error('Failed to send registration cancellation email:', err);
      }


      return {
        success: true,
        message: 'Registration cancelled successfully',
        registration: await eventRegistrationRepository.findById(registrationId, { 
          populate: ['event', 'user'] 
        })
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Promote first waitlisted user to registered
   * Called when a spot opens up
   * @param {String} eventId - Event ID
   * @returns {Promise<Object|null>} Promoted registration or null
   */
  async promoteFromWaitlist(eventId) {
    try {
      // Get first waitlisted registration
      const firstWaitlisted = await eventRegistrationRepository.getFirstWaitlisted(eventId);
      
      if (!firstWaitlisted) {
        return null; // No one on waitlist
      }

      // Update status to REGISTERED
      firstWaitlisted.status = RegistrationStatus.REGISTERED;
      firstWaitlisted.waitlistPosition = null;
      await firstWaitlisted.save();

      // Note: currentRegistrations is automatically updated by EventRegistration post-save hook

      // Recalculate remaining waitlist positions
      await eventRegistrationRepository.recalculateWaitlistPositions(eventId);

      // Send promotion notification
      const promotedUserId = (firstWaitlisted.user._id || firstWaitlisted.user).toString();
      this.sendWaitlistPromotionNotification(
        promotedUserId, 
        eventId, 
        firstWaitlisted._id
      ).catch(err => console.error('Notification error:', err));

      return {
        success: true,
        registration: firstWaitlisted,
        message: 'User promoted from waitlist'
      };
    } catch (error) {
      console.error('Error promoting from waitlist:', error);
      throw error;
    }
  }

  /**
   * Check if user is eligible to register for event
   * @param {String} userId - User ID
   * @param {String} eventId - Event ID
   * @returns {Promise<Object>} Eligibility result
   */
  async checkEligibility(userId, eventId) {
    try {
      // Check if user already has active registration
      const existingRegistration = await eventRegistrationRepository.findByUserAndEvent(userId, eventId);
      
      if (existingRegistration && 
          (existingRegistration.status === RegistrationStatus.REGISTERED || 
           existingRegistration.status === RegistrationStatus.WAITLISTED)) {
        return {
          eligible: false,
          reason: 'Already registered for this event',
          status: existingRegistration.status
        };
      }

      // Fetch event
      const event = await eventRepository.findById(eventId, { lean: true });
      
      if (!event) {
        return {
          eligible: false,
          reason: 'Event not found'
        };
      }

      // Check event status
      if (event.status !== EventStatus.PUBLISHED) {
        return {
          eligible: false,
          reason: `Event is ${event.status.toLowerCase()}`
        };
      }

      // Check if event has ended
      if (event.endDate < new Date()) {
        return {
          eligible: false,
          reason: 'Event has already ended'
        };
      }

      // Check capacity
      const hasCapacity = event.maxRegistrations === null || 
                          event.currentRegistrations < event.maxRegistrations;

      return {
        eligible: true,
        hasCapacity: hasCapacity,
        willBeWaitlisted: !hasCapacity,
        availableSpots: event.maxRegistrations ? 
          Math.max(0, event.maxRegistrations - event.currentRegistrations) : null
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's registrations with filters
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options (status, etc.)
   * @param {Object} options - Query options (page, limit, sort)
   * @returns {Promise<Object>} User's registrations with pagination
   */
  async getUserRegistrations(userId, filters = {}, options = {}) {
    try {
      const queryFilters = {};
      
      if (filters.status) {
        queryFilters.status = filters.status;
      }

      const result = await eventRegistrationRepository.findByUser(userId, queryFilters, {
        page: options.page || 1,
        limit: options.limit || 50,
        sort: options.sort || { createdAt: -1 },
        populate: true,
        lean: false
      });

      // Filter out registrations where event is null (event was deleted)
      result.registrations = result.registrations.filter(reg => reg.event !== null);

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get event attendees (for organizers)
   * @param {String} eventId - Event ID
   * @param {String} userId - User ID (must be organizer)
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Event attendees with pagination
   */
  async getEventAttendees(eventId, userId, filters = {}, options = {}) {
    try {
      // Verify user is organizer
      const isOrganizer = await eventRepository.isOrganizer(eventId, userId);
      
      if (!isOrganizer) {
        throw new ForbiddenError('Only event organizers can view attendees');
      }

      const queryFilters = {};
      
      // Default to showing registered users if no status specified
      if (filters.status) {
        queryFilters.status = filters.status;
      } else {
        queryFilters.status = RegistrationStatus.REGISTERED;
      }

      const result = await eventRegistrationRepository.findByEvent(eventId, queryFilters, {
        page: options.page || 1,
        limit: options.limit || 100,
        sort: options.sort || { registeredAt: 1 },
        populate: true,
        lean: false
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark attendance for a registration
   * @param {String} registrationId - Registration ID
   * @param {String} userId - User ID (must be organizer)
   * @param {Boolean} attended - Attendance status
   * @returns {Promise<Object>} Updated registration
   */
  async markAttendance(registrationId, userId, attended = true) {
    try {
      // Fetch registration
      const registration = await eventRegistrationRepository.findById(registrationId, { 
        populate: ['event'] 
      });
      
      if (!registration) {
        throw new NotFoundError('Registration not found');
      }

      // Verify user is organizer
      const registrationEventId = (registration.event._id || registration.event).toString();
      const isOrganizer = await eventRepository.isOrganizer(registrationEventId, userId);
      
      if (!isOrganizer) {
        throw new ForbiddenError('Only event organizers can mark attendance');
      }

      // Check if event has ended (event is populated, so we can access endDate directly)
      if (registration.event.endDate > new Date()) {
        throw new ForbiddenError('Cannot mark attendance before event ends');
      }

      // Check if user was registered (not cancelled or waitlisted)
      if (registration.status !== RegistrationStatus.REGISTERED) {
        throw new BadRequestError('Cannot mark attendance for non-registered users');
      }

      // Update attendance status
      if (attended) {
        registration.status = RegistrationStatus.ATTENDED;
        registration.attendedAt = new Date();
      } else {
        registration.status = RegistrationStatus.NO_SHOW;
      }

      await registration.save();

      return {
        success: true,
        registration: await eventRegistrationRepository.findById(registrationId, { 
          populate: ['event', 'user'] 
        }),
        message: attended ? 'Attendance marked successfully' : 'Marked as no-show'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get registration details
   * @param {String} registrationId - Registration ID
   * @param {String} userId - User ID (for permission check)
   * @returns {Promise<Object>} Registration details
   */
  async getRegistrationDetails(registrationId, userId) {
    try {
      const registration = await eventRegistrationRepository.findById(registrationId, { 
        populate: ['event', 'user'] 
      });
      
      if (!registration) {
        throw new NotFoundError('Registration not found');
      }

      // User can view their own registration or organizer can view
      const registrationUserId = registration.user._id || registration.user;
      const registrationEventId = registration.event._id || registration.event;
      const isOwner = registrationUserId.equals ? registrationUserId.equals(userId) : registrationUserId.toString() === userId.toString();
      const isOrganizer = await eventRepository.isOrganizer(registrationEventId, userId);

      if (!isOwner && !isOrganizer) {
        throw new ForbiddenError('You do not have permission to view this registration');
      }

      return registration;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get registration statistics for an event
   * @param {String} eventId - Event ID
   * @param {String} userId - User ID (must be organizer)
   * @returns {Promise<Object>} Registration statistics
   */
  async getRegistrationStats(eventId, userId) {
    try {
      // Verify user is organizer
      const isOrganizer = await eventRepository.isOrganizer(eventId, userId);
      
      if (!isOrganizer) {
        throw new ForbiddenError('Only event organizers can view statistics');
      }

      const stats = await eventRegistrationRepository.getEventRegistrationStats(eventId);
      const event = await eventRepository.findById(eventId, { lean: true });

      return {
        ...stats,
        capacity: event.maxRegistrations,
        availableSpots: event.maxRegistrations ? 
          Math.max(0, event.maxRegistrations - event.currentRegistrations) : null,
        isFull: event.maxRegistrations ? 
          event.currentRegistrations >= event.maxRegistrations : false
      };
    } catch (error) {
      throw error;
    }
  }

  // Notification helper methods

  async sendRegistrationConfirmationNotification(userId, eventId, registrationId) {
    try {
      // Ensure userId is properly formatted
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      const event = await Event.findById(eventId).select('title startDate').lean();
      
      if (!event) {
        console.error(`[Registration] Event not found: ${eventId}`);
        return;
      }
      
      console.log(`[Registration] Creating notification for user ${userIdObj.toString()}, event: ${eventId}`);
      
      const notification = await Notification.create({
        user: userIdObj,
        type: NotificationType.REGISTRATION_CONFIRMED,
        title: 'Registration Confirmed',
        message: `You have successfully registered for "${event.title}"`,
        event: eventId,
        registration: registrationId,
        actionUrl: `/app/events/${eventId}`,
        metadata: {
          eventTitle: event.title,
          eventDate: event.startDate
        }
      });
      console.log(`[Registration] ✓ Created notification for user ${userIdObj.toString()}, notification ID: ${notification._id}`);
    } catch (error) {
      console.error('[Registration] ✗ Error sending confirmation notification:', error.message);
      console.error('[Registration] Error details:', error);
      if (error.errors) {
        console.error('[Registration] Validation errors:', error.errors);
      }
    }
  }

  async sendWaitlistNotification(userId, eventId, registrationId, position) {
    try {
      // Ensure userId is properly formatted
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      const event = await Event.findById(eventId).select('title startDate').lean();
      
      if (!event) {
        console.error(`[Registration] Event not found for waitlist: ${eventId}`);
        return;
      }
      
      console.log(`[Registration] Creating waitlist notification for user ${userIdObj.toString()}, event: ${eventId}`);
      
      const notification = await Notification.create({
        user: userIdObj,
        type: NotificationType.REGISTRATION_WAITLISTED,
        title: 'Added to Waitlist',
        message: `You are #${position} on the waitlist for "${event.title}"`,
        event: eventId,
        registration: registrationId,
        actionUrl: `/app/events/${eventId}`,
        metadata: {
          eventTitle: event.title,
          waitlistPosition: position
        }
      });
      console.log(`[Registration] ✓ Created waitlist notification for user ${userIdObj.toString()}, notification ID: ${notification._id}`);
    } catch (error) {
      console.error('[Registration] ✗ Error sending waitlist notification:', error.message);
      console.error('[Registration] Error details:', error);
      if (error.errors) {
        console.error('[Registration] Validation errors:', error.errors);
      }
    }
  }

  async sendWaitlistPromotionNotification(userId, eventId, registrationId) {
    try {
      // Ensure userId is properly formatted
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      const event = await Event.findById(eventId).select('title startDate').lean();
      
      if (!event) {
        console.error(`[Registration] Event not found for waitlist promotion: ${eventId}`);
        return;
      }
      
      console.log(`[Registration] Creating waitlist promotion notification for user ${userIdObj.toString()}, event: ${eventId}`);
      
      const notification = await Notification.create({
        user: userIdObj,
        type: NotificationType.REGISTRATION_APPROVED,
        title: 'Promoted from Waitlist',
        message: `A spot opened up! You are now registered for "${event.title}"`,
        event: eventId,
        registration: registrationId,
        actionUrl: `/app/events/${eventId}`,
        metadata: {
          eventTitle: event.title,
          promotedFrom: 'waitlist'
        }
      });
      console.log(`[Registration] ✓ Created waitlist promotion notification for user ${userIdObj.toString()}, notification ID: ${notification._id}`);
    } catch (error) {
      console.error('[Registration] ✗ Error sending promotion notification:', error.message);
      console.error('[Registration] Error details:', error);
      if (error.errors) {
        console.error('[Registration] Validation errors:', error.errors);
      }
    }
  }

  async sendCancellationNotification(userId, eventId) {
    try {
      // Ensure userId is properly formatted
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      const event = await Event.findById(eventId).select('title').lean();
      
      if (!event) {
        console.error(`[Registration] Event not found for cancellation: ${eventId}`);
        return;
      }
      
      console.log(`[Registration] Creating cancellation notification for user ${userIdObj.toString()}, event: ${eventId}`);
      
      const notification = await Notification.create({
        user: userIdObj,
        type: NotificationType.EVENT_CANCELLED,
        title: 'Registration Cancelled',
        message: `Your registration for "${event.title}" has been cancelled`,
        event: eventId,
        actionUrl: `/app/events/${eventId}`,
        metadata: {
          eventTitle: event.title,
          cancellationType: 'user_initiated'
        }
      });
      console.log(`[Registration] ✓ Created cancellation notification for user ${userIdObj.toString()}, notification ID: ${notification._id}`);
    } catch (error) {
      console.error('[Registration] ✗ Error sending cancellation notification:', error.message);
      console.error('[Registration] Error details:', error);
      if (error.errors) {
        console.error('[Registration] Validation errors:', error.errors);
      }
    }
  }
}

module.exports = new RegistrationService();

