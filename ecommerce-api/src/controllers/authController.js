import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import errorHandler from '../middlewares/errorHandler.js';

const generateToken = (userId, displayName, role) => {
    return jwt.sign({ userId, displayName, role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
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

async function register(req, res) {

    try {
        const { displayName, email, role, avatar, phone } = req.body;

        const userExist = await checkUserExist(email);
        if (userExist) {
            return res.status(400).json({ message: 'User already exist' });
        }

        const hashPassword = await generatePassword(req.body.password);

        const newUser = new User({
            displayName,
            email,
            hashPassword,
            role,
            avatar,
            phone
        });
        await newUser.save();

        res.status(201).json(newUser);

    } catch (err) {
        errorHandler(err, req, res);
    }

};

async function login(req, res) {

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

        const token = generateToken(userExist._id, userExist.displayName, userExist.role);
        res.status(200).json({ token });
    } catch (err) {
        errorHandler(err, req, res);
    }

};

export { register, login };