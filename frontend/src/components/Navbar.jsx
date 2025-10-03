import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-yellow-400">⚡ Quiz Arena</Link>
                <div className="flex items-center space-x-4">
                    <Link to="/leaderboard" className="hover:text-yellow-400">Leaderboard</Link>
                    {user ? (
                        <>
                            <span className="text-gray-300">Welcome, {user.username}!</span>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-semibold">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm font-semibold">Login</Link>
                            <Link to="/register" className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-sm font-semibold">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;