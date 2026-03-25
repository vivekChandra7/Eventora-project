const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOTPEmail = async (email, otp, type) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Eventora - Your OTP Code',
            html: `
                <h2>Your OTP Code</h2>
                <p>Use this OTP to verify your account:</p>
                <h1 style="letter-spacing: 8px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('OTP sent to', email);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

exports.sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
                <h2>Hi ${userName}!</h2>
                <p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p>
                <p>Thank you for choosing Eventora.</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('Booking email sent to', userEmail);
    } catch (error) {
        console.error('Error sending booking email:', error);
        throw error;
    }
};