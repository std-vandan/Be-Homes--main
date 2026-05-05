import React, { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { AuthContext, AuthProvider } from './components/AuthContext';
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeContext';
// import AdminPage from "./pages/AdminPage";
import BasicDrawing from "./pages/BasicDrawing";
import Dashboard from "./pages/Dashboard";
import Dispatch from "./pages/Dispatch";
import ExecutionPlanning from "./pages/ExecutionPlanning";
import FinalDrawing from "./pages/FinalDrawing";
import ForgotPassword from "./pages/ForgotPassword";
import Installation from "./pages/Installation";
import Login from "./pages/Login";
// import ManagerPage from "./pages/ManagerPage";
import MaterialReceived from "./pages/MaterialReceived";
import Measurement from "./pages/Measurement";
import Payment from "./pages/Payment";
import Presentation from "./pages/Presentation";
import Project from "./pages/Project";
import Purchase from "./pages/Purchase";
import Quotation from "./pages/Quotation";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ShopDrawing from "./pages/ShopDrawing";

import EditProject from "./components/EditProject";
import SnagList from "./pages/SnagList";
// import Unauthorized from "./pages/Unauthorized";
import './css/bootstrap.css';
import './css/style.css';
import ProjectsList from "./pages/ProjectLists";
import ProspectsList from "./pages/ProspectsList";
import UserListing from "./pages/UserListing";
import WorkingDrawing from "./pages/WorkingDrawing";



function App() {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {location.pathname !== "/register" && location.pathname !== "/login" && location.pathname !== "/forgot-password" && location.pathname !== "/reset-password" && <Navbar />}
      <div className="page-slide">
        <Routes>
          <Route path="/" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Dashboard /></ProtectedRoute>} />
          {/* <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminPage /></ProtectedRoute>} /> */}
          {/* <Route path="/manager" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ManagerPage /></ProtectedRoute>} /> */}
          <Route path="/project" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Project /></ProtectedRoute>} />
          <Route path="/basic-drawing" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><BasicDrawing /></ProtectedRoute>} />
          <Route path="/shop-drawing" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ShopDrawing /></ProtectedRoute>} />
          <Route path="/working-drawing" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><WorkingDrawing /></ProtectedRoute>} />
          <Route path="/final-drawing" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><FinalDrawing /></ProtectedRoute>} />
          <Route path="/presentation" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Presentation /></ProtectedRoute>} />
          <Route path="/quotation" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Quotation /></ProtectedRoute>} />
          <Route path="/material-received" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><MaterialReceived /></ProtectedRoute>} />
          <Route path="/snag-list" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><SnagList /></ProtectedRoute>} />
          <Route path="/dispatch" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Dispatch /></ProtectedRoute>} />
          <Route path="/purchase" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Purchase /></ProtectedRoute>} />
          <Route path="/measurement" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Measurement /></ProtectedRoute>} />
          <Route path="/execution-planning" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ExecutionPlanning /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Payment /></ProtectedRoute>} />
          <Route path="/installation" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Installation /></ProtectedRoute>} />
          <Route path="/edit-project" element={<EditProject />} />
          <Route path="/user-listing" element={<UserListing/>} />
          <Route path="/projects-list" element={<ProjectsList/>} />
          <Route path="/prospects-list" element={<ProspectsList/>} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
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
