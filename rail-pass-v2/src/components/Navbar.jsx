import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Train, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-white/10 shadow-2xl transition-all duration-300">
      <div className="w-full px-6 md:px-10 lg:px-16">
        <div className="flex items-center justify-between h-24">
          
          {/* Left Side: Logo + Navigation Links */}
          <div className="flex items-center gap-16">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <Train className="text-white" size={28} />
              </div>
              <span className="text-2xl md:text-[24px] font-black tracking-tight text-white font-poppins">
                RAIL<span className="text-blue-500">PASS</span>
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-10">
              <Link 
                to="/" 
                className={`text-[18px] font-semibold transition-all hover:text-white ${isActive('/') ? 'text-blue-500 underline underline-offset-8 decoration-2' : 'text-slate-300'}`}
              >
                Services
              </Link>
              
              {user && (
                <Link 
                  to="/dashboard" 
                  className={`text-[18px] font-semibold transition-all hover:text-white ${isActive('/dashboard') ? 'text-blue-500 underline underline-offset-8 decoration-2' : 'text-slate-300'}`}
                >
                  My Bookings
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-2 text-[18px] font-semibold transition-all hover:text-purple-400 ${isActive('/admin') ? 'text-purple-500 underline underline-offset-8 decoration-2' : 'text-slate-300'}`}
                >
                  <Shield size={20} />
                  Admin Module
                </Link>
              )}
            </div>
          </div>
          
          {/* Right Side: Auth Controls */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <div className="flex items-center gap-8">
                <Link 
                  to="/login" 
                  className="text-[17px] font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-white text-[#0f172a] hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full text-[18px] font-bold transition-all shadow-xl active:scale-95"
                >
                  Signup
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 group">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-white leading-none">{user?.name || 'User'}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{user?.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-600/20 hover:text-red-500 text-slate-400 rounded-xl transition-all border border-white/5"
                  title="Logout"
                >
                  <LogOut size={24} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a] border-t border-white/10 animate-slide-down">
          <div className="px-6 py-8 space-y-6">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-[20px] font-semibold text-white">Services</Link>
            {user && <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block text-[20px] font-semibold text-white">My Bookings</Link>}
            {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block text-[20px] font-semibold text-purple-400">Admin Module</Link>}
            
            <hr className="border-white/5" />
            
            {!user ? (
              <div className="space-y-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-[18px] font-semibold text-slate-300">Login</Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-bold text-[18px]">Signup</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-white font-bold text-lg">{user?.name || 'User'}</div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 font-semibold text-lg"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
