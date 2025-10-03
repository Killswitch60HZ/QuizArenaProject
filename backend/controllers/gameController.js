const Game = require('../models/Game');

const saveGameResult = async (req, res) => {
    try {
        const { players, scores, winner } = req.body;
        if (!players || !scores || !winner) {
            return res.status(400).json({ message: 'Please provide players, scores, and a winner' });
        }
        const newGame = new Game({ players, scores, winner });
        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (error) {
        res.status(400).json({ message: 'Error saving game', error: error.message });
    }
};

const getGameHistory = async (req, res) => {
    try {
        const games = await Game.find({ players: req.user._id }).sort({ createdAt: -1 }).populate('players', 'username').populate('winner', 'username');
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { saveGameResult, getGameHistory };