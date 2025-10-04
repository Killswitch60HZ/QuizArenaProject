import React, { useState } from 'react';
import axios from 'axios';
// import './RegisterPage.css'; // Your CSS file

const RegisterPage = () => {
  // State for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // **Construct the full API URL for registration**
    const API_ENDPOINT = `${process.env.REACT_APP_API_URL}/api/auth/register`;

    try {
      // Make the POST request
      await axios.post(API_ENDPOINT, {
        username,
        email,
        password,
      });

      // Handle successful registration
      setSuccessMessage('Registration successful! You can now log in.');
      // Optionally, you can redirect the user to the login page after a few seconds

    } catch (err) {
      // Handle errors from the backend
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container"> {/* Use your own CSS classes */}
      <form onSubmit={handleRegister}>
        <h2>Create an Account</h2>

        {/* Display success or error messages */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;