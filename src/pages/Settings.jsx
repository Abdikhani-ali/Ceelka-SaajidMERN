import { useState } from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState('System');
  
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    if (e.target.value === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Company Information</h2>
          <p className="text-sm text-slate-500 mt-1">Update your company details and invoice information.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input type="text" defaultValue="CEELKA BIYAHA SAJID" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                <option value="USD">USD ($)</option>
                <option value="KES">KES (KSh)</option>
                <option value="SOS">SOS (Sh.So.)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Preferences</h2>
        </div>
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme</label>
            <select value={theme} onChange={handleThemeChange} className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <option value="System">System</option>
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
