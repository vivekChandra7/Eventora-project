const OTP = require("../models/OTP");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");
//generate token
 
const generateToken = (id,role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    }); 
}

// Register user
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  let userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    console.log(` OTP for ${email} : ${otp}`); // Log the OTP for testing purposes
    await OTP.create({ email, otp, action: "account_verification" });
    await sendOtpEmail(email, otp, "account_verification");
    res.status(201).json({ message: "User registered successfully. Please verify your email." ,
        email: user.email
     });

  } 
    catch (error) { 
    res.status(500).json({error: error.message   });
   }
};

//login user 
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user){
        return res.status(400).json({ message: "Invalid credentials , plzz signup first " });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({ error: "Invalid credentials" });
    }
    if(!user.isVerified && user.role === "user"){
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        await OTP.deleteMany({ email, action: "account_verification" }); // Remove any existing OTPs for login 
        await OTP.create({ email, otp, action: "account_verification" });
        await sendOtpEmail(email, otp, "account_verification");
        return res.status(400).json({ error: " Account not verified.A new OTP has been sent to your email " });
    }
     res.json({ message: "Login successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
     });
};

//verify otp
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.query;
    const otpRecord = await OTP.findOne({ email, otp, action: "account_verification" });
    if(!otpRecord){
        return res.status(400).json({ error: "Invalid OR Expired OTP" });
    }
    
    const user = await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email, action: "account_verification" });    
    res.json({
        
        message: "Account verified successfully. You can now login.", 
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)   

    }

    );
};
