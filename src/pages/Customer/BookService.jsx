import React, { useState } from 'react';
import { Calendar, Clock, MapPin, FileText, Wrench, Zap, Droplet, Wind, Home, Tv, Search, Scissors, Bike, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Breadcrumb from '../../components/Breadcrumb';
import Alert from '../../components/Alert';
import { CUSTOMER_MENU } from '../../utils/menuConfig';
import { bookingsAPI, getUser, servicesAPI } from '../../utils/api';

/**
 * Book Service Page
 * Customer can request a new home service
 */
const BookService = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    address: '',
    description: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);

  React.useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        const iconMap = {
          electrical: <Zap className="w-12 h-12" />,
          plumbing: <Droplet className="w-12 h-12" />,
          hvac: <Wind className="w-12 h-12" />,
          cleaning: <Home className="w-12 h-12" />,
          appliance: <Tv className="w-12 h-12" />,
          lawn: <Scissors className="w-12 h-12" />,
          bike: <Bike className="w-12 h-12" />,
          car: <Car className="w-12 h-12" />,
        };

        const mapped = (response.services || []).map((service) => {
          const lowerName = (service.name || '').toLowerCase();
          const iconKey = Object.keys(iconMap).find((key) => lowerName.includes(key));
          return {
            value: String(service.id),
            label: service.name,
            description: service.description || 'Professional service available',
            icon: iconKey ? iconMap[iconKey] : <Wrench className="w-12 h-12" />,
          };
        });

        setServiceCategories(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load services');
      }
    };

    loadServices();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.service) {
      setError('Please select a service category');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const selectedService = serviceCategories.find((service) => service.value === formData.service);

      await bookingsAPI.create({
        serviceId: Number(formData.service),
        serviceName: selectedService?.label || formData.service,
        description: formData.description,
        bookingDate: formData.date,
        bookingTime: formData.time,
        address: formData.address,
      });

      setSuccess('Service booked successfully! Redirecting to your services...');
      setTimeout(() => {
        navigate('/customer/services');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/customer/dashboard' },
    { label: 'Book Service' },
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
          Book a Service
        </h1>
        <p className="text-gray-600">
          Request a home service from our professional technicians
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert type="success" message={success} className="mb-6" />
      )}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Booking Form */}
      <div className="max-w-5xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Category Selection */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
              </div>
              <p className="text-gray-600 mb-6">Select a category to get started</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceCategories.length === 0 && (
                  <p className="text-sm text-gray-600">No services available right now.</p>
                )}
                {/* Display first 5 services or all services based on showAllServices state */}
                {(showAllServices ? serviceCategories : serviceCategories.slice(0, 5)).map((service) => (
                  <div
                    key={service.value}
                    onClick={() => setFormData({ ...formData, service: service.value })}
                    className={`cursor-pointer border-2 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg ${
                      formData.service === service.value
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className={`flex justify-center mb-4 ${
                      formData.service === service.value ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.label}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {service.description}
                    </p>
                  </div>
                ))}
                
                {/* Show "More" card if not showing all services */}
                {!showAllServices && (
                  <div
                    onClick={() => setShowAllServices(true)}
                    className="cursor-pointer border-2 border-gray-200 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg hover:border-blue-400"
                  >
                    <div className="flex justify-center mb-4 text-gray-700">
                      <Search className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      More
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Find other services you need.
                    </p>
                  </div>
                )}
              </div>
              {!formData.service && (
                <p className="text-red-500 text-sm mt-2">* Please select a service category</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Preferred Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Service Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Enter complete address where service is needed"
                className="input"
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="label">
                <FileText className="w-4 h-4 inline mr-2" />
                Issue Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe the issue or service required in detail..."
                className="input"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A technician will be assigned to your request soon. 
                You will be notified once a technician accepts the job.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookService;
