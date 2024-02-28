import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';
import { isAuthenticated } from '../services/auth.service';

const Layout = ({ children }) => {
  return (
    <div className="container">
      {isAuthenticated() && (
        <div className="menu">
          <ul>
            <li>
              <Link className="menu-item" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="menu-item" to="/files">
                Files
              </Link>
            </li>
          </ul>
        </div>
      )}
      <div className="content">{children}</div>
    </div>
  );
};

export default Layout;
