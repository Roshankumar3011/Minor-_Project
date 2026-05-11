import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Train as TrainIcon, Plus, ArrowLeft, CreditCard, Clock, Save } from 'lucide-react';

const AddTrain = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-[#111827] min-h-screen">
        <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xl font-black text-white italic tracking-tighter uppercase">Authenticating...</p>
      </div>
    );
  }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    const totalSeatsCount = formData.seatConfigs.reduce((acc, config) => acc + config.totalSeats, 0);
    if (totalSeatsCount <= 0) {
      alert("At least one seat category must have seats.");
      setLoading(false);
      return;
    }

    const sanitizedData = {
      ...formData,
      source: formData.source.trim(),
      destination: formData.destination.trim()
    };

    try {
      await trainApi.add(sanitizedData);
      alert("Train added successfully!");
      navigate('/admin');
    } catch (error) {
      console.error("Action failed:", error);
      const message = error.response?.data?.message || error.message || "Action failed.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] pt-32 pb-20 px-8 md:px-12 w-full animate-fade-in relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Back to Dashboard</span>
            </button>
            <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">
              Register <span className="text-blue-500">Service</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] border-l-4 border-blue-600 pl-4 mt-2">
              Railway Deployment Terminal / New Entry
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 border border-white/10">
              <TrainIcon size={30} />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/30 backdrop-blur-3xl rounded-[45px] border border-white/10 shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-12">
            
            {/* 1. Train Information */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <h4 className="text-[20px] font-bold text-white uppercase tracking-wider mb-2 italic">Service Identity</h4>
                <p className="text-[12px] text-slate-400 font-medium uppercase leading-relaxed">Unique identifiers for this train service.</p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Train Number</label>
                  <input 
                    required 
                    value={formData.trainNumber} 
                    onChange={e => setFormData({...formData, trainNumber: e.target.value})} 
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" 
                    placeholder="e.g. 12432" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Train Name</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" 
                    placeholder="e.g. Rajdhani Express" 
                  />
                </div>
              </div>
            </div>

            {/* 2. Route & Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-12 border-t border-white/5">
              <div className="lg:col-span-4">
                <h4 className="text-[20px] font-bold text-emerald-400 uppercase tracking-wider mb-2 italic">Vector & Time</h4>
                <p className="text-[12px] text-slate-400 font-medium uppercase leading-relaxed">Path and temporal window configuration.</p>
              </div>
              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Departure Terminal</label>
                    <input 
                      required 
                      value={formData.source} 
                      onChange={e => setFormData({...formData, source: e.target.value})} 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" 
                      placeholder="NEW DELHI" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Arrival Terminal</label>
                    <input 
                      required 
                      value={formData.destination} 
                      onChange={e => setFormData({...formData, destination: e.target.value})} 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[16px] font-medium text-white placeholder:text-slate-600" 
                      placeholder="MUMBAI" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Departure Window</label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={formData.departureTime} 
                      onChange={e => setFormData({...formData, departureTime: e.target.value})} 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[14px] font-semibold text-slate-300 uppercase tracking-wide ml-2">Arrival Window</label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={formData.arrivalTime} 
                      onChange={e => setFormData({...formData, arrivalTime: e.target.value})} 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-[16px] font-medium text-white" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Seat Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-12 border-t border-white/5">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-12 border-t border-white/5">
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

            {/* Submit Actions */}
            <div className="flex flex-col md:flex-row gap-6 pt-12 border-t border-white/5">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[3] bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[28px] font-black text-lg uppercase tracking-[0.2em] italic shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] border border-white/10 flex items-center justify-center gap-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={24} />
                    Confirm Add Trains
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/admin')} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-500 py-6 rounded-[28px] font-black text-lg uppercase tracking-[0.2em] italic transition-all active:scale-[0.98] border border-white/5"
              >
                Abort
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTrain;
