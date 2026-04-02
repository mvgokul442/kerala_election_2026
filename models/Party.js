// models/Party.js
const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  party: { type: String, unique: true }
});

module.exports = mongoose.model('Party', PartySchema);
