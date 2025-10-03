import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { socket } from '../socket.js';

const LobbyPage = () => {
    const { category } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            socket.emit('findMatch', { user, category });
        }

        const handleMatchFound = (data) => {
            navigate(`/quiz/${data.gameId}`);
        };
        socket.on('matchFound', handleMatchFound);

        return () => {
            socket.off('matchFound', handleMatchFound);
        };
    }, [user, category, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
            <h1 className="text-4xl font-bold mb-4">Finding an Opponent...</h1>
            <p className="text-lg text-gray-400">Category: {category}</p>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mt-8"></div>
        </div>
    );
};

export default LobbyPage;