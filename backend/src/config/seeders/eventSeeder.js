/**
 * Event Seeder
 */

const { Event, EventStatus } = require('../../models/Event');
const { User } = require('../../models/User');

/**
 * Seed sample events
 */
async function seedEvents() {
  try {
    console.log('Seeding events...');

    // Find organizers
    const organizer = await User.findOne({ role: 'ORGANIZER' });
    if (!organizer) {
      console.error('No organizer found. Please seed users first.');
      return;
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Create sample events
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    const futureDate3 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 21 days from now

    const events = [
      {
        title: 'HuskyHack 2025',
        description: 'Annual hackathon for Northeastern students. Join us for 24 hours of coding, collaboration, and innovation. Great prizes and networking opportunities!',
        organizer: organizer._id,
        category: 'Academic',
        status: EventStatus.PUBLISHED,
        startDate: new Date(futureDate1.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endDate: new Date(futureDate1.getTime() + 33 * 60 * 60 * 1000), // 9 AM next day
        location: {
          name: 'Curry Student Center',
          address: '360 Huntington Ave',
          city: 'Boston',
          state: 'MA',
          zipCode: '02115',
          isVirtual: false
        },
        maxRegistrations: 200,
        currentRegistrations: 45,
        tags: ['hackathon', 'coding', 'technology', 'innovation'],
        isPublic: true
      },
      {
        title: 'Career Fair 2025',
        description: 'Connect with top employers and explore career opportunities. Bring your resume and dress professionally!',
        organizer: organizer._id,
        category: 'Career',
        status: EventStatus.PUBLISHED,
        startDate: new Date(futureDate2.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        endDate: new Date(futureDate2.getTime() + 16 * 60 * 60 * 1000), // 4 PM
        location: {
          name: 'Matthews Arena',
          address: '238 St Botolph St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02115',
          isVirtual: false
        },
        maxRegistrations: 500,
        currentRegistrations: 150,
        tags: ['career', 'jobs', 'networking', 'employers'],
        isPublic: true
      },
      {
        title: 'Virtual Tech Talk: AI & Machine Learning',
        description: 'Join us for an exciting discussion about the latest trends in AI and ML. Industry experts will share their insights.',
        organizer: organizer._id,
        category: 'Academic',
        status: EventStatus.PUBLISHED,
        startDate: new Date(futureDate3.getTime() + 18 * 60 * 60 * 1000), // 6 PM
        endDate: new Date(futureDate3.getTime() + 20 * 60 * 60 * 1000), // 8 PM
        location: {
          name: 'Zoom Meeting',
          isVirtual: true,
          virtualLink: 'https://zoom.us/j/123456789'
        },
        maxRegistrations: 100,
        currentRegistrations: 75,
        tags: ['AI', 'machine learning', 'tech talk', 'virtual'],
        isPublic: true
      },
      {
        title: 'Basketball Tournament',
        description: 'Join the intramural basketball tournament. All skill levels welcome!',
        organizer: organizer._id,
        category: 'Sports',
        status: EventStatus.DRAFT,
        startDate: new Date(futureDate2.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endDate: new Date(futureDate2.getTime() + 18 * 60 * 60 * 1000), // 6 PM
        location: {
          name: 'Cabot Center',
          address: '534 Huntington Ave',
          city: 'Boston',
          state: 'MA',
          zipCode: '02115',
          isVirtual: false
        },
        maxRegistrations: 50,
        currentRegistrations: 0,
        tags: ['basketball', 'sports', 'tournament', 'intramural'],
        isPublic: true
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`Created ${createdEvents.length} events successfully`);

    return createdEvents;
  } catch (error) {
    console.error('Error seeding events:', error.message);
    throw error;
  }
}

/**
 * Clear all events
 */
async function clearEvents() {
  try {
    await Event.deleteMany({});
    console.log('Cleared all events');
  } catch (error) {
    console.error('Error clearing events:', error.message);
    throw error;
  }
}

module.exports = {
  seedEvents,
  clearEvents
};

