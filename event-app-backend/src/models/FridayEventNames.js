const mongoose = require('mongoose');

const FridayEventNamesSchema = new mongoose.Schema({
  names: [String]
});

module.exports = mongoose.model('FridayEventNames', FridayEventNamesSchema);
