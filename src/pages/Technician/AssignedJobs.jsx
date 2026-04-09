import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { TECHNICIAN_MENU } from '../../utils/menuConfig';
import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import { bookingsAPI, getUser } from '../../utils/api';

/**
 * Assigned Jobs Page
 * View and manage assigned service jobs
 */
const AssignedJobs = () => {
  const currentUser = getUser();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await bookingsAPI.getAll();
        setJobs(response.bookings || []);
      } catch (err) {
        setError(err.message || 'Failed to load jobs');
      }
    };

    loadJobs();
  }, []);

  const mappedJobs = useMemo(
    () => jobs.map((job) => ({
      id: job.id,
      service: job.service_name,
      customerName: job.customer_name,
      customerPhone: job.customer_phone,
      date: job.booking_date,
      time: job.booking_time,
      address: job.address,
      description: job.description,
      status: job.status,
    })),
    [jobs]
  );

  const activeJobs = mappedJobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled');

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await bookingsAPI.update(selectedJob.id, { status: newStatus });

      setJobs((prev) => prev.map((job) => (
        job.id === selectedJob.id ? { ...job, status: newStatus } : job
      )));

      setSelectedJob((prev) => ({ ...prev, status: newStatus }));
      setAlert({ type: 'success', message: `Job status updated to ${newStatus}` });
      setIsModalOpen(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update job status');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/technician/dashboard' },
    { label: 'Assigned Jobs' },
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
      header: 'Date',
      accessor: 'date',
    },
    {
      header: 'Time',
      accessor: 'time',
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
      userRole="technician"
      userName={currentUser?.fullName || 'Technician'}
      menuItems={TECHNICIAN_MENU}
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assigned Jobs
        </h1>
        <p className="text-gray-600">
          View and manage your assigned service jobs
        </p>
      </div>

      {/* Alert */}
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

      {/* Jobs Table */}
      <Table
        columns={columns}
        data={activeJobs}
        onRowClick={handleViewDetails}
      />

      {/* Job Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Job Details"
        size="medium"
        footer={
          selectedJob &&
          selectedJob.status !== 'completed' && (
            <>
              {selectedJob.status === 'assigned' && (
                <button
                  onClick={() => handleStatusUpdate('in-progress')}
                  className="btn btn-success"
                >
                  Start Job
                </button>
              )}
              {selectedJob.status === 'in-progress' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="btn btn-success"
                >
                  Mark as Completed
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </>
          )
        }
      >
        {selectedJob && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div>
              <Badge status={selectedJob.status} />
            </div>

            {/* Job Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Service Type</p>
                <p className="font-medium text-gray-900">
                  {selectedJob.service}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Job ID</p>
                <p className="font-medium text-gray-900">#{selectedJob.id}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Customer Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <User className="w-4 h-4 inline mr-2 text-gray-500" />
                  <span className="font-medium">{selectedJob.customerName}</span>
                </p>
                <p className="text-sm">
                  <Phone className="w-4 h-4 inline mr-2 text-gray-500" />
                  <span className="text-gray-700">{selectedJob.customerPhone}</span>
                </p>
              </div>
            </div>

            {/* Schedule */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Schedule</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedJob.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedJob.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Service Address
              </p>
              <p className="font-medium text-gray-900">{selectedJob.address}</p>
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Issue Description</p>
              <p className="text-gray-900">{selectedJob.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AssignedJobs;
