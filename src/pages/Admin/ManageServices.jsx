import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { ADMIN_MENU } from '../../utils/menuConfig';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getUser, servicesAPI } from '../../utils/api';


const ManageServices = () => {
  const currentUser = getUser();
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
  });

  const formatPriceRange = (value) => {
    if (!value) return '';

    const normalized = String(value)
      .replace(/\$/g, '₹')
      .replace(/(^|[^₹\d])(\d+(?:\.\d+)?)/g, '$1₹$2');

    return normalized;
  };

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.services || []);
    } catch (err) {
      setError(err.message || 'Failed to load services');
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAdd = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', basePrice: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      basePrice: service.price_range || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (service) => {
    if (confirm(`Are you sure you want to delete ${service.name}?`)) {
      try {
        await servicesAPI.delete(service.id);
        await loadServices();
        setAlert({ type: 'success', message: 'Service deleted successfully' });
        setTimeout(() => setAlert(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete service');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (editingService) {
        await servicesAPI.update(editingService.id, {
          name: formData.name,
          description: formData.description,
          priceRange: formData.basePrice,
        });
        setAlert({ type: 'success', message: 'Service updated successfully' });
      } else {
        await servicesAPI.create({
          name: formData.name,
          description: formData.description,
          priceRange: formData.basePrice,
        });
        setAlert({ type: 'success', message: 'Service added successfully' });
      }

      await loadServices();
      setIsModalOpen(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const tableData = useMemo(
    () => services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      basePrice: service.price_range,
    })),
    [services]
  );

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Manage Services' },
  ];

  const columns = [
    { header: 'Service Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Base Price',
      render: (row) => formatPriceRange(row.basePrice),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-primary-600 hover:text-primary-700"
          >
            <Edit className="w-4 h-4" />
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

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Services
          </h1>
          <p className="text-gray-600">
            Add, edit, or remove service categories
          </p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Service
        </button>
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

      <Table columns={columns} data={tableData} />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="medium"
        footer={
          <>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              form="service-form"
              disabled={loading}
            >
              {loading ? 'Saving...' : `${editingService ? 'Update' : 'Add'} Service`}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Service Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="input"
              placeholder="e.g., Electrician"
            />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows="3"
              className="input"
              placeholder="Brief description of the service"
            />
          </div>
          <div>
            <label className="label">Base Price (₹) *</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) =>
                setFormData({ ...formData, basePrice: e.target.value })
              }
              required
              min="0"
              step="0.01"
              className="input"
              placeholder="₹50.00"
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageServices;
