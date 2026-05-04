import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, Users, Search, CheckSquare, ChevronDown } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const SearchCard = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [quota, setQuota] = useState('General');
  const [options, setOptions] = useState({
    flexible: false,
    concession: false,
    disability: false
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!from || !to || !date) {
      alert('Please fill in From, To and Date');
      return;
    }
    
    setLoading(true);
    const trimmedFrom = from.trim();
    const trimmedTo = to.trim();
    
    console.log(`Initiating search: ${trimmedFrom} -> ${trimmedTo} on ${date}`);

    const searchParams = new URLSearchParams({
      from: trimmedFrom,
      to: trimmedTo,
      date,
      travelClass: selectedClass,
      quota
    });

    // Simulate a small delay for a premium feel
    setTimeout(() => {
      setLoading(false);
      navigate(`/search-results?${searchParams.toString()}`);
    }, 800);
  };

  return (
    <div className="w-full space-y-10">
      {/* Booking Form Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-10 md:p-14 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-white/5 animate-slide-up relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="space-y-10 relative z-10">
          {/* From & To */}
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <label className="text-[18px] font-bold text-slate-400 uppercase tracking-widest ml-1">From Station</label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-400 transition-colors" size={24} />
                <input 
                  type="text" 
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter departure station" 
                  className="h-16 w-full pl-16 pr-8 bg-slate-800/50 border border-white/10 rounded-2xl text-[20px] font-semibold text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/10 transition-all outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[18px] font-bold text-slate-400 uppercase tracking-widest ml-1">To Station</label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 group-focus-within:text-orange-400 transition-colors" size={24} />
                <input 
                  type="text" 
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter arrival station" 
                  className="h-16 w-full pl-16 pr-8 bg-slate-800/50 border border-white/10 rounded-2xl text-[20px] font-semibold text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/10 transition-all outline-none shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Date & Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[18px] font-bold text-slate-400 uppercase tracking-widest ml-1">Travel Date</label>
              <div className="relative group">
                <button 
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="h-16 w-full pl-16 pr-8 bg-slate-800/50 border border-white/10 rounded-2xl text-[20px] font-semibold text-white text-left focus:bg-slate-800 focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/10 transition-all outline-none shadow-sm flex items-center"
                >
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
                  {date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Travel Date'}
                </button>
              </div>
            </div>

            {showDatePicker && (
              <CustomDatePicker 
                selectedDate={date} 
                onSelect={(selected) => {
                  setDate(selected);
                  setShowDatePicker(false);
                }} 
                onClose={() => setShowDatePicker(false)} 
              />
            )}

            <div className="space-y-3">
              <label className="text-[18px] font-bold text-slate-400 uppercase tracking-widest ml-1">Travel Class</label>
              <div className="relative group">
                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-16 w-full pl-16 pr-12 bg-slate-800/50 border border-white/10 rounded-2xl text-[20px] font-semibold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option className="bg-slate-900 text-white">All Classes</option>
                  <option className="bg-slate-900 text-white text-[16px]">Sleeper (SL)</option>
                  <option className="bg-slate-900 text-white text-[16px]">AC First Class (1A)</option>
                  <option className="bg-slate-900 text-white text-[16px]">AC 2 Tier (2A)</option>
                  <option className="bg-slate-900 text-white text-[16px]">AC 3 Tier (3A)</option>
                  <option className="bg-slate-900 text-white text-[16px]">General (GN)</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
              </div>
            </div>
          </div>

          {/* Quota */}
          <div className="space-y-3">
            <label className="text-[18px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Quota</label>
            <div className="relative group">
              <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
              <select 
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="h-16 w-full pl-16 pr-12 bg-slate-800/50 border border-white/10 rounded-2xl text-[20px] font-semibold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer shadow-sm"
              >
                <option className="bg-slate-900 text-white">General</option>
                <option className="bg-slate-900 text-white text-[16px]">Tatkal</option>
                <option className="bg-slate-900 text-white text-[16px]">Premium Tatkal</option>
                <option className="bg-slate-900 text-white text-[16px]">Ladies</option>
                <option className="bg-slate-900 text-white text-[16px]">Lower Berth/Sr. Citizen</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
            </div>
          </div>

          {/* Extra Options */}
          <div className="py-6 space-y-5">
            {[
              { id: 'flexible', label: 'Flexible with Date' },
              { id: 'concession', label: 'Railway Pass Concession' },
              { id: 'disability', label: 'Person with Disability' }
            ].map((opt) => (
              <label key={opt.id} className="flex items-center gap-5 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={options[opt.id]}
                    onChange={(e) => setOptions({...options, [opt.id]: e.target.checked})}
                    className="sr-only"
                  />
                  <div className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${options[opt.id] ? 'bg-blue-600 border-blue-600' : 'border-white/10 group-hover:border-blue-500'}`}>
                    {options[opt.id] && <CheckSquare size={20} className="text-white" />}
                  </div>
                </div>
                <span className="text-[20px] font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="h-20 w-full bg-orange-gradient hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] disabled:opacity-50 text-white font-black text-[24px] rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 mt-10 overflow-hidden relative group tracking-[0.1em] uppercase"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>SEARCHING...</span>
              </div>
            ) : (
              <>
                <Search size={28} className="group-hover:rotate-12 transition-transform" />
                <span>SEARCH TRAINS</span>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCard;
