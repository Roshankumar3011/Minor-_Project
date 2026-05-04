import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from 
    ? (location.state.from.pathname + (location.state.from.search || '')) 
    : '/';

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(credentials);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xl text-slate-500 font-medium">Enter your credentials to access your account</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 relative z-10">
          {['User', 'Admin'].map((role) => {
            const isActive = (role === 'Admin' && credentials.email === 'admin@railpass.com') || (role === 'User' && credentials.email !== 'admin@railpass.com');
            return (
              <button
                key={role}
                type="button"
                className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => {
                  if (role === 'Admin') setCredentials({ ...credentials, email: 'admin@railpass.com' });
                  else setCredentials({ ...credentials, email: '' });
                }}
              >
                {role} Login
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl text-[13px] text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="text-lg font-black text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
              <input
                type="email"
                name="email"
                required
                value={credentials.email}
                onChange={handleChange}
                placeholder="roshan@example.com"
                className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-14 pr-4 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all text-xl text-slate-900 font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-lg font-black text-slate-700 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
              <input
                type="password"
                name="password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-14 pr-4 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all text-xl text-slate-900 font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-[0.98] uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-base font-bold text-slate-500 uppercase tracking-widest">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
