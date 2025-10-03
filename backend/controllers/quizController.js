const Quiz = require('../models/Quiz');

/**
 * @desc    Create a new quiz question
 * @route   POST /api/quizzes
 * @access  Private
 */
const createQuizQuestion = async (req, res) => {
    try {
        const { category, difficulty, question, options, correctAnswer } = req.body;
        const newQuestion = new Quiz({
            category,
            difficulty,
            question,
            options,
            correctAnswer,
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({ message: 'Error creating question', error });
    }
};

/**
 * @desc    Get quiz questions, optionally filtered by category
 * @route   GET /api/quizzes
 * @access  Private
 */
const getQuizQuestions = async (req, res) => {
    try {
        const { category } = req.query; // e.g., /api/quizzes?category=Science
        const filter = category ? { category } : {};
        const questions = await Quiz.find(filter).limit(10); // Get up to 10 questions
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error });
    }
};

module.exports = { createQuizQuestion, getQuizQuestions };