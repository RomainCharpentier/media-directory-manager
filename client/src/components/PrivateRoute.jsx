import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { getItem } from '../services/localstorage.service';

const PrivateRoute = ({ element, ...rest }) => {
  const isAuthenticated = getItem('token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
