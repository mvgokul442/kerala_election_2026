const Constituency = require('../models/Constituency');

// Get all constituencies
exports.getAllConstituencies = async (req, res) => {
  const constituencies = await Constituency.find();
  res.json(constituencies);
};

// Get by constituency name
exports.getByConstituencyName = async (req, res) => {
  const constituency = await Constituency.findOne({ constituency: req.params.constituency });
  res.json(constituency);
};
