import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Alert from '../../components/Alert';
import { TECHNICIAN_MENU } from '../../utils/menuConfig';
import { bookingsAPI, getUser } from '../../utils/api';

/**
 * Work History Page
 * View completed service jobs
 */
const WorkHistory = () => {
  const currentUser = getUser();
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await bookingsAPI.getAll();
        setJobs(response.bookings || []);
      } catch (err) {
        setError(err.message || 'Failed to load work history');
      }
    };

    loadJobs();
  }, []);

  const completedJobs = useMemo(
    () => jobs
      .filter((job) => job.status === 'completed')
      .map((job) => ({
        id: job.id,
        service: job.service_name,
        customerName: job.customer_name,
        date: job.booking_date,
        address: job.address,
        status: job.status,
      })),
    [jobs]
  );

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/technician/dashboard' },
    { label: 'Work History' },
  ];

  const columns = [
    {
      header: 'Job ID',
      accessor: 'id',
    },
    {
      header: 'Service',
      accessor: 'service',
    },
    {
      header: 'Customer',
      accessor: 'customerName',
    },
    {
      header: 'Date Completed',
      accessor: 'date',
    },
    {
      header: 'Address',
      render: (row) => (
        <span className="text-sm text-gray-600 truncate max-w-xs block">
          {row.address}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
  ];

  return (
    <DashboardLayout
      userRole="technician"
      userName={currentUser?.fullName || 'Technician'}
      menuItems={TECHNICIAN_MENU}
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Work History
        </h1>
        <p className="text-gray-600">
          View your completed service jobs
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Total Completed</h3>
          <p className="text-3xl font-bold text-gray-900">
            {completedJobs.length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-gray-900">{completedJobs.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-green-600">100%</p>
        </div>
      </div>

      {/* Work History Table */}
      <Table columns={columns} data={completedJobs} />
    </DashboardLayout>
  );
};

export default WorkHistory;
