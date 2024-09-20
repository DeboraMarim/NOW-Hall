const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentId: String,
  names: [String],
  day: [String],
  status: String,
  statusDetail: String,
  transactionAmount: Number,
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
