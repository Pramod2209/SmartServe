import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Alert from '../../components/Alert';
import { TECHNICIAN_MENU } from '../../utils/menuConfig';
import { bookingsAPI, getUser } from '../../utils/api';

/**
 * Technician Dashboard
 * Overview of assigned jobs and work statistics
 */
const TechnicianDashboard = () => {
  const currentUser = getUser();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await bookingsAPI.getAll();
        setBookings(response.bookings || []);
      } catch (err) {
        setError(err.message || 'Failed to load jobs');
      }
    };

    loadBookings();
  }, []);

  const normalizedJobs = useMemo(
    () => bookings.map((job) => ({
      id: job.id,
      service: job.service_name,
      description: job.description,
      customerName: job.customer_name,
      date: job.booking_date,
      time: job.booking_time,
      status: job.status,
    })),
    [bookings]
  );

  const assignedJobs = normalizedJobs.filter((j) => j.status === 'assigned').length;
  const inProgressJobs = normalizedJobs.filter((j) => j.status === 'in-progress').length;
  const completedJobs = normalizedJobs.filter((j) => j.status === 'completed').length;
  const upcomingJobs = normalizedJobs
    .filter((j) => j.status === 'assigned' || j.status === 'in-progress')
    .slice(0, 5);

  return (
    <DashboardLayout
      userRole="technician"
      userName={currentUser?.fullName || 'Technician'}
      menuItems={TECHNICIAN_MENU}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Technician Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your assigned jobs and track your work
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Assigned Jobs"
          value={assignedJobs}
          icon={Briefcase}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          subtitle="New assignments"
        />
        <Card
          title="In Progress"
          value={inProgressJobs}
          icon={Clock}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          subtitle="Currently working"
        />
        <Card
          title="Completed"
          value={completedJobs}
          icon={CheckCircle}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          subtitle="Total completed"
        />
      </div>

      {/* Upcoming Jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Upcoming Jobs
          </h2>
        </div>

        <div className="space-y-4">
          {upcomingJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No upcoming jobs at the moment
            </p>
          ) : (
            upcomingJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {job.service}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {job.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{job.customerName}</span>
                    <span>•</span>
                    <span>{job.date} at {job.time}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Badge status={job.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            This Month
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jobs Completed</span>
              <span className="font-bold text-gray-900">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hours Worked</span>
              <span className="font-bold text-gray-900">42</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Rating</span>
              <span className="font-bold text-gray-900">4.8 ⭐</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On-Time Rate</span>
              <span className="font-bold text-green-600">95%</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
