import React, { useState } from 'react';
import axios from 'axios';
// Make sure to import your CSS file if you have one
// import './LoginPage.css';

const LoginPage = () => {
  // State to hold the user's email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State to hold any login errors from the server
  const [error, setError] = useState('');

  // State to track if the request is in progress
  const [isLoading, setIsLoading] = useState(false);

  // This is the function that runs when the form is submitted
  const handleLogin = async (event) => {
    // Prevent the default browser action of refreshing the page on form submit
    event.preventDefault();

    // Set loading to true and clear previous errors
    setIsLoading(true);
    setError('');

    // **IMPORTANT: Construct the full API URL using the environment variable**
    const API_ENDPOINT = `${process.env.REACT_APP_API_URL}/api/auth/login`;

    try {
      // Make the POST request to your backend
      const response = await axios.post(API_ENDPOINT, {
        email: email,
        password: password,
      });

      // Assuming the backend returns a token on successful login
      const { token } = response.data;

      // Store the token (e.g., in localStorage) and redirect the user
      localStorage.setItem('authToken', token);
      console.log('Login successful!');

      // You would typically redirect the user to the dashboard here
      // For example: window.location.href = '/dashboard';

    } catch (err) {
      // If the API call fails, handle the error
      if (err.response && err.response.data && err.response.data.message) {
        // Use the error message from the backend if available
        setError(err.response.data.message);
      } else {
        // Otherwise, show a generic error message
        setError('Login failed. Please check your credentials and try again.');
      }
      console.error('Login error:', err);
    } finally {
      // Set loading back to false once the request is complete
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container"> {/* Use your own CSS classes */}
      <form onSubmit={handleLogin}>
        <h2>Quiz Arena Login</h2>

        {/* Display the error message if it exists */}
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Enter Arena'}
        </button>

      </form>
    </div>
  );
};

export default LoginPage;