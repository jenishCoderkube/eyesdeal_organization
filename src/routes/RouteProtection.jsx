import React from 'react';
import {Navigate} from 'react-router-dom';
import constants from '../utils/constants';
const PrivateRoute = ({children}) => {
  const isAuthenticated = localStorage.getItem(constants.USER);

  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;
