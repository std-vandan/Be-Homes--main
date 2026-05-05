import React, { useContext, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext } from './components/AuthContext';
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Import other components as needed

const AppContent = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  // Check local storage for authentication token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, [setIsAuthenticated]);

  return (
    <>
      {location.pathname !== "/register" && location.pathname !== "/login" && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Add other routes here */}
      </Routes>
    </>
  );
};

export default AppContent;