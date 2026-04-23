import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const generateToken = (userId, displayName, role) => {
    return jwt.sign({ userId, displayName, role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

const generateRefreshToken = (userId, displayName, role) => {
    return jwt.sign({ userId, displayName, role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

const checkUserExist = async (email) => {
    const user = await User.findOne({ email });
    return user;
};

const generatePassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

async function register(req, res, next) {
    try {
        const { displayName, email, password, phone } = req.body;

        const userExist = await checkUserExist(email);
        if (userExist) {
            return res.status(201).json({ displayName, email, phone });
        }

        let role = 'customer';
        const hashPassword = await generatePassword(password);

        const newUser = new User({
            displayName,
            email,
            hashPassword,
            role,
            phone
        });
        await newUser.save();

        res.status(201).json({ displayName, email, phone });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const userExist = await checkUserExist(email);
        if (!userExist) {
            return res.status(400).json({ message: "User doesn't exist. You have to sign in" });
        }

        const isMatch = await bcrypt.compare(password, userExist.hashPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(
            userExist._id,
            userExist.displayName,
            userExist.role
        );

        const refreshToken = generateRefreshToken(
            userExist._id,
            userExist.displayName,
            userExist.role
        );

        // Set cookies
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1h
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 3600000 // 7d
        });

        res.status(200).json({ 
            token, 
            refreshToken,
            user: {
                id: userExist._id,
                displayName: userExist.displayName,
                email: userExist.email,
                role: userExist.role
            }
        });
    } catch (err) {
        next(err);
    }
}

async function checkEmail(req, res, next) {
    try {
        const email = String(req.query.email || "")
            .trim()
            .toLowerCase();

        const user = await User.findOne({ email });
        res.json({ taken: !!user });
    } catch (err) {
        next(err);
    }
}

async function refreshToken(req, res, next) {
    try {
        let token = req.body?.refreshToken || req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Si el token es un string tipo "refreshToken=xxx", limpiarlo
        if (typeof token === 'string' && token.includes('refreshToken=')) {
            token = token.split('refreshToken=')[1].split(';')[0];
        }

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        const newAccessToken = generateToken(
            decoded.userId,
            decoded.displayName,
            decoded.role
        );

        res.cookie('authToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1h
        });

        res.status(200).json({ token: newAccessToken, refreshToken: token });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }
        next(error);
    }
}

async function logout(req, res) {
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Logged out successfully" });
}

export { register, login, checkEmail, refreshToken, logout };