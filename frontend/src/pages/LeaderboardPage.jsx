import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('http://localhost:8800/api/users/leaderboard');
                setLeaderboard(res.data);
            } catch (err) {
                setError('Could not fetch leaderboard data.');
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Leaderboard</h1>
            {error && <p className="text-center text-red-500">{error}</p>}
            <div className="bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="p-4 w-1/6 text-center">Rank</th>
                            <th className="p-4 w-3/6">Player</th>
                            <th className="p-4 w-2/6 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user, index) => (
                            <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 text-center font-bold">{index + 1}</td>
                                <td className="p-4">{user.username}</td>
                                <td className="p-4 text-right font-semibold">{user.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardPage;