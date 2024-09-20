const mongoose = require('mongoose');

const SaturdayEventNamesSchema = new mongoose.Schema({
  names: [String]
});

module.exports = mongoose.model('SaturdayEventNames', SaturdayEventNamesSchema);
