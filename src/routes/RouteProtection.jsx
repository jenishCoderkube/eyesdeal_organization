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

/**
 * PrivateRoute with optional store check
 * @param {ReactNode} children
 * @param {boolean} requireStore - check if user has at least one store
 */
const PrivateRoute = ({ children, requireStore = false }) => {
  const token = localStorage.getItem("accessToken");
  const userData = localStorage.getItem("user");

  // 🔒 Token check
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("accessToken");
    return <Navigate to="/login" />;
  }

  // 🏬 Store check (only if required)
  if (requireStore) {
    try {
      const user = JSON.parse(userData);
      const hasStore =
        user && Array.isArray(user.stores) && user.stores.length > 0;

      if (!hasStore) {
        return <Navigate to="/stores/assign-store" />;
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      return <Navigate to="/stores/assign-store" />;
    }
  }

  // ✅ Passed all checks
  return children;
};

export default PrivateRoute;
