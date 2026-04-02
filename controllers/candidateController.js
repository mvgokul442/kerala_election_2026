const Candidate = require('../models/Candidate');


// Get candidates with optional filters (name, party, constituency) + pagination
exports.getCandidates = async (req, res) => {
// const duplicates = await Candidate.aggregate([
//       {
//         $group: {
//           _id: { name: "$name", party: "$party", constituency: "$constituency" },
//           ids: { $push: "$_id" },
//           count: { $sum: 1 }
//         }
//       },
//       { $match: { count: { $gt: 1 } } }
//     ]);

//     for (const dup of duplicates) {
//       // keep the first id, delete the rest
//       const [keep, ...remove] = dup.ids;
//       if (remove.length > 0) {
//         await Candidate.deleteMany({ _id: { $in: remove } });
//         console.log(`Removed ${remove.length} duplicates for`, dup._id);
//       }
//     }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object dynamically
    const filter = {};

    if (req.query.name) {
      // Case-insensitive match for name
      filter.name = { $regex: req.query.name, $options: 'i' };
    }

    if (req.query.party) {
      // Support multiple parties via comma-separated values
      const parties = req.query.party.split(',');
      filter.party = { $in: parties };
    }

    if (req.query.constituency) {
      filter.constituency = req.query.constituency;
    }

    if (req.query.state) {
      filter.state = req.query.state;
    }

    if (req.query.district) {
      filter.district = req.query.district;
    }

    // Fetch candidates with filters + pagination
    const candidates = await Candidate.find(filter)
      .skip(skip)
      .limit(limit);

    const total = await Candidate.countDocuments(filter);

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      candidates,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Get by state
exports.getByState = async (req, res) => {
  const candidates = await Candidate.find({ state: req.params.state });
  res.json(candidates);
};

// Get by constituency
exports.getByConstituency = async (req, res) => {
  const candidates = await Candidate.find({ constituency: req.params.constituency });
  res.json(candidates);
};

// Get by party
exports.getByParty = async (req, res) => {
  const candidates = await Candidate.find({ party: req.params.party });
  res.json(candidates);
};

// Get by name

exports.getByName = async (req, res) => {
  try {
    const { name } = req.query;
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    const candidates = await Candidate.find(query);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCandidatesStats = async (req, res) => {
  try {
    // Build filter object (same logic as your listing endpoint)
    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.party) {
      const parties = req.query.party.split(',').map(p => p.trim()).filter(Boolean);
      if (parties.length) filter.party = { $in: parties };
    }
    if (req.query.constituency) filter.constituency = req.query.constituency;
    if (req.query.state) filter.state = req.query.state;
    if (req.query.district) filter.district = req.query.district;

    // Aggregation: single pipeline with $facet to get total and grouped counts in one DB roundtrip
    const agg = [
      { $match: filter },
      {
        $facet: {
          total: [{ $count: 'count' }], // [{ count: N }] or []
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, status: '$_id', count: 1 } }
          ]
        }
      }
    ];

    const [result] = await Candidate.aggregate(agg).allowDiskUse(true);

    const total = (result.total && result.total[0] && result.total[0].count) || 0;

    // Convert byStatus array to object map
    const countsByStatus = (result.byStatus || []).reduce((acc, cur) => {
      acc[cur.status || 'Unknown'] = cur.count;
      return acc;
    }, {});

    // Optional: overall collection count (no filters) — fast with estimatedDocumentCount
    const overallTotal = await Candidate.estimatedDocumentCount();

    return res.json({
      total,
      countsByStatus,
      overallTotal
    });
  } catch (err) {
    console.error('getCandidatesStats error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


