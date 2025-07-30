import User from '../models/user.js';
import { generatePassword } from './authController.js';
import errorHandler from '../middlewares/errorHandler.js';


async function getUsers(req, res) {

    try {

        const products = await User.find().sort({ name: 1 });

        res.json(products);

    } catch (err) {
        errorHandler(err, req, res);
    }
};

async function getUserById(req, res) {

    try {

        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (err) {
        errorHandler(err, req, res);
    }
};

async function createUser(req, res) {

    try {

        //const { password } = req.body;
        const { displayName, email, password, role, avatar, phone, isActive } = req.body;
        const hashPassword = await generatePassword(password);

        if (!displayName || !email || !hashPassword || !role || !avatar || !phone || !isActive) {
            return res.status(400).json({ error: 'All files are required' });
        }

        const newUser = await User.create({ displayName, email, hashPassword, role, avatar, phone, isActive });
        res.status(201).json(newUser);

    } catch (err) {
        errorHandler(err, req, res);
    }
};

async function updateUser(req, res) {

    try {

        const { id } = req.params;
        const { displayName, email, password, role, avatar, phone, isActive } = req.body;
        const hashPassword = await generatePassword(password);


        if (!displayName || !email || !hashPassword || !role || !avatar || !phone || !isActive) {
            return res.status(400).json({ error: 'All files are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(id, { displayName, email, hashPassword, role, avatar, phone, isActive }, { new: true });

        if (updatedUser) {
            return res.status(200).json(updatedUser);
        } else {
            return res.status(404).json({ message: 'User not found' })
        }

    } catch (err) {
        errorHandler(err, req, res);
    }
};

async function deleteUser(req, res) {

    try {

        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (deletedUser) {
            return res.status(204).send();
        } else {
            return res.status(404).json({ message: 'User not found' })
        }

    } catch (err) {
        errorHandler(err, req, res);
    }
};

export {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};