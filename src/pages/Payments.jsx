import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, X } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    paymentId: '',
    customer: '',
    invoice: '',
    amountPaid: 0,
    paymentMethod: 'Cash',
    notes: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/payments?keyword=${keyword}`, config);
      setPayments(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [custRes, invRes] = await Promise.all([
        axios.get('http://localhost:5000/api/customers?limit=1000', config),
        axios.get('http://localhost:5000/api/invoices', config)
      ]);
      setCustomers(custRes.data.customers || custRes.data);
      setInvoices(invRes.data);
    } catch (error) {
      console.error('Failed to load customers or invoices');
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchDependencies();
  }, [keyword]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/payments', formData, config);
      setSubmitLoading(false);
      setIsModalOpen(false);
      setFormData({ paymentId: '', customer: '', invoice: '', amountPaid: 0, paymentMethod: 'Cash', notes: '' });
      fetchPayments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record payment');
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payments</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search payments..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Payment ID</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Customer</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Invoice</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Amount Paid</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Method</th>
                <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500">No payments found.</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">{payment.paymentId}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{payment.customer?.fullName}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{payment.invoice?.invoiceNumber}</td>
                    <td className="py-3 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">${payment.amountPaid}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{payment.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden fade-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Record Payment</h2>
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
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment ID / Receipt No.</label>
                <input type="text" name="paymentId" required value={formData.paymentId} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Customer</label>
                  <select name="customer" required value={formData.customer} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value="">-- Customer --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Invoice</label>
                  <select name="invoice" required value={formData.invoice} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value="">-- Invoice --</option>
                    {invoices.map((i) => (
                      <option key={i._id} value={i._id}>{i.invoiceNumber} (${i.totalAmount})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Paid ($)</label>
                  <input type="number" step="0.01" name="amountPaid" required value={formData.amountPaid} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select name="paymentMethod" required value={formData.paymentMethod} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                <textarea name="notes" rows="2" value={formData.notes} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50">
                  {submitLoading ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Payments;
