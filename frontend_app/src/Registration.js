import React, { useState } from 'react';
import './Forms.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Registration({ onRegister, onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');  // Clear previous errors
    try {
      const response = await axios.post('/register', {
        username,
        password,
        email
      });
      console.log('Registration successful:', response.data);
      onRegister(username, password, email);
      onNavigateToLogin();  // Redirect to login after registration
    } catch (error) {
      console.error('Registration failed:', error.response);
      setError('Registration failed. Please choose another username.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Registration</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button">Register</button>
        <button type="button" className="button" onClick={() => navigate('/login')} style={{ marginTop: '10px' }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Registration;
