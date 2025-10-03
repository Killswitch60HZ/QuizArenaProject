import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { socket } from '../socket.js';

const QuizPage = () => {
    const { gameId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [question, setQuestion] = useState(null);
    const [scores, setScores] = useState({});
    const [timer, setTimer] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [opponentAnswered, setOpponentAnswered] = useState(false);

    const handleAnswer = useCallback((option) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
        socket.emit('submitAnswer', { gameId, answer: option });
    }, [gameId, selectedAnswer]);

    useEffect(() => {
        socket.connect();
        // Tell the server this player is ready to start
        socket.emit('playerReady', { gameId });

        const onMatchFound = (data) => setPlayers(data.players);
        const onNewQuestion = (data) => {
            setQuestion(data);
            setSelectedAnswer(null);
            setOpponentAnswered(false);
            setTimer(15);
        };
        const onScoreUpdate = (newScores) => setScores(newScores);
        const onAnswerResult = ({ playerId }) => {
            if (playerId !== socket.id) setOpponentAnswered(true);
        };
        const onQuizEnd = ({ winner }) => {
            setTimeout(() => {
                alert(winner ? `${winner.username} wins!` : "It's a draw!");
                navigate('/');
            }, 2000);
        };

        // We only listen for matchFound here to get initial player data if needed
        socket.on('matchFound', onMatchFound);
        socket.on('newQuestion', onNewQuestion);
        socket.on('scoreUpdate', onScoreUpdate);
        socket.on('answerResult', onAnswerResult);
        socket.on('quizEnd', onQuizEnd);

        return () => {
            socket.off('matchFound', onMatchFound);
            socket.off('newQuestion', onNewQuestion);
            socket.off('scoreUpdate', onScoreUpdate);
            socket.off('answerResult', onAnswerResult);
            socket.off('quizEnd', onQuizEnd);
            socket.disconnect();
        };
    }, [gameId, navigate]);

    useEffect(() => {
        if (timer > 0 && !selectedAnswer) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        } else if (timer === 0 && !selectedAnswer) {
            handleAnswer("TIMEOUT");
        }
    }, [timer, selectedAnswer, handleAnswer]);
    
    const opponent = players.find(p => p?._id !== user?._id);
    const opponentSocketId = Object.keys(scores).find(id => id !== socket.id);

    const getButtonClass = (option) => {
        if (!selectedAnswer) return 'bg-gray-700 hover:bg-yellow-500';
        if (option === question.correctAnswer) return 'bg-green-600';
        if (option === selectedAnswer) return 'bg-red-600';
        return 'bg-gray-700 opacity-50 cursor-not-allowed';
    };

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
                <h1 className="text-4xl font-bold mb-4">Waiting for game to start...</h1>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mt-8"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <div className="text-center w-28"><div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-2 mx-auto">{user?.username[0].toUpperCase()}</div><p className="truncate">{user?.username} (You)</p><p className="text-2xl font-bold">{scores[socket.id] || 0}</p></div>
                <div className="text-center"><p className="text-4xl font-bold">VS</p><p className="text-sm text-gray-400">Question {question.questionNumber}/{question.totalQuestions}</p></div>
                <div className="text-center w-28"><div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-2 mx-auto">{opponent?.username[0].toUpperCase()}</div><p className="truncate">{opponent?.username}</p><p className="text-2xl font-bold">{scores[opponentSocketId] || 0}</p></div>
            </div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-4 mb-8 ${timer <= 5 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-gray-600 border-gray-500'}`}>{timer}</div>
            <div className="w-full max-w-4xl bg-gray-800/50 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">{question.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, index) => (
                        <button key={index} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={`p-4 rounded-lg text-left transition-colors ${getButtonClass(option)}`}>
                           <span className="font-bold mr-4">{String.fromCharCode(65 + index)}</span> {option}
                        </button>
                    ))}
                </div>
            </div>
            {opponentAnswered && !selectedAnswer && <p className="text-center mt-4 text-yellow-400 animate-pulse">Opponent has answered!</p>}
        </div>
    );
};

export default QuizPage;