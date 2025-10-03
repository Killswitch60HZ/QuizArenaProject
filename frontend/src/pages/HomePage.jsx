import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';

const StatCard = ({ title, value, icon, color }) => (
    <div className={`flex-1 p-6 rounded-2xl shadow-lg ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-white/80">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="text-3xl text-white/50">{icon}</div>
        </div>
    </div>
);

const CategoryCard = ({ title, color, category }) => (
    <Link to={`/lobby/${category}`} className={`block p-8 rounded-2xl shadow-lg cursor-pointer transition-transform hover:scale-105 ${color}`}>
        <p className="text-xl font-bold text-center">{title}</p>
    </Link>
);

const HomePage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Battles" value="0" icon="⚔️" color="bg-blue-600/80" />
                <StatCard title="Wins" value="0" icon="🏆" color="bg-green-600/80" />
                <StatCard title="Win Rate" value="0%" icon="🎯" color="bg-purple-600/80" />
            </div>
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Choose a Category</h2>
                {user ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CategoryCard title="General Knowledge" category="knowledge" color="bg-teal-500" />
                        <CategoryCard title="Science" category="science" color="bg-pink-500" />
                        <CategoryCard title="Sports" category="sports" color="bg-orange-500" />
                        <CategoryCard title="Video Games" category="games" color="bg-indigo-500" />
                    </div>
                ) : (
                    <div className="text-center p-10 bg-gray-800/50 rounded-2xl">
                        <p className="text-lg text-gray-400">
                            Please{' '}
                            <Link to="/login" className="text-yellow-400 font-semibold hover:underline">log in</Link>
                            {' '}or{' '}
                            <Link to="/register" className="text-yellow-400 font-semibold hover:underline">register</Link>
                            {' '}to start playing.
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Recent Battles</h2>
                <div className="bg-gray-800/50 rounded-2xl p-10 text-center">
                    <p className="text-gray-400">No recent battles yet. Start your first battle!</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;