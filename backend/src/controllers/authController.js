const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = new User({ firstName, lastName, email, password });
        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user._id });

        res.json({ success: true, token });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
