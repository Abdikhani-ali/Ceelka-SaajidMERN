import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Download, X } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customer: '',
    billingMonth: '',
    currentReading: '',
    unitPrice: '',
    dueDate: '',
    status: 'Unpaid',
  });
  const [billingInfo, setBillingInfo] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/invoices?keyword=${keyword}`, getAuthConfig());
      setInvoices(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/customers?limit=1000', getAuthConfig());
      setCustomers(data.customers || data);
    } catch (err) {
      console.error('Failed to load customers for select list');
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [keyword]);

  const fetchBillingInfo = async (customerId) => {
    if (!customerId) {
      setBillingInfo(null);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/customers/${customerId}/billing-info`,
        getAuthConfig()
      );
      setBillingInfo(data);
    } catch (err) {
      console.error(err);
      setBillingInfo(null);
    }
  };

  const isMeterCustomer = billingInfo?.customerType === 'With Meter';
  const consumption = isMeterCustomer && billingInfo?.previousReading !== null && formData.currentReading
    ? Number(formData.currentReading) - billingInfo.previousReading
    : 0;
  const estimatedTotal = isMeterCustomer
    ? consumption * (Number(formData.unitPrice) || 0)
    : billingInfo?.fixedMonthlyPrice || 0;

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${id}`, getAuthConfig());
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting invoice');
      }
    }
  };

  const handlePrint = (invoice) => {
    alert(`Downloading PDF for Invoice ${invoice.invoiceNumber}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'customer') {
      fetchBillingInfo(value);
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      customer: '',
      billingMonth: '',
      currentReading: '',
      unitPrice: '',
      dueDate: '',
      status: 'Unpaid',
    });
    setBillingInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const payload = {
        invoiceNumber: formData.invoiceNumber,
        customer: formData.customer,
        billingMonth: formData.billingMonth,
        dueDate: formData.dueDate,
        status: formData.status,
      };

      if (isMeterCustomer) {
        payload.currentReading = formData.currentReading;
        payload.unitPrice = formData.unitPrice;
      }

      await axios.post('http://localhost:5000/api/invoices', payload, getAuthConfig());
      setSubmitLoading(false);
      setIsModalOpen(false);
      resetForm();
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Invoices</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Create Invoice</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Inv Number</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Customer</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Type</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Month</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Consumption</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Amount</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="8" className="py-8 text-center text-slate-500">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="8" className="py-8 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{invoice.customer?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{invoice.customer?.customerType || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{invoice.billingMonth}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {invoice.customer?.customerType === 'Without Meter' ? '—' : `${invoice.waterConsumption} m³`}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">${invoice.totalAmount}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right space-x-2">
                      <button onClick={() => handlePrint(invoice)} className="text-sky-600 hover:text-sky-900 p-1" title="Download PDF">
                        <Download size={18} />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 p-1">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(invoice._id)} className="text-rose-600 hover:text-rose-900 p-1">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500">
          Showing {invoices.length} results
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Create Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 mb-4 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label>
                  <input type="text" name="invoiceNumber" required value={formData.invoiceNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Month</label>
                  <input type="month" name="billingMonth" required value={formData.billingMonth} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Customer</label>
                <select name="customer" required value={formData.customer} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName} ({c.customerId}) — {c.customerType}
                    </option>
                  ))}
                </select>
              </div>

              {billingInfo && isMeterCustomer && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 dark:text-blue-300">
                      <strong>Previous Reading:</strong> {billingInfo.previousReading} m³
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                      {billingInfo.previousReading === billingInfo.initialMeterReading
                        ? 'Using initial meter reading (first invoice)'
                        : 'Using last invoice current reading'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Reading (m³)</label>
                      <input type="number" step="0.01" name="currentReading" required value={formData.currentReading} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Price ($)</label>
                      <input type="number" step="0.01" name="unitPrice" required value={formData.unitPrice} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                  </div>

                  {formData.currentReading && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm space-y-1">
                      <p><strong>Consumption:</strong> {consumption} m³</p>
                      <p><strong>Estimated Total:</strong> ${estimatedTotal.toFixed(2)}</p>
                    </div>
                  )}
                </>
              )}

              {billingInfo && !isMeterCustomer && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                  <p className="text-amber-800 dark:text-amber-300">
                    <strong>Fixed Monthly Price:</strong> ${billingInfo.fixedMonthlyPrice}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                    No meter readings required. Invoice amount will be the fixed monthly price.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                  {submitLoading ? 'Saving...' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
