import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Alert from '../../components/Alert';
import { authAPI, setToken, setUser } from '../../utils/api';

/**
 * Login page with role selector
 * Supports Customer, Technician, and Admin login
 */
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setToken(response.token);
      setUser(response.user);

      switch (response.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'technician':
          navigate('/technician/dashboard');
          break;
        case 'customer':
        default:
          navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            ← Back to Home
          </Link>
        </div>
        
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-2" />
                Login As
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="customer">Customer</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="label">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Don't have an account?
            </p>
            <div className="flex space-x-3">
              <Link
                to="/register/customer"
                className="flex-1 btn btn-secondary text-center"
              >
                Register as Customer
              </Link>
              <Link
                to="/register/technician"
                className="flex-1 btn btn-secondary text-center"
              >
                Register as Technician
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
