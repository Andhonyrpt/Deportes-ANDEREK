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
    console.log(user);
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
            return res.status(400).json({ message: 'User already exist' });
        }

        let role = 'guest';
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

};

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

        res.status(200).json({ token, refreshToken });
    } catch (err) {
        next(err);
    }

};

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
};

async function refreshToken(req, res, next) {
    try {
        const token = req.body.refreshToken;

        if (!token) return res.status(401).json({ message: "No refresh token provider" });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });

            const newAccessToken = generateToken(
                decoded.userId,
                decoded.displayName,
                decoded.role
            );

            // // OPCIONAL.
            // //Esto sirve como en las redes sociales para nunca pedir el inicio de sesion y sea un refresh infinito 
            // const newRefreshToken = generateRefreshToken(
            //   decoded.userId,
            //   decoded.displayName,
            //   decoded.role,
            // );

            res.status(200).json({ token: newAccessToken, refreshToken: token });
            // .json({ token: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (error) {
        next(error);
    }
}

export { register, login, checkEmail, refreshToken };