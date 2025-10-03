const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String], // An array of strings
        required: true,
        validate: [arr => arr.length === 4, 'Options must have exactly 4 choices.'],
    },
    correctAnswer: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);