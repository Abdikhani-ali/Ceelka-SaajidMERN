import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/customers';

const emptyForm = {
  fullName: '',
  phoneNumber: '',
  address: '',
  customerType: 'With Meter',
  status: 'Active',
  initialMeterReading: '',
  fixedMonthlyPrice: '',
  registrationDate: new Date().toISOString().split('T')[0],
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [nextCustomerId, setNextCustomerId] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        keyword,
        page: String(page),
        limit: String(limit),
      });
      if (customerTypeFilter !== 'All') {
        params.append('customerType', customerTypeFilter);
      }
      const { data } = await axios.get(`${API_URL}?${params}`, getAuthConfig());
      setCustomers(data.customers);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, customerTypeFilter]);

  const fetchNextCustomerId = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/next-id`, getAuthConfig());
      setNextCustomerId(data.customerId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setPage(1);
  }, [keyword, customerTypeFilter]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setError('');
    fetchNextCustomerId();
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      customerType: customer.customerType,
      status: customer.status,
      initialMeterReading: customer.initialMeterReading ?? '',
      fixedMonthlyPrice: customer.fixedMonthlyPrice ?? '',
      registrationDate: customer.registrationDate
        ? new Date(customer.registrationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setError('');
    setIsModalOpen(true);
  };

  const openDetailsModal = (customer) => {
    setViewingCustomer(customer);
    setIsDetailsOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData(emptyForm);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthConfig());
        fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting customer');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        customerType: formData.customerType,
        status: formData.status,
        registrationDate: formData.registrationDate,
        initialMeterReading:
          formData.customerType === 'With Meter' ? formData.initialMeterReading : null,
        fixedMonthlyPrice:
          formData.customerType === 'Without Meter' ? formData.fixedMonthlyPrice : null,
      };

      if (editingCustomer) {
        await axios.put(`${API_URL}/${editingCustomer._id}`, payload, getAuthConfig());
      } else {
        await axios.post(API_URL, payload, getAuthConfig());
      }

      closeModal();
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customers</h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID, phone, or address..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-slate-400"
            />
          </div>
          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="With Meter">With Meter</option>
            <option value="Without Meter">Without Meter</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Customer ID</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Full Name</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Type</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Phone</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Address</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Registered</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">{customer.customerId}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{customer.fullName}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.customerType === 'With Meter'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {customer.customerType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{customer.phoneNumber}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{customer.address}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(customer.registrationDate)}</td>
                    <td className="py-3 px-4 text-sm font-medium text-right space-x-1">
                      <button
                        onClick={() => openDetailsModal(customer)}
                        className="text-slate-600 hover:text-slate-900 p-1"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(customer)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="text-rose-600 hover:text-rose-900 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
          <span>Showing {customers.length} of {total} results</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600"
            >
              <ChevronLeft size={18} />
            </button>
            <span>Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer ID</label>
                <input
                  type="text"
                  value={editingCustomer ? editingCustomer.customerId : nextCustomerId}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-600 dark:border-slate-600 dark:text-slate-300 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Auto-generated — cannot be edited</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Type</label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  disabled={!!editingCustomer}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60"
                >
                  <option value="With Meter">With Meter</option>
                  <option value="Without Meter">Without Meter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input type="text" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registration Date</label>
                <input type="date" name="registrationDate" required value={formData.registrationDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

              {formData.customerType === 'With Meter' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Meter Reading</label>
                  <input
                    type="number"
                    step="0.01"
                    name="initialMeterReading"
                    required
                    value={formData.initialMeterReading}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fixed Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="fixedMonthlyPrice"
                    required
                    value={formData.fixedMonthlyPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50">
                  {submitLoading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsOpen && viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden fade-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Customer Details</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <DetailRow label="Customer ID" value={viewingCustomer.customerId} />
              <DetailRow label="Full Name" value={viewingCustomer.fullName} />
              <DetailRow label="Customer Type" value={viewingCustomer.customerType} />
              <DetailRow label="Phone Number" value={viewingCustomer.phoneNumber} />
              <DetailRow label="Address" value={viewingCustomer.address} />
              <DetailRow label="Status" value={viewingCustomer.status} />
              <DetailRow label="Registration Date" value={formatDate(viewingCustomer.registrationDate)} />
              {viewingCustomer.customerType === 'With Meter' && (
                <DetailRow label="Initial Meter Reading" value={viewingCustomer.initialMeterReading} />
              )}
              {viewingCustomer.customerType === 'Without Meter' && (
                <DetailRow label="Fixed Monthly Price" value={`$${viewingCustomer.fixedMonthlyPrice}`} />
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => { setIsDetailsOpen(false); openEditModal(viewingCustomer); }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="font-medium text-slate-800 dark:text-slate-200 text-right ml-4">{value}</span>
  </div>
);

export default Customers;
