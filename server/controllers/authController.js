const User = require('../models/User');

// Register user
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    
    try{
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });      
    }catch (error) {
        res.status(400).json({ message: 'Error registering user', error });
    }
};