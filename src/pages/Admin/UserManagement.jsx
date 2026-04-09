import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { ADMIN_MENU } from '../../utils/menuConfig';
import { Eye, Trash2 } from 'lucide-react';
import { getUser, usersAPI } from '../../utils/api';

/**
 * User Management Page
 * View and manage all platform users
 */
const UserManagement = () => {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        await usersAPI.delete(user.id);
        await loadUsers();
        setAlert({ type: 'success', message: 'User deleted successfully' });
        setTimeout(() => setAlert(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'User Management' },
  ];

  const mappedUsers = useMemo(
    () => users.map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
      status: 'active',
      address: u.address,
    })),
    [users]
  );

  // Filter users based on role
  const filteredUsers =
    filterRole === 'all'
      ? mappedUsers
      : mappedUsers.filter((u) => u.role === filterRole);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      render: (row) => (
        <span className="capitalize font-medium text-gray-700">
          {row.role}
        </span>
      ),
    },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Joined Date', accessor: 'joinedDate' },
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
            className="text-primary-600 hover:text-primary-700"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
          User Management
        </h1>
        <p className="text-gray-600">
          View and manage all platform users
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

      {/* Stats and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Customers</h3>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'customer').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Technicians</h3>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'technician').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Role:
          </label>
          <div className="flex space-x-2">
            {['all', 'customer', 'technician', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === role
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Table columns={columns} data={filteredUsers} />

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
        size="medium"
        footer={
          selectedUser && (
            <>
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
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge status={selectedUser.status} />
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full capitalize">
                {selectedUser.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-900">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Joined Date</p>
                <p className="font-medium text-gray-900">
                  {selectedUser.joinedDate}
                </p>
              </div>
            </div>

            {selectedUser.address && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="text-gray-900">{selectedUser.address}</p>
              </div>
            )}

            {selectedUser.role === 'technician' && (
              <>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Professional Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.specialization || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jobs Completed</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.jobsCompleted || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagement;
