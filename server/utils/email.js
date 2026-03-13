const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
}); 

exports.sendOtpEmail = async (email, otp ,type) => {
    try {
        const mailOptions = {
        from: process.env.EMAIL_USER,   
        to: email,
        subject: 'Your OTP for Eventora',
        text: `Your OTP for Eventora is: ${otp}. It will expire in 5 minutes.`,
    };  
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email} for ${type}`);
    } catch (error) {
        console.error('Error sending OTP email to ${email} for ${type}:', error);
    }
};