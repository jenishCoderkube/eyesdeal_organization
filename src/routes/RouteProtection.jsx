import React from "react";
import { Navigate } from "react-router-dom";
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("accessToken");

  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;
