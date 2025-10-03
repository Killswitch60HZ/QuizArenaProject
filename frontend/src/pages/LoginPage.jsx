import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:8800/api/auth/login', { email, password });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return ( <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 p-4"><form className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20" onSubmit={handleSubmit}><div className="text-center text-white"><h1 className="text-4xl font-bold">Quiz Arena</h1><p className="mt-2">Battle your knowledge in real-time!</p></div>{error && <p className="p-3 bg-red-500/50 text-white text-sm text-center rounded-md">{error}</p>}<div className="space-y-4"><div><label className="block text-sm font-medium text-gray-200" htmlFor="email">Email</label><input id="email" type="email" className="w-full px-4 py-2 mt-1 text-white bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div><label className="block text-sm font-medium text-gray-200" htmlFor="password">Password</label><input id="password" type="password" className="w-full px-4 py-2 mt-1 text-white bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></div><button type="submit" className="w-full py-3 font-semibold text-gray-900 bg-yellow-400 rounded-md hover:bg-yellow-500 transition-all duration-300">Enter Arena</button><p className="text-center text-sm text-gray-300">Don't have an account?{' '}<Link to="/register" className="font-medium text-yellow-400 hover:underline">Register</Link></p></form></div>);
};
export default LoginPage;