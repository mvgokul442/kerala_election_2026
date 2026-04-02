// models/Constituency.js
const mongoose = require('mongoose');

const ConstituencySchema = new mongoose.Schema({
  constituency: { type: String, unique: true }
});

module.exports = mongoose.model('Constituency', ConstituencySchema);
