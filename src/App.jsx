import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/Auth/Login';
import CustomerRegister from './pages/Auth/CustomerRegister';
import TechnicianRegister from './pages/Auth/TechnicianRegister';

// Customer Pages
import Landing from './pages/Customer/Landing';
import CustomerDashboard from './pages/Customer/Dashboard';
import BookService from './pages/Customer/BookService';
import MyServices from './pages/Customer/MyServices';
import CustomerProfile from './pages/Customer/Profile';

// Technician Pages
import TechnicianDashboard from './pages/Technician/Dashboard';
import AssignedJobs from './pages/Technician/AssignedJobs';
import WorkHistory from './pages/Technician/WorkHistory';
import TechnicianProfile from './pages/Technician/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ManageServices from './pages/Admin/ManageServices';
import ManageTechnicians from './pages/Admin/ManageTechnicians';
import ManageBookings from './pages/Admin/ManageBookings';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Default route - Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/technician" element={<TechnicianRegister />} />
        
        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/book-service" element={<BookService />} />
        <Route path="/customer/services" element={<MyServices />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        
        {/* Technician Routes */}
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/technician/assigned-jobs" element={<AssignedJobs />} />
        <Route path="/technician/work-history" element={<WorkHistory />} />
        <Route path="/technician/profile" element={<TechnicianProfile />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/services" element={<ManageServices />} />
        <Route path="/admin/technicians" element={<ManageTechnicians />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
