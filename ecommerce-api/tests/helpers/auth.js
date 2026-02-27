import jwt from 'jsonwebtoken';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';

/**
 * Creates (or finds) a test user and returns a signed JWT.
 *
 * @param {string} role - The user role: 'customer' | 'admin' | 'guest'
 * @param {string} [emailSuffix] - Optional suffix to create a second distinct user
 *   e.g. getAuthToken('customer', '2') → email: customer2@test.com, role: customer
 */
export async function getAuthToken(role = 'customer', emailSuffix = '') {
    const email = `${role}${emailSuffix}@test.com`;
    let user = await User.findOne({ email });

    if (!user) {
        const hashPassword = await bcrypt.hash('Password123', 10);
        try {
            user = await User.create({
                displayName: `${role}${emailSuffix} User`,
                email,
                hashPassword,
                role,     // always use the role enum value (customer/admin/guest)
                phone: '1234567890'
            });
        } catch (error) {
            // If another test created the user in the meantime, just fetch it
            if (error.code === 11000) {
                user = await User.findOne({ email });
            } else {
                throw error;
            }
        }
    }

    return jwt.sign(
        { userId: user._id, displayName: user.displayName, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}
