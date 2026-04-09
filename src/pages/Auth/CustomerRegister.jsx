import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Alert from '../../components/Alert';
import { authAPI, setToken, setUser } from '../../utils/api';

/**
 * Customer registration page
 */
const CustomerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        role: 'customer',
      });

      setToken(response.token);
      setUser(response.user);
      setSuccess('Registration successful! Redirecting to dashboard...');

      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl">
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
              Customer Registration
            </h1>
            <p className="text-gray-600">
              Create your account to book home services
            </p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3 text-center">Register as</p>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <Link
                to="/register/customer"
                className="text-center px-4 py-2 rounded-md bg-white text-blue-700 font-semibold shadow-sm"
              >
                Customer
              </Link>
              <Link
                to="/register/technician"
                className="text-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 font-medium transition-colors"
              >
                Technician
              </Link>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              className="mb-6"
            />
          )}
          {success && (
            <Alert type="success" message={success} className="mb-6" />
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="col-span-2">
                <label className="label">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
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

              {/* Phone */}
              <div>
                <label className="label">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="input"
                />
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="label">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, State, ZIP"
                  rows="3"
                  className="input"
                />
              </div>

              {/* Password */}
              <div>
                <label className="label">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password *
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

              {/* Confirm Password */}
              <div>
                <label className="label">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CustomerRegister;
