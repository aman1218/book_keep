import React, { useState } from 'react';
import './Forms.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin, onNavigateToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');  // Clear previous errors
    try {
      const response = await axios.post('/login', {
        username,
        password
      });
      localStorage.setItem('jwt', response.data.token);  // Save the token
      onLogin(username, password);
      navigate('/dashboard');  // Navigate to dashboard
    } catch (error) {
      console.error('Login failed:', error.response);
      setError('Login failed. Please check your username and password.');  /// Set user-friendly error message
      setIsLoading(false);  // Reset loading state
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-label="Username"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
        </div>
        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" className="button" onClick={() => navigate('/register')} style={{ marginTop: '10px' }}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;
