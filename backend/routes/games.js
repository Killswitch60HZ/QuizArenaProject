const express = require('express');
const router = express.Router();
const { saveGameResult, getGameHistory } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, saveGameResult);
router.route('/history').get(protect, getGameHistory);

module.exports = router;