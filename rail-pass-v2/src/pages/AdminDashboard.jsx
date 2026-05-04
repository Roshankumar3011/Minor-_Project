import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainApi, bookingApi, adminApi, userApi } from '../api/api';
import { Plus, Edit, Trash2, Search, Train as TrainIcon, Users, Calendar, MapPin, User, BarChart, Database, Clock, Info, CreditCard, CheckCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/dateUtils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalTrains: 0, totalBookings: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trains');
  const [showModal, setShowModal] = useState(false);
  const [currentTrain, setCurrentTrain] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedBookingForReplace, setSelectedBookingForReplace] = useState(null);
  const [selectedPassengerId, setSelectedPassengerId] = useState(null);

  const [formData, setFormData] = useState({
    trainNumber: '',
    name: '',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    seatConfigs: [
      { classType: 'GEN', totalSeats: 100, price: 200 },
      { classType: 'SL', totalSeats: 200, price: 500 },
      { classType: '3AC', totalSeats: 100, price: 1200 },
      { classType: '2AC', totalSeats: 50, price: 1800 },
      { classType: '1AC', totalSeats: 20, price: 3000 }
    ],
    runningDays: []
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const fetchData = async () => {
    console.log("AdminDashboard: Initiating data fetch...");
    setLoading(true);
    try {
      const [trainRes, bookingRes, statsRes, userRes] = await Promise.all([
        trainApi.getAll(),
        bookingApi.getAll(),
        adminApi.getStats(),
        userApi.getAll()
      ]);

      console.log("Trains data:", trainRes.data);
      console.log("Bookings data:", bookingRes.data);
      console.log("Stats data:", statsRes.data);
      console.log("Users data:", userRes.data);

      setTrains(Array.isArray(trainRes.data) ? trainRes.data : []);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : []);
      setStats(prev => ({ ...prev, ...statsRes.data }));
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
    } catch (error) {
      console.error("AdminDashboard: Failed to fetch admin data:", error);
      if (error.response?.status === 403) {
        console.error("403 Forbidden — check backend ADMIN role assignment.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-[#111827]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrainIcon className="text-blue-600 animate-pulse" size={32} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Initializing Command Center</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">Authenticating Admin Privileges...</p>
        </div>
      </div>
    );
  }

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const totalSeatsCount = formData.seatConfigs.reduce((acc, config) => acc + config.totalSeats, 0);
    if (totalSeatsCount <= 0) {
      alert("At least one seat category must have seats.");
      return;
    }
    
    if (formData.seatConfigs.some(config => config.totalSeats < 0)) {
      alert("Seat counts cannot be negative.");
      return;
    }
    
    if (formData.seatConfigs.some(config => config.price <= 0)) {
      alert("Seat prices must be greater than zero.");
      return;
    }

    const sanitizedData = {
      ...formData,
      source: formData.source.trim(),
      destination: formData.destination.trim()
    };

    try {
      if (currentTrain) {
        await trainApi.update(currentTrain.id, sanitizedData);
        alert("Train updated successfully!");
      } else {
        await trainApi.add(sanitizedData);
        alert("Train added successfully!");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Action failed:", error);
      const message = error.response?.data?.message || error.message || "Action failed.";
      alert(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO DECOMMISSION THIS SERVICE? THIS ACTION WILL PERMANENTLY REMOVE ALL RELATED DATA INCLUDING BOOKINGS.")) return;
    
    // Instant UI update
    const previousTrains = [...trains];
    setTrains(trains.filter(t => t.id !== id));
    
    try {
      const response = await trainApi.delete(id);
      alert(response.data || "Service decommissioned successfully.");
      // Refresh stats to reflect deletion
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Delete failed:", error);
      setTrains(previousTrains); // Revert UI
      const message = error.response?.data || "Deletion failed due to system constraint.";
      alert(message);
    }
  };

  const handleReplaceClick = (booking) => {
    setSelectedBookingForReplace(booking);
    setShowReplaceModal(true);
    setSelectedPassengerId(null);
  };

  const handleConfirmReplace = async () => {
    if (!selectedPassengerId) {
      alert("Please select a passenger to replace.");
      return;
    }
    const otp = prompt("Enter OTP (Use 123456 for demo / bypass for admin):", "123456");
    if (!otp) return;
    try {
      const response = await bookingApi.replace({ 
        pnr: selectedBookingForReplace.pnr, 
        otp, 
        passengerId: selectedPassengerId 
      });
      alert(response.data);
      setShowReplaceModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data || "Replacement failed.");
    }
  };

  const openModal = (train = null) => {
    if (train) {
      setCurrentTrain(train);
      setFormData({
        ...train,
        departureTime: train.departureTime ? train.departureTime.slice(0, 16) : '',
        arrivalTime: train.arrivalTime ? train.arrivalTime.slice(0, 16) : ''
      });
    } else {
      setCurrentTrain(null);
      setFormData({
        trainNumber: '',
        name: '',
        source: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        seatConfigs: [
          { classType: 'GEN', totalSeats: 100, price: 200 },
          { classType: 'SL', totalSeats: 200, price: 500 },
          { classType: '3AC', totalSeats: 100, price: 1200 },
          { classType: '2AC', totalSeats: 50, price: 1800 },
          { classType: '1AC', totalSeats: 20, price: 3000 }
        ],
        runningDays: []
      });
    }
    setShowModal(true);
  };

  // Enhanced safety check for admin access
  if (authLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-[#111827] min-h-screen">
      <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xl font-black text-white italic tracking-tighter uppercase">Authenticating...</p>
    </div>
  );

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-[#111827] min-h-screen">
        <p className="text-xl font-black text-white italic tracking-tighter uppercase">Access Denied</p>
        <p className="text-slate-400">Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] pt-40 pb-20 px-8 md:px-12 w-full animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 text-white italic tracking-tighter uppercase leading-none">Admin <span className="text-blue-500">Control</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs border-l-4 border-blue-600 pl-6">System Management Terminal / Global Oversight</p>
        </div>
        
        <div className="flex bg-slate-900/40 backdrop-blur-2xl p-2 rounded-2xl border border-white/5 shadow-2xl">
          {['trains', 'bookings', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-12 py-5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
        <div className="bg-slate-900/30 backdrop-blur-3xl p-10 rounded-[40px] flex items-center gap-10 border border-white/5 hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
            <TrainIcon size={36} />
          </div>
          <div>
            <p className="text-base font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Total Trains</p>
            <p className="text-7xl font-black text-white italic tracking-tighter leading-none">{stats.totalTrains}</p>
          </div>
        </div>
        <div className="bg-slate-900/30 backdrop-blur-3xl p-10 rounded-[40px] flex items-center gap-10 border border-white/5 hover:border-emerald-500/30 transition-all shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
            <Database size={36} />
          </div>
          <div>
            <p className="text-base font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Total Bookings</p>
            <p className="text-7xl font-black text-white italic tracking-tighter leading-none">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="bg-slate-900/30 backdrop-blur-3xl p-10 rounded-[40px] flex items-center gap-10 border border-white/5 hover:border-purple-500/30 transition-all shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-20 h-20 bg-purple-600/10 rounded-3xl flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
            <Users size={36} />
          </div>
          <div>
            <p className="text-base font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Total Users</p>
            <p className="text-7xl font-black text-white italic tracking-tighter leading-none">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {activeTab === 'trains' && (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 gap-8">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.5em] italic border-b-4 border-blue-600 pb-3">{trains.length} Services Registered</h2>
            
            <div className="flex-1 max-w-4xl w-full">
              <div className="relative group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all stroke-[5px] group-hover:scale-125 group-hover:text-blue-500 duration-300 cursor-pointer" size={32} />
                <input 
                  type="text"
                  placeholder="SEARCH BY NAME OR NUMBER..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-24 bg-white border-4 border-slate-200 rounded-[35px] pl-28 pr-44 text-[24px] font-black text-black placeholder:text-black placeholder:font-black outline-none focus:bg-slate-50 focus:border-blue-500 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)] tracking-tight uppercase"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[14px] font-black uppercase tracking-[0.4em] border-[3px] border-blue-600 shadow-2xl shadow-blue-600/40 italic">
                  REAL-TIME SCAN
                </div>
              </div>
            </div>

            <button 
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-[22px] font-black flex items-center gap-4 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 uppercase text-md tracking-[0.2em] italic border border-white/10"
            >
              <Plus size={24} />
              <span>Add New Trains</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12">
            {trains
              .filter((t) => (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(t.trainNumber || "").includes(searchTerm))
              .map((train) => (
              <div key={train.id} className="bg-slate-900/50 backdrop-blur-3xl p-12 rounded-[50px] space-y-10 border-2 border-white/5 hover:border-blue-500/40 transition-all shadow-2xl group/card relative overflow-hidden group-hover/card:shadow-blue-600/10">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover/card:opacity-100 transition-all"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all">
                      <TrainIcon size={28} />
                    </div>
                    <div>
                      <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{train.name}</h4>
                      <p className="text-sm text-slate-300 font-black uppercase tracking-[0.2em] mt-4 bg-white/10 px-3 py-1 rounded-lg inline-block border border-white/5">#{train.trainNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => openModal(train)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-400 transition-all border border-white/10 shadow-lg">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDelete(train.id)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-600 hover:text-white rounded-2xl text-slate-400 transition-all border border-white/10 shadow-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-black tracking-[0.3em] mb-4 flex items-center gap-2">
                      <CreditCard size={14} className="text-blue-500" />
                      Class Distribution
                    </p>
                    <div className="grid grid-cols-5 gap-4">
                      {(train.seatConfigs ?? []).map(config => (
                        <div key={config.classType} className="text-center group/item">
                          <p className="text-xs font-black text-blue-400 mb-2">{config.classType}</p>
                          <p className="text-base font-black text-white italic tracking-tight">₹{config.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Clock size={20} className="text-blue-500" />
                    <span className="text-sm font-black text-slate-300 uppercase tracking-widest italic">
                      Arrival Terminal:
                      <span className="text-white not-italic font-black text-lg ml-2">
                        {formatTime(train.arrivalTime) || 'TBD'}
                      </span>
                    </span>
                  </div>

                  {/* Running Days */}
                  <div className="flex gap-2 pt-6 border-t border-white/5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      const fullDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
                      const isActive = (train.runningDays ?? []).includes(fullDays[idx]);
                      return (
                        <div key={idx} className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-black transition-all ${isActive ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30' : 'bg-white/5 text-slate-700 border border-white/5'}`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-slate-900/40 backdrop-blur-3xl overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/5 text-slate-300 text-xs font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-8">Reference</th>
                  <th className="p-8">Operator</th>
                  <th className="p-8">Service</th>
                  <th className="p-8">Vector</th>
                  <th className="p-8">Authorized Traveler</th>
                  <th className="p-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-8 font-mono text-blue-400 font-black text-base">{booking.pnr}</td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-base italic uppercase">{booking.user?.username || 'Unknown User'}</span>
                        <span className="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">{booking.user?.email || 'No Email'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-base italic uppercase">{booking.train?.name || 'Unknown Train'}</span>
                        <span className="text-xs text-slate-400 font-bold tracking-widest mt-1">#{booking.train?.trainNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-8 text-xs text-slate-300 font-black uppercase tracking-widest">{booking.train?.source || 'N/A'} → {booking.train?.destination || 'N/A'}</td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-base italic uppercase">{booking.passengers && booking.passengers[0] ? booking.passengers[0].name : (booking.nominee ? booking.nominee.name : 'N/A')}</span>
                        {booking.isReplaced && booking.nominee && (
                          <span className="text-xs text-purple-400 font-black uppercase tracking-[0.2em] mt-1">
                            REPLACEMENT: {booking.nominee.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border italic ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'CONFIRMED' && booking.nominee && !booking.isReplaced && (
                          <button 
                            onClick={() => handleReplaceClick(booking)}
                            className="p-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all border border-indigo-500/20"
                            title="Admin Override: Replace Passenger"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-900/40 backdrop-blur-3xl overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/5 text-slate-300 text-xs font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-8">ID</th>
                  <th className="p-8">Legal Identity</th>
                  <th className="p-8">Access Point</th>
                  <th className="p-8">Clearance</th>
                  <th className="p-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-8 font-mono text-slate-500 font-black text-sm">{u.id}</td>
                    <td className="p-8 font-black text-white text-base italic uppercase">{u.name}</td>
                    <td className="p-8 text-slate-400 font-bold text-sm tracking-widest uppercase">{u.email}</td>
                    <td className="p-8">
                      <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border italic ${
                        u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-8">
                      <span className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">ACTIVE SESSION</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 pt-40 animate-fade-in overflow-hidden">
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-[#0a0f18]/90 backdrop-blur-2xl" onClick={() => setShowModal(false)}></div>
          
          {/* Centered Modal Container */}
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0d131f] rounded-[45px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-white/5 bg-[#111827]/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 border border-white/10">
                  <TrainIcon size={30} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                    {currentTrain ? 'Modify Service' : 'Add New Trains'}
                  </h3>
                  <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1">Railway Command Module</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-14 h-14 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-2xl transition-all active:scale-90 border border-white/5 flex items-center justify-center group"
              >
                <Plus size={36} className="rotate-45 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-16">
              <form id="train-form" onSubmit={handleTrainSubmit} className="space-y-10">
                
                {/* 1. Train Information */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4">
                    <h4 className="text-[20px] font-bold text-white uppercase tracking-wider mb-2 italic">Service Identity</h4>
                    <p className="text-[12px] text-slate-400 font-medium uppercase leading-relaxed">Unique identifiers for this train service.</p>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Train Number</label>
                      <input required value={formData.trainNumber} onChange={e => setFormData({...formData, trainNumber: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" placeholder="e.g. 12432" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Train Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" placeholder="e.g. Rajdhani Express" />
                    </div>
                  </div>
                </div>

                {/* 2. Route & Schedule */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-white/5">
                  <div className="lg:col-span-4">
                    <h4 className="text-[20px] font-bold text-emerald-400 uppercase tracking-wider mb-2 italic">Vector & Time</h4>
                    <p className="text-[12px] text-slate-400 font-medium uppercase leading-relaxed">Path and temporal window configuration.</p>
                  </div>
                  <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Departure Terminal</label>
                        <input required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" placeholder="NEW DELHI" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Arrival Terminal</label>
                        <input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" placeholder="MUMBAI" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Departure Window</label>
                        <input required type="datetime-local" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Arrival Window</label>
                        <input required type="datetime-local" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Seat Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-white/5">
                  <div className="lg:col-span-4">
                    <h4 className="text-[20px] font-bold text-purple-400 uppercase tracking-wider mb-2 italic">Class Matrix</h4>
                    <p className="text-[12px] text-slate-400 font-medium uppercase leading-relaxed">Capacity allocation and fee structures.</p>
                  </div>
                  <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {formData.seatConfigs.map((config, idx) => (
                        <div key={config.classType} className="bg-white/5 p-6 rounded-[28px] border border-white/10 hover:border-purple-500/30 transition-all relative group/item">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-white/10 text-blue-400 rounded-xl flex items-center justify-center font-bold text-sm border border-white/10 group-hover/item:bg-purple-600 group-hover/item:text-white transition-all">
                              {config.classType}
                            </div>
                            <span className="font-bold text-white text-[15px] uppercase tracking-wide">{config.classType} Class</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide ml-1">Capacity</label>
                              <input 
                                type="number" 
                                value={config.totalSeats} 
                                onChange={e => {
                                  const newConfigs = [...formData.seatConfigs];
                                  newConfigs[idx].totalSeats = parseInt(e.target.value);
                                  setFormData({...formData, seatConfigs: newConfigs});
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[16px] font-medium text-white focus:border-purple-500 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide ml-1">Fare (₹)</label>
                              <input 
                                type="number" 
                                value={config.price} 
                                onChange={e => {
                                  const newConfigs = [...formData.seatConfigs];
                                  newConfigs[idx].price = parseFloat(e.target.value);
                                  setFormData({...formData, seatConfigs: newConfigs});
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[16px] font-medium text-white focus:border-purple-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Active Cycle */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-white/5 pb-10">
                  <div className="lg:col-span-4">
                    <h4 className="text-[20px] font-bold text-amber-400 uppercase tracking-wider mb-2 italic">Active Cycle</h4>
                    <p className="text-[12px] text-slate-400 font-medium uppercase leading-relaxed">Deployment schedule configuration.</p>
                  </div>
                  <div className="lg:col-span-8 flex flex-wrap gap-3">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                      const isActive = formData.runningDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = isActive
                              ? formData.runningDays.filter(d => d !== day)
                              : [...formData.runningDays, day];
                            setFormData({...formData, runningDays: newDays});
                          }}
                          className={`px-8 py-4 rounded-2xl text-[11px] font-black transition-all border-2 italic tracking-widest uppercase flex-1 min-w-[100px] ${
                            isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-600/20'
                            : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer - Sticky */}
            <div className="px-10 py-10 border-t border-white/5 bg-[#111827]/95 backdrop-blur-md flex flex-col md:flex-row gap-6 shadow-2xl shrink-0">
              <button 
                type="submit" 
                form="train-form"
                className="flex-[3] bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[28px] font-black text-lg uppercase tracking-[0.2em] italic shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] border border-white/10"
              >
                {currentTrain ? 'Modify Active Service' : 'Confirm Add Trains'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-500 py-6 rounded-[28px] font-black text-lg uppercase tracking-[0.2em] italic transition-all active:scale-[0.98] border border-white/5"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Passenger Replacement Modal for Admin */}
      {showReplaceModal && selectedBookingForReplace && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setShowReplaceModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0d131f] rounded-[45px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-slide-up">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-[#111827]/80">
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Admin Replacement Console</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Manual Override / PNR: {selectedBookingForReplace.pnr}</p>
              </div>
              <button onClick={() => setShowReplaceModal(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-2xl transition-all border border-white/5">
                <Plus size={32} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              {selectedBookingForReplace.nominee && (
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl flex items-center gap-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
                    <UserPlus size={30} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Registered Nominee (Incoming)</p>
                    <p className="text-2xl font-black text-white italic uppercase">{selectedBookingForReplace.nominee.name}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedBookingForReplace.nominee.gender} • {selectedBookingForReplace.nominee.age} Years</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Target Passenger for Deactivation</p>
                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedBookingForReplace.passengers?.filter(p => p.status !== 'CANCELLED').map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPassengerId(p.id)}
                      className={`w-full p-8 rounded-[30px] border transition-all flex items-center justify-between group ${
                        selectedPassengerId === p.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedPassengerId === p.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                          <User size={24} />
                        </div>
                        <div className="text-left">
                          <p className={`text-xl font-black uppercase italic tracking-tight ${selectedPassengerId === p.id ? 'text-white' : 'text-slate-200'}`}>{p.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">{p.gender} • {p.age} Years • ID: #{p.id}</p>
                        </div>
                      </div>
                      {selectedPassengerId === p.id && <CheckCircle size={28} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-[#111827]/95 border-t border-white/5 flex flex-col sm:flex-row gap-6">
              <button 
                onClick={handleConfirmReplace}
                disabled={!selectedPassengerId}
                className={`flex-[2] py-6 rounded-[28px] font-black text-lg uppercase tracking-[0.2em] italic transition-all active:scale-[0.98] shadow-2xl ${
                  selectedPassengerId 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Execute Replacement
              </button>
              <button 
                onClick={() => setShowReplaceModal(false)}
                className="flex-1 py-6 rounded-[28px] font-black text-lg uppercase tracking-[0.2em] italic bg-white/5 text-slate-400 hover:bg-white/10 transition-all border border-white/5"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
