import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import BookingForm from './components/BookingForm/BookingForm';
import VehicleGallery from './components/VehicleGallery/VehicleGallery';
import BuyGallery from './components/BuyGallery/BuyGallery';
import VehicleSaleDetails from './components/VehicleSaleDetails/VehicleSaleDetails';
import PaymentPage from './components/PaymentPage/PaymentPage';
import SuccessPage from './components/SuccessPage/SuccessPage';
import LoginPage from './components/LoginPage/LoginPage';
import SignupPage from './components/SignupPage/SignupPage';
import CustomerDashboard from './components/CustomerDashboard/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import PaymentHistory from './components/PaymentHistory/PaymentHistory';
import ForgotPassword from './components/LoginPage/ForgotPassword';
import ResetPassword from './components/LoginPage/ResetPassword';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { Toaster } from 'react-hot-toast';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role?.toUpperCase() !== role.toUpperCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="App-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rent" element={<ProtectedRoute><VehicleGallery /></ProtectedRoute>} />
            <Route path="/buy" element={<BuyGallery />} />
            <Route path="/buy/:id" element={<VehicleSaleDetails />} />
            <Route path="/booking" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route 
              path="/customer-dashboard" 
              element={<ProtectedRoute role="Customer"><CustomerDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/admin-dashboard" 
              element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} 
            />
            
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;