const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Place" },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  nameCustomer: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  price: Number,
});

const BookingModel = mongoose.model("Booking", bookingSchema);

module.exports = BookingModel;
