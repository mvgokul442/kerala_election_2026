const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: String,
  party: String,
  status: String,
  state: String,
  constituency: String,
  profileLink: String,
  image: String
});

module.exports = mongoose.model('Candidate', candidateSchema);
