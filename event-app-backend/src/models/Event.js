const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  day: String,
  flyer: String,
  pistaPrice: Number,
  camarotePrice: Number,
  camaroteOpenPrice: Number,
  active: Boolean,
});

module.exports = mongoose.model('Event', EventSchema);
