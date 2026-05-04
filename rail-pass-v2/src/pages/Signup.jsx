import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from 
    ? (location.state.from.pathname + (location.state.from.search || '')) 
    : '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-20 px-6 flex items-center justify-center min-h-screen">
      <div className="glass w-full max-w-xl p-12 md:p-16 rounded-[40px] space-y-12 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xl text-slate-500 font-medium">Join RailPass Connect for premium ticketing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <label className="text-lg font-black text-slate-600 ml-1 uppercase tracking-wider">Full Name</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-14 pr-4 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10 transition-all text-xl text-slate-900 font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-lg font-black text-slate-600 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="roshan@example.com"
                className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-14 pr-4 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10 transition-all text-xl text-slate-900 font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-lg font-black text-slate-600 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-14 pr-4 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10 transition-all text-xl text-slate-900 font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-[0.98] uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-base font-bold text-slate-500 uppercase tracking-widest">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
