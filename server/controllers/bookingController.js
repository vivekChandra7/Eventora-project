const Booking = require("../models/Booking.js");
const OTP = require("../models/OTP");
const Event = require("../models/Event");
const User = require("../models/User");
const { sentOTPEmail, sendBookingEmail } = require("../utils/email");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for booking confirmation
exports.sendBookingOTP = async (req, res) => {
  const otp = generateOtp();
  await OTP.findOneAndDelete({
    email: req.user.email,
    action: "event_booking",
  });
  await OTP.create({
    email: req.user.email,
    otp: otp,
    action: "event_booking",
  });
  await sentOTPEmail(req.user.email, otp, "event_booking");
  res.json({ message: "OTP sent successfully" });
};

// Book an event
exports.bookEvent = async (req, res) => {
  const { eventId, otp } = req.body;
  const otpRecord = await OTP.findOne({
    email: req.user.email,
    otp: otp,
    action: "event_booking",
  });
  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  if (event.totalSeats <= 0) {
    return res.status(400).json({ message: "No seats available" });
  }

  const existingBooking = await Booking.findOne({
    userId: req.user._id,
    eventId: eventId,
    amount: event.ticketPrice,
  });
  if (existingBooking) {
    return res
      .status(400)
      .json({ message: "You have already booked this event" });
  }

  const booking = await Booking.create({
    userId: req.user._id,
    eventId: eventId,
    status: "pending",
    paymentStatus: "non_paid",
    amount: event.ticketPrice,
  });

  await OTP.deleteMany({ email: req.user.email, action: "event_booking" });
  res
    .status(201)
    .json({
      message:
        "Booking created successfully. Please check your email for details.",
      booking,
    });
};

exports.confirmBooking = async (req, res) => {
  const paymentStatus = req.body.paymentStatus;
  if (!["paid", "non_paid"].includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  const booking = await Booking.findById(req.params.id)
    .populate("userId")
    .populate("eventId");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status === "confirmed") {
    return res.status(400).json({ message: " booking is already confirmed" });
  }

  const event = await Event.findById(booking.eventId._id);
  if (event.totalSeats <= 0) {
    return res.status(400).json({ message: "No seats available" });
  }

  booking.status = "confirmed";
  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }
  await booking.save();
  event.totalSeats -= 1;
  await event.save();
  //admin confirms the booking, send email to user
  await sendBookingEmail(req.user.email, req.user.name, event.title);
  res.json({ message: "Booking confirmed successfully" });
};

exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("eventId")
  res.json(bookings);
}
//cancel booking
exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "unauthorized" });
    }
    booking.status = "cancelled";
    await booking.save();
    if (booking.status === "confirmed") {
        const event = await Event.findById(booking.eventId._id);
        event.totalSeats += 1;
        await event.save();
    }
    await booking.remove();
    res.json({ message: "Booking cancelled successfully" });
};

// Get bookings for logged in user
exports.getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate("eventId");
  res.json(bookings);
};