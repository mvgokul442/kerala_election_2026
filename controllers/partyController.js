const Party = require('../models/Party');

// Get all parties
exports.getAllParties = async (req, res) => {
  const parties = await Party.find();
  res.json(parties);
};

// Get by party name
exports.getByPartyName = async (req, res) => {
  const party = await Party.findOne({ party: req.params.party });
  res.json(party);
};
