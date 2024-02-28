import React, { useState } from 'react';
import './Login.css';
import { login } from '../services/auth.service';
import { setItem } from '../services/localstorage.service';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter a username and password');
      return;
    }
    try {
      const token = await login(username, password);
      setItem('token', token);
      navigate('/');
      window.location.reload();
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Connexion
        </button>
      </form>
    </div>
  );
};

export default Login;
