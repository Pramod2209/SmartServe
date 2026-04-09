import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { CUSTOMER_MENU } from '../../utils/menuConfig';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { bookingsAPI, getUser } from '../../utils/api';

/**
 * My Services Page
 * View all service bookings and their status
 */
const MyServices = () => {
  const currentUser = getUser();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const tableData = useMemo(
    () => bookings.map((booking) => ({
      id: booking.id,
      service: booking.service_name,
      date: booking.booking_date,
      time: booking.booking_time,
      technician: booking.technician_name,
      status: booking.status,
      address: booking.address,
      description: booking.description,
    })),
    [bookings]
  );

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/customer/dashboard' },
    { label: 'My Services' },
  ];

  const columns = [
    {
      header: 'Service',
      accessor: 'service',
    },
    {
      header: 'Date',
      accessor: 'date',
    },
    {
      header: 'Time',
      accessor: 'time',
    },
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
        <button
          onClick={() => handleViewDetails(row)}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout
      userRole="customer"
      userName={currentUser?.fullName || 'Customer'}
      menuItems={CUSTOMER_MENU}
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Services
        </h1>
        <p className="text-gray-600">
          Track all your service requests and their status
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

      {/* Services Table */}
      <Table
        columns={columns}
        data={tableData}
        onRowClick={handleViewDetails}
      />

      {/* Booking Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Service Details"
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
            {/* Status Badge */}
            <div>
              <Badge status={selectedBooking.status} />
            </div>

            {/* Service Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Service Type</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.service}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                <p className="font-medium text-gray-900">
                  #{selectedBooking.id}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.time}
                </p>
              </div>
            </div>

            {/* Technician */}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Assigned Technician
              </p>
              <p className="font-medium text-gray-900">
                {selectedBooking.technician || 'Not assigned yet'}
              </p>
            </div>

            {/* Address */}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Service Address
              </p>
              <p className="font-medium text-gray-900">
                {selectedBooking.address}
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Issue Description</p>
              <p className="text-gray-900">{selectedBooking.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default MyServices;
