import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Settings, 
  UserCircle 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Manager', 'Cashier'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['Admin', 'Manager', 'Cashier'] },
    { name: 'Invoices', path: '/invoices', icon: <FileText size={20} />, roles: ['Admin', 'Manager', 'Cashier'] },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} />, roles: ['Admin', 'Manager', 'Cashier'] },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, roles: ['Admin', 'Manager'] },
    { name: 'Users', path: '/users', icon: <UserCircle size={20} />, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['Admin'] },
  ];

  return (
    <aside className="bg-slate-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-lg font-bold text-sky-400 tracking-wider">CEELKA BIYAHA</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navLinks.map((link) => {
            if (!link.roles.includes(user?.role)) return null;
            
            const isActive = location.pathname.startsWith(link.path);
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
