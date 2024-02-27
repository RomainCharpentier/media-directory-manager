import React from 'react';
import { getItem, setItem } from '../services/localstorage.service';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const isAuthenticated = getItem('token');
  const navigate = useNavigate();
  return (
    <div className="header">
      {isAuthenticated && <span className="username">Logged in as: XXXX</span>}
      {isAuthenticated && (
        <button
          className="logout-btn"
          onClick={() => {
            setItem('token', null);
            navigate('/login');
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Header;
