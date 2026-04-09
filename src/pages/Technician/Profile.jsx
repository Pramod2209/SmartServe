import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase, Award, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import { TECHNICIAN_MENU } from '../../utils/menuConfig';
import { authAPI, getUser, setUser, techniciansAPI, usersAPI } from '../../utils/api';

/**
 * Technician Profile Page
 * View and edit technician profile information
 */
const TechnicianProfile = () => {
  const currentUser = getUser();
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [technicianId, setTechnicianId] = useState(null);
  const [stats, setStats] = useState({ rating: 0, totalJobs: 0, verified: false });
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    specialization: '',
    experience: '0',
    certifications: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setError('Please sign in to view your profile');
        return;
      }

      try {
        const response = await authAPI.getMe();
        const me = response.user;
        const tech = me.technicianInfo || {};

        setUser({
          ...currentUser,
          fullName: me.full_name,
          email: me.email,
          phone: me.phone || '',
          address: me.address || '',
          role: me.role,
        });

        setFormData({
          fullName: me.full_name,
          email: me.email,
          phone: me.phone || '',
          specialization: tech.specialization || '',
          experience: String(tech.experience ?? 0),
          certifications: tech.certifications || '',
        });

        setTechnicianId(tech.id || null);
        setStats({
          rating: tech.rating || 0,
          totalJobs: tech.total_jobs || 0,
          verified: !!tech.verified,
        });
      } catch (err) {
        setError(err.message || 'Failed to load technician profile');
      }
    };

    loadProfile();
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
      });

      if (technicianId) {
        await techniciansAPI.update(technicianId, {
          specialization: formData.specialization,
          experience: Number(formData.experience || 0),
          certifications: formData.certifications,
        });
      }

      setUser({
        ...currentUser,
        fullName: formData.fullName,
        phone: formData.phone,
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
    { label: 'Dashboard', path: '/technician/dashboard' },
    { label: 'Profile' },
  ];

  return (
    <DashboardLayout
      userRole="technician"
      userName={formData.fullName}
      menuItems={TECHNICIAN_MENU}
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">
          Manage your technician profile and credentials
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2">
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
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge status={stats.verified ? 'verified' : 'pending'} />
                    <span className="text-sm text-gray-600">
                      {formData.specialization}
                    </span>
                  </div>
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

              {/* Specialization */}
              <div>
                <label className="label">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input disabled:bg-gray-50 disabled:text-gray-600"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="label">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={!isEditing}
                  min="0"
                  className="input disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="label">
                  <Award className="w-4 h-4 inline mr-2" />
                  Certifications
                </label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
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
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating || 0} ⭐</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Jobs Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">On-Time Rate</p>
                <p className="text-2xl font-bold text-green-600">95%</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge status={stats.verified ? 'active' : 'pending'} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-medium text-gray-900">January 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Type</p>
                <p className="font-medium text-gray-900">Verified Technician</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicianProfile;
