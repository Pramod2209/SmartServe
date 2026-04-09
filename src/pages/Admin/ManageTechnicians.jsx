import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Alert from '../../components/Alert';
import { ADMIN_MENU } from '../../utils/menuConfig';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { getUser, techniciansAPI } from '../../utils/api';

/**
 * Manage Technicians Page
 * Verify, activate, and deactivate technicians
 */
const ManageTechnicians = () => {
  const currentUser = getUser();
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState('');

  const loadTechnicians = async () => {
    try {
      const response = await techniciansAPI.getAll();
      setTechnicians(response.technicians || []);
    } catch (err) {
      setError(err.message || 'Failed to load technicians');
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleView = (tech) => {
    setSelectedTech(tech);
    setIsModalOpen(true);
  };

  const handleVerify = async (techId) => {
    try {
      await techniciansAPI.verify(techId, true);
      await loadTechnicians();
      setAlert({ type: 'success', message: 'Technician verified successfully' });
      setIsModalOpen(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to verify technician');
    }
  };

  const handleToggleStatus = async (techId, nextAvailable) => {
    try {
      await techniciansAPI.update(techId, { available: nextAvailable });
      await loadTechnicians();
      setAlert({ type: 'success', message: 'Technician status updated' });
      setIsModalOpen(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update technician status');
    }
  };

  const formatSpecialization = (value) => {
    if (!value) return 'Not specified';
    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const mappedTechnicians = useMemo(
    () => technicians.map((tech) => ({
      id: tech.id,
      name: tech.full_name,
      email: tech.email,
      phone: tech.phone,
      specialization: formatSpecialization(tech.specialization),
      experience: tech.experience ?? 0,
      jobsCompleted: tech.total_jobs ?? 0,
      certifications: tech.certifications || 'N/A',
      verified: tech.verified,
      status: tech.available ? 'active' : 'inactive',
      joinedDate: tech.technician_created_at
        ? new Date(tech.technician_created_at).toLocaleDateString()
        : tech.user_created_at
          ? new Date(tech.user_created_at).toLocaleDateString()
          : 'N/A',
    })),
    [technicians]
  );

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Manage Technicians' },
  ];

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Experience', render: (row) => `${row.experience} years` },
    {
      header: 'Verified',
      render: (row) => (
        <Badge status={row.verified ? 'verified' : 'not-verified'}>
          {row.verified ? 'Verified' : 'Not Verified'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleView(row)}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </button>
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
          Manage Technicians
        </h1>
        <p className="text-gray-600">
          Verify and manage technician accounts
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

      <Table columns={columns} data={mappedTechnicians} />

      {/* Technician Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Technician Details"
        size="medium"
        footer={
          selectedTech && (
            <>
              {!selectedTech.verified && (
                <button
                  onClick={() => handleVerify(selectedTech.id)}
                  className="btn btn-success"
                >
                  <CheckCircle className="w-4 h-4 mr-2 inline" />
                  Verify Technician
                </button>
              )}
              <button
                onClick={() => handleToggleStatus(selectedTech.id, selectedTech.status !== 'active')}
                className={`btn ${
                  selectedTech.status === 'active' ? 'btn-danger' : 'btn-success'
                }`}
              >
                {selectedTech.status === 'active' ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2 inline" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Activate
                  </>
                )}
              </button>
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
        {selectedTech && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Badge status={selectedTech.verified ? 'verified' : 'not-verified'}>
                {selectedTech.verified ? 'Verified' : 'Not Verified'}
              </Badge>
              <Badge status={selectedTech.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{selectedTech.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-900">{selectedTech.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{selectedTech.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Specialization</p>
                <p className="font-medium text-gray-900">
                  {selectedTech.specialization}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Experience</p>
                <p className="font-medium text-gray-900">
                  {selectedTech.experience} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Jobs Completed</p>
                <p className="font-medium text-gray-900">
                  {selectedTech.jobsCompleted}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Certifications</p>
              <p className="text-gray-900">{selectedTech.certifications}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">Joined Date</p>
              <p className="font-medium text-gray-900">{selectedTech.joinedDate}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ManageTechnicians;
