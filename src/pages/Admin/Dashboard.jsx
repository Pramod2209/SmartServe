import React, { useEffect, useMemo, useState } from 'react';
import { Users, Wrench, Calendar, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import Alert from '../../components/Alert';
import { ADMIN_MENU } from '../../utils/menuConfig';
import { bookingsAPI, getUser, servicesAPI, techniciansAPI, usersAPI } from '../../utils/api';

/**
 * Admin Dashboard
 * Overview of platform statistics and metrics
 */
const AdminDashboard = () => {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersRes, techRes, bookingsRes, servicesRes] = await Promise.all([
          usersAPI.getAll(),
          techniciansAPI.getAll(),
          bookingsAPI.getAll(),
          servicesAPI.getAll(),
        ]);

        setUsers(usersRes.users || []);
        setTechnicians(techRes.technicians || []);
        setBookings(bookingsRes.bookings || []);
        setServices(servicesRes.services || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard stats');
      }
    };

    loadStats();
  }, []);

  const serviceBreakdown = useMemo(() => {
    const counts = {};
    bookings.forEach((booking) => {
      const key = booking.service_name || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [bookings]);

  const activeServicesCount = bookings.filter((b) => b.status === 'in-progress').length;
  const pendingVerificationCount = technicians.filter((t) => !t.verified).length;

  return (
    <DashboardLayout
      userRole="admin"
      userName={currentUser?.fullName || 'Admin'}
      menuItems={ADMIN_MENU}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Platform overview and management tools
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Users"
          value={users.length}
          icon={Users}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          subtitle="Customers registered"
        />
        <Card
          title="Technicians"
          value={technicians.length}
          icon={Wrench}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          subtitle="Active service providers"
        />
        <Card
          title="Total Bookings"
          value={bookings.length}
          icon={Calendar}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          subtitle="All time bookings"
        />
        <Card
          title="Active Services"
          value={activeServicesCount}
          icon={CheckCircle}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          subtitle="Currently in progress"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">New Registrations Today</span>
              <span className="font-bold text-gray-900">{users.length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Bookings Today</span>
              <span className="font-bold text-gray-900">{bookings.length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Services Completed Today</span>
              <span className="font-bold text-green-600">{bookings.filter((b) => b.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Verifications</span>
              <span className="font-bold text-yellow-600">{pendingVerificationCount}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Categories
          </h3>
          <div className="space-y-3">
            {serviceBreakdown.length === 0 && (
              <p className="text-sm text-gray-600">No booking data available.</p>
            )}
            {serviceBreakdown.map(([serviceName, count], idx) => (
              <div
                key={serviceName}
                className={`flex justify-between items-center ${idx < serviceBreakdown.length - 1 ? 'pb-3 border-b border-gray-200' : ''}`}
              >
                <span className="text-gray-600">{serviceName}</span>
                <span className="font-bold text-gray-900">{count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          This Month Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">New Customers</p>
            <p className="text-3xl font-bold text-gray-900">{users.filter((u) => u.role === 'customer').length}</p>
            <p className="text-xs text-green-600 mt-1">Current total</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">New Technicians</p>
            <p className="text-3xl font-bold text-gray-900">{technicians.length}</p>
            <p className="text-xs text-green-600 mt-1">Current total</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Completed Services</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.filter((b) => b.status === 'completed').length}</p>
            <p className="text-xs text-green-600 mt-1">Current total</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Active Services</p>
            <p className="text-3xl font-bold text-gray-900">{services.length}</p>
            <p className="text-xs text-green-600 mt-1">Current total</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
