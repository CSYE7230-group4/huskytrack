/**
 * User Seeder
 * Seeds initial test users for development
 */

const User = require('../../models/User');

// Default users
const testUsers = [
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@northeastern.edu',
        password: 'Password123!',
    },
    {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@northeastern.edu',
        password: 'Password123!',
    },
    {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@northeastern.edu',
        password: 'Admin123!',
    }
];

async function seedUsers() {
    try {
        // Check if users already exist
        const existingUsersCount = await User.countDocuments();
        
        if (existingUsersCount > 0) {
            console.log(`Found ${existingUsersCount} existing users. Skipping user seeding.`);
            return;
        }

        // Create users
        const createdUsers = await User.create(testUsers);
        
        console.log(`Created ${createdUsers.length} test users`);
        
        // Log created user emails (for reference)
        createdUsers.forEach(user => {
            console.log(`   - ${user.email}`);
        });

    } catch (error) {
        console.error('Error seeding users:', error.message);
        throw error;
    }
}

module.exports = seedUsers;

