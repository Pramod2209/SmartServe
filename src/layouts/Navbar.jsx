import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

/**
 * Top navigation bar component
 * Displays app name, user info, and logout option
 */
const Navbar = ({ userRole = 'customer', userName = 'User' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'technician':
        return '/technician/dashboard';
      case 'customer':
      default:
        return '/customer/dashboard';
    }
  };

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-full mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo and Brand */}
          <Link to={getDashboardLink()} className="flex items-center space-x-3">
            <img src="/logo.png" alt="Smart Serve Logo" className="h-12 w-auto object-contain" />
            <span className="text-2xl font-bold text-gray-900">
              Smart Serve
            </span>
          </Link>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{userName}</p>
                <p className="text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
