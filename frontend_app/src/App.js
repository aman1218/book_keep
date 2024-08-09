import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Registration from './Registration';
import Dashboard from './Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Perform a synchronous check for JWT in localStorage and return the initial state
    const jwt = localStorage.getItem('jwt');
    return !!jwt;  // Convert truthy/falsy value to boolean
  });

  useEffect(() => {
    // Listen for changes in authentication state that might happen outside of component
    const onAuthChange = () => {
      const jwt = localStorage.getItem('jwt');
      setIsAuthenticated(!!jwt);
    };

    window.addEventListener('storage', onAuthChange); // Listen to storage changes in other tabs

    return () => {
      window.removeEventListener('storage', onAuthChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate replace to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
