import React, { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { AuthContext, AuthProvider } from './components/AuthContext';
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeContext';


import Dashboard from "./pages/Dashboard";
import Dispatch from "./pages/Dispatch";
import ExecutionPlanning from "./pages/ExecutionPlanning";

import ForgotPassword from "./pages/ForgotPassword";

import Login from "./pages/Login";

import MaterialReceived from "./pages/MaterialReceived";
import Measurement from "./pages/Measurement";
import Payment from "./pages/Payment";
import Presentation from "./pages/Presentation";
import Project from "./pages/Project";

import Purchase from "./pages/Purchase";
import Quotation from "./pages/Quotation";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";


import EditProject from "./components/EditProject";


import './css/bootstrap.css';
import './css/style.css';
import ProjectsList from "./pages/ProjectLists";
import ProspectsList from "./pages/ProspectsList";
import UserListing from "./pages/UserListing";




function App() {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {location.pathname !== "/register" && location.pathname !== "/login" && location.pathname !== "/forgot-password" && location.pathname !== "/reset-password" && <Navbar />}
      <div className="page-slide">
        <Routes>
          <Route path="/" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Dashboard /></ProtectedRoute>} />
          
          
          
          <Route path="/presentation" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Presentation /></ProtectedRoute>} />
          <Route path="/quotation" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Quotation /></ProtectedRoute>} />
         <Route path="/material-received" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><MaterialReceived /></ProtectedRoute>} />
          <Route path="/project" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Project /></ProtectedRoute>} />
          <Route path="/dispatch" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Dispatch /></ProtectedRoute>} />
          <Route path="/purchase" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Purchase /></ProtectedRoute>} />
          <Route path="/measurement" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Measurement /></ProtectedRoute>} />
          <Route path="/execution-planning" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ExecutionPlanning /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Payment /></ProtectedRoute>} />
          
          <Route path="/edit-project" element={<EditProject />} />
          <Route path="/user-listing" element={<UserListing/>} />
          <Route path="/projects-list" element={<ProjectsList/>} />
          <Route path="/prospects-list" element={<ProspectsList/>} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
         
        </Routes>
      </div>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;
