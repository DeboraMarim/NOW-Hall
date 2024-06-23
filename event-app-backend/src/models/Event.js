const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  date: String,
  flyer: String,
  price: Number,
  active: Boolean,
});

module.exports = mongoose.model('Event', EventSchema);
