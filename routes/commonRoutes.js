const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');
const constituencyController = require('../controllers/constituencyController');

// Party routes
router.get('/parties', partyController.getAllParties);
router.get('/parties/:party', partyController.getByPartyName);

// Constituency routes
router.get('/constituencies', constituencyController.getAllConstituencies);
router.get('/constituencies/:constituency', constituencyController.getByConstituencyName);

module.exports = router;
