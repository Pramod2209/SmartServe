import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Alert from '../../components/Alert';
import { CUSTOMER_MENU } from '../../utils/menuConfig';
import { bookingsAPI, getUser } from '../../utils/api';

/**
 * Customer Dashboard
 * Overview of bookings and quick actions
 */
const CustomerDashboard = () => {
  const currentUser = getUser();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await bookingsAPI.getAll();
        setBookings(response.bookings || []);
      } catch (err) {
        setError(err.message || 'Failed to load bookings');
      }
    };

    loadBookings();
  }, []);

  const normalizedBookings = useMemo(
    () => bookings.map((booking) => ({
      id: booking.id,
      service: booking.service_name,
      description: booking.description,
      date: booking.booking_date,
      time: booking.booking_time,
      status: booking.status,
    })),
    [bookings]
  );

  const activeBookings = normalizedBookings.filter(
    (b) => b.status === 'pending' || b.status === 'assigned' || b.status === 'in-progress'
  ).length;
  const completedServices = normalizedBookings.filter((b) => b.status === 'completed').length;
  const pendingBookings = normalizedBookings.filter((b) => b.status === 'pending').length;
  const recentBookings = normalizedBookings.slice(0, 5);

  return (
    <DashboardLayout
      userRole="customer"
      userName={currentUser?.fullName || 'Customer'}
      menuItems={CUSTOMER_MENU}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your services.
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

      {/* Quick Action */}
      <div className="mb-8">
        <Link to="/customer/book-service" className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Book New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Active Bookings"
          value={activeBookings}
          icon={Clock}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          subtitle="Currently in progress"
        />
        <Card
          title="Completed Services"
          value={completedServices}
          icon={CheckCircle}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          subtitle="Total completed"
        />
        <Card
          title="Pending Requests"
          value={pendingBookings}
          icon={Calendar}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          subtitle="Awaiting assignment"
        />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Bookings
          </h2>
          <Link
            to="/customer/services"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="space-y-4">
          {recentBookings.length === 0 && (
            <p className="text-sm text-gray-600">No bookings found yet.</p>
          )}
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {booking.service}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {booking.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {booking.date}
                  </span>
                  <span>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {booking.time}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <Badge status={booking.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
