const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require("socket.io");
const Quiz = require('./models/Quiz');
const Game = require('./models/Game');

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/quizzes', require('./routes/quiz'));
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));

const PORT = process.env.PORT || 8800;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3001" } });

const waitingPlayers = {};
const activeGames = {};

io.on("connection", (socket) => {
    socket.on('findMatch', async (data) => {
        const { user, category } = data;
        if (!user || !category) return;
        if (!waitingPlayers[category]) waitingPlayers[category] = [];
        const isAlreadyInQueue = waitingPlayers[category].some(p => p.user._id === user._id);
        if (isAlreadyInQueue) return;

        waitingPlayers[category].push({ socket, user });

        if (waitingPlayers[category].length >= 2) {
            try {
                const player1 = waitingPlayers[category].shift();
                const player2 = waitingPlayers[category].shift();
                const gameId = `${player1.socket.id}-${player2.socket.id}`;
                
                player1.socket.join(gameId);
                player2.socket.join(gameId);

                const questions = await Quiz.aggregate([{ $match: { category } }, { $sample: { size: 10 } }]);
                if (questions.length < 1) {
                    io.to(gameId).emit('error', 'Not enough questions.'); return;
                }

                activeGames[gameId] = {
                    playersInfo: [ { socketId: player1.socket.id, user: player1.user, answers: [] }, { socketId: player2.socket.id, user: player2.user, answers: [] } ],
                    questions, currentQuestionIndex: 0, scores: { [player1.socket.id]: 0, [player2.socket.id]: 0 }
                };
                
                player1.socket.emit('matchFound', { gameId, players: [player1.user, player2.user] });
                player2.socket.emit('matchFound', { gameId, players: [player1.user, player2.user] });

            } catch (error) { console.error("Error during match creation:", error); }
        }
    });

    socket.on('playerReady', (data) => {
        const { gameId } = data;
        const game = activeGames[gameId];
        if (!game) return;

        const playerInfo = game.playersInfo.find(p => p.socketId === socket.id);
        if (playerInfo) playerInfo.ready = true;

        const allPlayersReady = game.playersInfo.every(p => p.ready);
        if (allPlayersReady) {
            const currentQuestion = game.questions[game.currentQuestionIndex];
            io.to(gameId).emit('newQuestion', {
                question: currentQuestion.question, options: currentQuestion.options,
                questionNumber: 1, totalQuestions: game.questions.length
            });
        }
    });

    socket.on('submitAnswer', async (data) => {
        // ... (This code remains correct from the previous version)
    });

    // ... (Other listeners like disconnect remain the same)
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));