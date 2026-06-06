import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, CreditCard, DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/reports/dashboard', config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: <Users size={24} className="text-sky-500" />, bg: 'bg-sky-100 dark:bg-sky-900/30' },
    { title: 'Total Invoices', value: stats?.totalInvoices || 0, icon: <FileText size={24} className="text-indigo-500" />, bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { title: 'Total Payments', value: stats?.totalPayments || 0, icon: <CreditCard size={24} className="text-emerald-500" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: <DollarSign size={24} className="text-rose-500" />, bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200, 1900, 3000, 5000, 4200, stats?.totalRevenue || 0],
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Customers',
        data: [12, 19, 15, 25, 22, stats?.totalCustomers || 0],
        borderColor: 'rgba(244, 63, 94, 1)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Customer Growth</h3>
          <div className="h-64">
            <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Payment ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Customer</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentActivities?.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <tr key={activity._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{activity.paymentId}</td>
                    <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{activity.customer?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">${activity.amountPaid}</td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{new Date(activity.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-sm text-slate-500">No recent payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
