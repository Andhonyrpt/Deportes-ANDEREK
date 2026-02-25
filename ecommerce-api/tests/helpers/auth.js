import jwt from 'jsonwebtoken';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';

export async function getAuthToken(role = 'customer') {
    const email = `${role}@test.com`;
    let user = await User.findOne({ email });

    if (!user) {
        const hashPassword = await bcrypt.hash('Password123', 10);
        try {
            user = await User.create({
                displayName: `${role} User`,
                email,
                hashPassword,
                role,
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
