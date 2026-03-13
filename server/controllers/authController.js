const User = require('../models/User');

// Register user
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
   
    let userExists =await User.findOne({ email });
    if(userExists){
       return res.status(400).json({ message: 'User already exists' });
    }
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);  
     

     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
     console.log('Generated OTP:', otp); // Log the OTP for testing purposes
     

    try{
        const user = new User({ name, email, password:hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });      
    }catch (error) {
        res.status(400).json({ message: 'Error registering user', error });
    }
};