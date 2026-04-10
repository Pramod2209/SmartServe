import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { CUSTOMER_MENU } from '../../utils/menuConfig';
import { Calendar, Clock, MapPin, Star, User } from 'lucide-react';
import { bookingsAPI, getUser, reviewsAPI } from '../../utils/api';

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
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    comment: '',
  });

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
      reviewId: booking.review_id,
      reviewRating: booking.review_rating,
      reviewComment: booking.review_comment,
    })),
    [bookings]
  );

  const handleViewDetails = (booking) => {
    setFeedbackError('');
    setFeedbackSuccess('');
    setFeedbackForm({
      rating: booking.reviewRating || 0,
      comment: booking.reviewComment || '',
    });
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const refreshBookings = async () => {
    const response = await bookingsAPI.getAll();
    const updatedBookings = response.bookings || [];
    setBookings(updatedBookings);

    if (selectedBooking) {
      const latest = updatedBookings.find((b) => b.id === selectedBooking.id);
      if (latest) {
        setSelectedBooking({
          id: latest.id,
          service: latest.service_name,
          date: latest.booking_date,
          time: latest.booking_time,
          technician: latest.technician_name,
          status: latest.status,
          address: latest.address,
          description: latest.description,
          reviewId: latest.review_id,
          reviewRating: latest.review_rating,
          reviewComment: latest.review_comment,
        });
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedBooking) return;

    setFeedbackError('');
    setFeedbackSuccess('');

    if (!feedbackForm.rating) {
      setFeedbackError('Please select a rating before submitting feedback.');
      return;
    }

    try {
      setIsSavingFeedback(true);
      await reviewsAPI.upsert({
        bookingId: selectedBooking.id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      });
      setFeedbackSuccess('Thank you. Your feedback was submitted successfully.');
      await refreshBookings();
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const renderStarPicker = () => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setFeedbackForm((prev) => ({ ...prev, rating: value }))}
          className="p-1"
          aria-label={`Set rating to ${value}`}
        >
          <Star
            className={`w-6 h-6 ${value <= feedbackForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

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

            {/* Feedback Section */}
            {selectedBooking.status === 'completed' && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Feedback & Rating
                </h3>

                {selectedBooking.reviewId && (
                  <p className="text-sm text-green-700 mb-3">
                    You have already submitted feedback for this service. You can update it anytime.
                  </p>
                )}

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Your Rating</p>
                  {renderStarPicker()}
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-2" htmlFor="feedback-comment">
                    Comments
                  </label>
                  <textarea
                    id="feedback-comment"
                    rows={4}
                    value={feedbackForm.comment}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Share your experience with this service"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {feedbackError && (
                  <Alert
                    type="error"
                    message={feedbackError}
                    onClose={() => setFeedbackError('')}
                    className="mb-3"
                  />
                )}

                {feedbackSuccess && (
                  <Alert
                    type="success"
                    message={feedbackSuccess}
                    onClose={() => setFeedbackSuccess('')}
                    className="mb-3"
                  />
                )}

                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  disabled={isSavingFeedback}
                  className="btn btn-primary"
                >
                  {isSavingFeedback ? 'Saving...' : selectedBooking.reviewId ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default MyServices;
