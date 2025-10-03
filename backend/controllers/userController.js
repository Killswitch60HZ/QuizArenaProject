const User = require('../models/User');

/**
 * @desc    Get all users for the leaderboard, sorted by score
 * @route   GET /api/users/leaderboard
 * @access  Public
 */
const getUsersForLeaderboard = async (req, res) => {
    try {
        // Find all users, sort by score descending, and limit to top 10
        const users = await User.find({}).sort({ score: -1 }).limit(10).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUsersForLeaderboard };