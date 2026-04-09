import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Alert from '../../components/Alert';
import { CUSTOMER_MENU } from '../../utils/menuConfig';
import { authAPI, getUser, setUser, usersAPI } from '../../utils/api';

/**
 * Customer Profile Page
 * View and edit customer profile information
 */
const CustomerProfile = () => {
  const currentUser = getUser();
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });

  useEffect(() => {
    const loadLatestProfile = async () => {
      if (!currentUser) {
        setError('Please sign in to view your profile');
        return;
      }

      try {
        const response = await authAPI.getMe();
        const freshUser = {
          ...currentUser,
          fullName: response.user.full_name,
          email: response.user.email,
          phone: response.user.phone || '',
          address: response.user.address || '',
          role: response.user.role,
        };

        setUser(freshUser);
        setFormData({
          fullName: freshUser.fullName,
          email: freshUser.email,
          phone: freshUser.phone,
          address: freshUser.address,
        });
      } catch {
        // Keep local user info if API refresh fails.
      }
    };

    loadLatestProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.id) {
      setError('Please sign in to update your profile');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await usersAPI.update(currentUser.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });

      setUser({
        ...currentUser,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/customer/dashboard' },
    { label: 'Profile' },
  ];

  return (
    <DashboardLayout
      userRole="customer"
      userName={formData.fullName}
      menuItems={CUSTOMER_MENU}
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">
          Manage your account information
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
          className="mb-6"
        />
      )}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Profile Form */}
      <div className="max-w-2xl">
        <div className="card">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formData.fullName}
                </h2>
                <p className="text-gray-600">Customer Account</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="input disabled:bg-gray-50 disabled:text-gray-600"
              />
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
                disabled
                className="input disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="input disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Address */}
            <div>
              <label className="label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                className="input disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Edit Mode Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4 inline mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Stats */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-2xl font-bold text-gray-900">2025</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
