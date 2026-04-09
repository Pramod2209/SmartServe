import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Briefcase, Award } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Alert from '../../components/Alert';
import { authAPI, setToken, setUser } from '../../utils/api';

/**
 * Technician registration page
 */
const TechnicianRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    certifications: '',
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
      !formData.specialization ||
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
        password: formData.password,
        role: 'technician',
        specialization: formData.specialization,
        experience: Number(formData.experience || 0),
        certifications: formData.certifications,
      });

      setToken(response.token);
      setUser(response.user);
      setSuccess('Registration successful! Your account is pending verification. Redirecting...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
              Technician Registration
            </h1>
            <p className="text-gray-600">
              Join our platform as a service provider
            </p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3 text-center">Register as</p>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <Link
                to="/register/customer"
                className="text-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 font-medium transition-colors"
              >
                Customer
              </Link>
              <Link
                to="/register/technician"
                className="text-center px-4 py-2 rounded-md bg-white text-blue-700 font-semibold shadow-sm"
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

              {/* Specialization */}
              <div>
                <label className="label">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select specialization</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="ac-repair">AC Repair</option>
                  <option value="appliance-repair">Appliance Repair</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="label">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  className="input"
                />
              </div>

              {/* Certifications */}
              <div className="col-span-2">
                <label className="label">
                  <Award className="w-4 h-4 inline mr-2" />
                  Certifications
                </label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="List your certifications (optional)"
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

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your account will be reviewed and verified by our admin team before activation.
              </p>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Technician'}
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

export default TechnicianRegister;
