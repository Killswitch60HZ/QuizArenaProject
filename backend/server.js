const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const connectDB = require('./config/db');
const Quiz = require('./models/Quiz');
const Game = require('./models/Game');

// --- INITIAL SETUP ---
dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);

// --- MIDDLEWARE ---
// Set up CORS to allow your frontend to connect
app.use(cors({
    origin: "https://snazzy-lokum-b58c1c.netlify.app" // Your live frontend URL
}));
app.use(express.json());

// --- API ROUTES ---
// Your existing REST API endpoints
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quizzes', require('./routes/quiz'));
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));


// --- REAL-TIME SERVER SETUP (Socket.IO) ---
const io = new Server(server, { 
    cors: { 
        origin: "https://snazzy-lokum-b58c1c.netlify.app", // Your live frontend URL
        methods: ["GET", "POST"] 
    }
});

// In-memory storage for players waiting for a match and active games.
// Note: This data will be lost if the server restarts. For larger scale, a persistent store like Redis would be better.
const waitingPlayers = {};
const activeGames = {};


// --- MAIN GAME LOGIC ---
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Event for when a player is looking for a match
    socket.on('findMatch', async (data) => {
        const { user, category } = data;
        if (!user || !category) return;

        // Initialize the queue for this category if it doesn't exist
        if (!waitingPlayers[category]) {
            waitingPlayers[category] = [];
        }

        // Prevent a user from joining the queue twice
        const isAlreadyInQueue = waitingPlayers[category].some(p => p.user._id === user._id);
        if (isAlreadyInQueue) {
            console.log(`User ${user.username} is already in the queue for ${category}.`);
            return;
        }

        console.log(`User ${user.username} is waiting for a match in category: ${category}`);
        waitingPlayers[category].push({ socket, user });

        // If we have 2 or more players, start a match
        if (waitingPlayers[category].length >= 2) {
            try {
                const player1 = waitingPlayers[category].shift();
                const player2 = waitingPlayers[category].shift();
                const gameId = `${player1.socket.id}-${player2.socket.id}`;

                // Both players join a "room" for this game
                player1.socket.join(gameId);
                player2.socket.join(gameId);

                // Fetch 10 random questions from the database for the selected category
                const questions = await Quiz.aggregate([{ $match: { category } }, { $sample: { size: 10 } }]);
                if (questions.length < 1) {
                    io.to(gameId).emit('error', 'Not enough questions in this category to start a game.');
                    return;
                }

                // Store all game state in the activeGames object
                activeGames[gameId] = {
                    playersInfo: [
                        { socketId: player1.socket.id, user: player1.user, answers: [], ready: false },
                        { socketId: player2.socket.id, user: player2.user, answers: [], ready: false }
                    ],
                    questions,
                    currentQuestionIndex: 0,
                    scores: { [player1.socket.id]: 0, [player2.socket.id]: 0 },
                    // Track answers for the current round
                    roundAnswers: [],
                };
                
                console.log(`Match found! Game ID: ${gameId}`);
                // Notify both players that a match has been found
                player1.socket.emit('matchFound', { gameId, players: [player1.user, player2.user], totalQuestions: questions.length });
                player2.socket.emit('matchFound', { gameId, players: [player1.user, player2.user], totalQuestions: questions.length });

            } catch (error) {
                console.error("Error during match creation:", error);
            }
        }
    });

    // Event for when a player confirms they are ready to start
    socket.on('playerReady', (data) => {
        const { gameId } = data;
        const game = activeGames[gameId];
        if (!game) return;

        const playerInfo = game.playersInfo.find(p => p.socketId === socket.id);
        if (playerInfo) {
            playerInfo.ready = true;
        }

        // Check if all players are ready
        const allPlayersReady = game.playersInfo.every(p => p.ready);
        if (allPlayersReady) {
            console.log(`Game ${gameId} is starting!`);
            const currentQuestion = game.questions[game.currentQuestionIndex];
            // Send the first question to both players
            io.to(gameId).emit('newQuestion', {
                question: currentQuestion.question,
                options: currentQuestion.options,
                questionNumber: 1,
                totalQuestions: game.questions.length
            });
        }
    });

    // Event for when a player submits an answer
    socket.on('submitAnswer', (data) => {
        const { gameId, answer } = data;
        const game = activeGames[gameId];
        if (!game) return;

        // Prevent player from answering twice in the same round
        if (game.roundAnswers.some(ra => ra.socketId === socket.id)) return;

        // Store the player's answer for this round
        game.roundAnswers.push({ socketId: socket.id, answer });
        
        // If both players have answered, process the round
        if (game.roundAnswers.length === 2) {
            const currentQuestion = game.questions[game.currentQuestionIndex];
            const roundResults = {};

            // Calculate scores for this round
            game.roundAnswers.forEach(ans => {
                if (ans.answer === currentQuestion.answer) {
                    game.scores[ans.socketId] += 10; // Add 10 points for correct answer
                    roundResults[ans.socketId] = { correct: true };
                } else {
                    roundResults[ans.socketId] = { correct: false };
                }
            });

            // Send round results and updated scores to both players
            io.to(gameId).emit('roundResult', {
                results: roundResults,
                correctAnswer: currentQuestion.answer,
                scores: game.scores
            });

            // Move to the next question or end the game
            game.currentQuestionIndex++;
            game.roundAnswers = []; // Clear answers for the next round

            if (game.currentQuestionIndex < game.questions.length) {
                // After a short delay, send the next question
                setTimeout(() => {
                    const nextQuestion = game.questions[game.currentQuestionIndex];
                    io.to(gameId).emit('newQuestion', {
                        question: nextQuestion.question,
                        options: nextQuestion.options,
                        questionNumber: game.currentQuestionIndex + 1,
                        totalQuestions: game.questions.length
                    });
                }, 3000); // 3-second delay
            } else {
                // If no more questions, end the game
                endGame(gameId);
            }
        }
    });

    // Handle player disconnections
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Remove player from any waiting queues
        for (const category in waitingPlayers) {
            waitingPlayers[category] = waitingPlayers[category].filter(p => p.socket.id !== socket.id);
        }

        // Handle disconnection during an active game
        for (const gameId in activeGames) {
            const game = activeGames[gameId];
            const player = game.playersInfo.find(p => p.socketId === socket.id);
            if (player) {
                // Find the other player
                const otherPlayer = game.playersInfo.find(p => p.socketId !== socket.id);
                if (otherPlayer) {
                    // Notify the other player that their opponent disconnected
                    io.to(otherPlayer.socketId).emit('opponentDisconnected');
                }
                // Clean up the game
                delete activeGames[gameId];
                console.log(`Game ${gameId} terminated due to disconnection.`);
                break;
            }
        }
    });
});

// --- HELPER FUNCTION TO END A GAME ---
async function endGame(gameId) {
    const game = activeGames[gameId];
    if (!game) return;

    console.log(`Game ${gameId} has ended.`);
    const player1Info = game.playersInfo[0];
    const player2Info = game.playersInfo[1];
    
    const player1Score = game.scores[player1Info.socketId];
    const player2Score = game.scores[player2Info.socketId];
    
    let winnerId = null;
    if (player1Score > player2Score) {
        winnerId = player1Info.user._id;
    } else if (player2Score > player1Score) {
        winnerId = player2Info.user._id;
    } // If scores are equal, it's a draw (winnerId remains null)

    // Notify clients that the game is over
    io.to(gameId).emit('gameEnd', {
        scores: game.scores,
        players: [player1Info.user, player2Info.user],
        winnerId
    });

    try {
        // Save the completed game to the database
        const newGame = new Game({
            players: [player1Info.user._id, player2Info.user._id],
            scores: [
                { user: player1Info.user._id, score: player1Score },
                { user: player2Info.user._id, score: player2Score }
            ],
            winner: winnerId,
            category: game.questions[0].category
        });
        await newGame.save();
        console.log(`Game ${gameId} saved to database.`);
    } catch (dbError) {
        console.error("Failed to save game to database:", dbError);
    }
    
    // Clean up the game from memory
    delete activeGames[gameId];
}

// --- START SERVER ---
const PORT = process.env.PORT || 8800;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));