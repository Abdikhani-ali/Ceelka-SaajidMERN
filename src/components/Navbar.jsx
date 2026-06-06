import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Dashboard</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
          </div>
        </div>
        
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        
        <Link to="/profile" className="p-2 text-slate-500 hover:text-sky-600 transition-colors">
          <User size={20} />
        </Link>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
