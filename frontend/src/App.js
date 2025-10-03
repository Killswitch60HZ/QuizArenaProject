import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Navbar from './components/Navbar.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';

function App() {
  return (
    <Router>
      <div className="App bg-gray-900 min-h-screen text-white">
        <Navbar />
        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/lobby/:category" element={<LobbyPage />} />
            <Route path="/quiz/:gameId" element={<QuizPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;