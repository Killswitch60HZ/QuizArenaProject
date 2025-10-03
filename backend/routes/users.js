const express = require('express');
const router = express.Router();
const { getUsersForLeaderboard } = require('../controllers/userController');

router.get('/leaderboard', getUsersForLeaderboard);

module.exports = router;