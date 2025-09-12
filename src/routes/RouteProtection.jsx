import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp && decoded.exp > currentTime;
  } catch (err) {
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (token && isTokenValid(token)) {
    return children;
  }

  localStorage.removeItem("accessToken");
  return <Navigate to="/login" />;
};

export default PrivateRoute;
