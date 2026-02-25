import jwt from 'jsonwebtoken';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';

export async function getAuthToken(role = 'customer') {
    const email = `${role}@test.com`;
    let user = await User.findOne({ email });

    if (!user) {
        const hashPassword = await bcrypt.hash('Password123', 10);
        user = await User.create({
            displayName: `${role} User`,
            email,
            hashPassword,
            role,
            phone: '1234567890'
        });
    }

    return jwt.sign(
        { userId: user._id, displayName: user.displayName, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}
