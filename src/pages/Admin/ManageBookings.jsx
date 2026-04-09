import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Alert from '../../components/Alert';
import { ADMIN_MENU } from '../../utils/menuConfig';
import { Eye, UserPlus } from 'lucide-react';
import { bookingsAPI, getUser, techniciansAPI } from '../../utils/api';

/**
 * Manage Bookings Page
 * Assign technicians to customer requests
 */
const ManageBookings = () => {
  const currentUser = getUser();
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    const response = await bookingsAPI.getAll();
    setBookings(response.bookings || []);
  };

  const loadTechnicians = async () => {
    const response = await techniciansAPI.getAll({ verified: true, available: true });
    setTechnicians(response.technicians || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadBookings(), loadTechnicians()]);
      } catch (err) {
        setError(err.message || 'Failed to load booking data');
      }
    };

    loadData();
  }, []);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleAssign = (booking) => {
    setSelectedBooking(booking);
    setIsAssignModalOpen(true);
  };

  const handleAssignTechnician = async (tech) => {
    try {
      await bookingsAPI.update(selectedBooking.id, {
        technicianId: tech.id,
        status: 'assigned',
      });
      await loadBookings();
      setAlert({
        type: 'success',
        message: `Technician ${tech.full_name} assigned successfully`,
      });
      setIsAssignModalOpen(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to assign technician');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Manage Bookings' },
  ];

  const tableData = useMemo(
    () => bookings.map((b) => ({
      id: b.id,
      service: b.service_name,
      customerName: b.customer_name,
      date: b.booking_date,
      time: b.booking_time,
      technician: b.technician_name,
      status: b.status,
      address: b.address,
      description: b.description,
    })),
    [bookings]
  );

  const formatSpecialization = (value) => {
    if (!value) return 'Not specified';
    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    { header: 'Booking ID', accessor: 'id' },
    { header: 'Service', accessor: 'service' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    {
      header: 'Technician',
      render: (row) => row.technician || 'Not assigned',
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(row)}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleAssign(row)}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      userRole="admin"
      userName={currentUser?.fullName || 'Admin'}
      menuItems={ADMIN_MENU}
    >
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manage Bookings
        </h1>
        <p className="text-gray-600">
          View and assign technicians to service requests
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Total Bookings</h3>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {bookings.filter((b) => b.status === 'pending').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">In Progress</h3>
          <p className="text-2xl font-bold text-purple-600">
            {bookings.filter((b) => b.status === 'in-progress').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter((b) => b.status === 'completed').length}
          </p>
        </div>
      </div>

      <Table columns={columns} data={tableData} />

      {/* View Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Booking Details"
        size="medium"
        footer={
          <button
            onClick={() => setIsModalOpen(false)}
            className="btn btn-secondary"
          >
            Close
          </button>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <Badge status={selectedBooking.status} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                <p className="font-medium text-gray-900">#{selectedBooking.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Service Type</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.service}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Technician</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.technician || 'Not assigned'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="font-medium text-gray-900">{selectedBooking.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Time</p>
                <p className="font-medium text-gray-900">{selectedBooking.time}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-gray-900">{selectedBooking.address}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{selectedBooking.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Technician"
        size="small"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a technician to assign to this booking:
            </p>
            <div className="space-y-2">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => handleAssignTechnician(tech)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{tech.full_name}</p>
                  <p className="text-sm text-gray-600">
                    Specialization: {formatSpecialization(tech.specialization)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ManageBookings;
