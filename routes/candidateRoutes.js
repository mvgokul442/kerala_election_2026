const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

router.get('/', candidateController.getCandidates);
router.get('/stats', candidateController.getCandidatesStats);
router.get('/state/:state', candidateController.getByState);
router.get('/constituency/:constituency', candidateController.getByConstituency);
router.get('/party/:party', candidateController.getByParty);
router.get('/name/:name', candidateController.getByName);

module.exports = router;
