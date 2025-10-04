import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './LeaderboardPage.css'; // Your CSS file

const LeaderboardPage = () => {
  // State to hold the leaderboard data (an array of players)
  const [players, setPlayers] = useState([]);

  // State for loading and error messages
  const [isLoading, setIsLoading] = useState(true); // Start as true to show loading state initially
  const [error, setError] = useState('');

  // useEffect runs once after the component mounts, thanks to the empty array []
  useEffect(() => {
    // Define the function to fetch data
    const fetchLeaderboard = async () => {
      // **Construct the full API URL for the leaderboard**
      const API_ENDPOINT = `${process.env.REACT_APP_API_URL}/api/leaderboard`; // Assuming this is your endpoint

      try {
        const response = await axios.get(API_ENDPOINT);
        // Assuming the backend returns an array of players in response.data
        setPlayers(response.data);
      } catch (err) {
        setError('Could not fetch leaderboard data.');
        console.error('Leaderboard fetch error:', err);
      } finally {
        setIsLoading(false); // Set loading to false whether it succeeded or failed
      }
    };

    // Call the function
    fetchLeaderboard();
  }, []); // The empty dependency array [] means this effect runs only once

  if (isLoading) {
    return <div>Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="leaderboard-container"> {/* Use your own CSS classes */}
      <h2>Leaderboard</h2>
      <ol className="player-list">
        {players.map((player, index) => (
          <li key={player.id || index}>
            <span className="player-rank">{index + 1}</span>
            <span className="player-name">{player.username}</span>
            <span className="player-score">{player.score} Points</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default LeaderboardPage;