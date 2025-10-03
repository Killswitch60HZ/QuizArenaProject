const express = require('express');
const router = express.Router();
const { createQuizQuestion, getQuizQuestions } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createQuizQuestion).get(protect, getQuizQuestions);

module.exports = router;