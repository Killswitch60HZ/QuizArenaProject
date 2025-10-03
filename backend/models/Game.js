const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    scores: {
        playerOne: { type: Number, required: true },
        playerTwo: { type: Number, required: true }
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Game', GameSchema);