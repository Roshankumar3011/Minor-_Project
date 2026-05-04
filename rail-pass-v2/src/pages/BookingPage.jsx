import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { trainApi, bookingApi } from '../api/api';
import { Train as TrainIcon, User, Users, Calendar, ArrowRight, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';

const BookingPage = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [addNominee, setAddNominee] = useState(false);

  // Read from query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialDate = queryParams.get('date') || new Date().toISOString().split('T')[0];
  const initialClass = queryParams.get('class') || 'SL';

  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: 'Male' }
  ]);

  const [nominee, setNominee] = useState({
    name: '',
    age: '',
    gender: 'Female'
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await trainApi.getById(trainId, initialDate);
        if (response.data) {
          setTrain(response.data);
        } else {
          setError("The train details could not be found.");
        }
      } catch (err) {
        console.error("Failed to fetch train details:", err);
        const msg = err.response?.data || err.message || "Connection failed to backend.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (trainId) {
      fetchTrain();
    } else {
      setLoading(false);
      setError("No Train ID provided in URL.");
    }
  }, [trainId, initialDate]);

  const addPassenger = () => {
    if (passengers.length >= 6) {
      alert("Maximum 6 passengers allowed per booking.");
      return;
    }
    setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) return;
    const newPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(newPassengers);
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const calculateTotalFare = () => {
    if (!train) return 0;
    const classConfig = train.seatConfigs?.find(c => c.classType === initialClass);
    const baseFare = classConfig?.price || 0;
    return baseFare * passengers.length;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (passengers.some(p => !p.name || !p.age || parseInt(p.age) <= 0)) {
      setError("Please fill in all passenger details correctly. Age must be a positive number.");
      return;
    }

    if (addNominee && (!nominee.name || !nominee.age)) {
      setError("Please fill in all nominee details.");
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      // Format date from YYYY-MM-DD to DD-MM-YYYY for backend
      const dateParts = initialDate.split('-');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const payload = {
        userId: user.id,
        trainId: parseInt(trainId),
        passengers: passengers.map(p => ({
          ...p,
          age: parseInt(p.age)
        })),
        nomineeName: addNominee ? nominee.name : '',
        nomineeAge: addNominee ? (nominee.age ? parseInt(nominee.age) : null) : null,
        nomineeGender: addNominee ? nominee.gender : '',
        journeyDate: formattedDate,
        classType: initialClass
      };
      
      console.log("Sending Booking Payload:", payload);
      
      const response = await bookingApi.book(payload);
      alert(`Booking Successful! PNR: ${response.data.pnr}`);
      navigate('/dashboard');
    } catch (error) {
      console.error("Booking failed:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Booking failed. Please try again.";
      
      if (error.response?.status === 403) {
        setError(`Access Denied (403): ${typeof errorMsg === 'string' ? errorMsg : 'You might not have permission to book tickets or your session has expired.'}`);
      } else {
        setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error || !train) return (
    <div className="min-h-screen bg-[#111827] pt-32 px-4 flex flex-col items-center">
      <div className="bg-slate-900 p-12 rounded-3xl border border-white/5 text-center max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-4">{error || "Train Not Found"}</h2>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Back to Search</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111827] pt-40 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <TrainIcon size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">{train.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Train No: {train.trainNumber} • {initialClass} Class</p>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <p className={`text-xs font-black uppercase tracking-widest ${
                (train.seatConfigs?.find(c => c.classType === initialClass)?.availableSeats || 0) > 0 
                ? 'text-emerald-400' 
                : 'text-red-400'
              }`}>
                {(train.seatConfigs?.find(c => c.classType === initialClass)?.availableSeats || 0) > 0 
                  ? `Available: ${train.seatConfigs?.find(c => c.classType === initialClass)?.availableSeats}` 
                  : 'Waitlist'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Passenger Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-black text-blue-500 uppercase tracking-widest text-sm">
                  <User size={18} /> PASSENGER DETAILS
                </h3>
                <button 
                  type="button"
                  onClick={addPassenger}
                  className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 px-4 py-2 rounded-xl text-xs font-black transition-all border border-blue-500/20"
                >
                  <Plus size={16} /> ADD PASSENGER
                </button>
              </div>

              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <div key={index} className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative">
                    {passengers.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="absolute top-6 right-6 text-slate-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-500">
                        {index + 1}
                      </span>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Passenger {index + 1}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                        <input 
                          required
                          type="text" 
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          placeholder="Enter passenger name"
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 outline-none focus:border-blue-500 transition-all text-white font-medium"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Age</label>
                        <input 
                          required
                          type="number" 
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          placeholder="Age"
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 outline-none focus:border-blue-500 transition-all text-white font-medium"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                        <select 
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className="w-full h-12 bg-slate-800 border border-white/20 rounded-xl px-5 outline-none focus:border-blue-500 transition-all text-white font-medium cursor-pointer appearance-none shadow-lg"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em' }}
                        >
                          <option value="Male" className="bg-slate-900 text-white">Male</option>
                          <option value="Female" className="bg-slate-900 text-white">Female</option>
                          <option value="Other" className="bg-slate-900 text-white">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nominee Section */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-purple-500" />
                  <div>
                    <h3 className="font-black text-white text-xs uppercase tracking-widest">Add Nominee</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Optional backup for seat replacement</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={addNominee}
                    onChange={(e) => setAddNominee(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {addNominee && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                  <div className="md:col-span-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nominee Name</label>
                    <input 
                      required={addNominee}
                      type="text" 
                      value={nominee.name}
                      onChange={(e) => setNominee({...nominee, name: e.target.value})}
                      placeholder="Nominee name"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 outline-none focus:border-blue-500 transition-all text-white font-medium"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Age</label>
                    <input 
                      required={addNominee}
                      type="number" 
                      value={nominee.age}
                      onChange={(e) => setNominee({...nominee, age: e.target.value})}
                      placeholder="Age"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 outline-none focus:border-blue-500 transition-all text-white font-medium"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                    <select 
                      value={nominee.gender}
                      onChange={(e) => setNominee({...nominee, gender: e.target.value})}
                      className="w-full h-12 bg-slate-800 border border-white/20 rounded-xl px-5 outline-none focus:border-blue-500 transition-all text-white font-medium cursor-pointer appearance-none shadow-lg"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em' }}
                    >
                      <option value="Male" className="bg-slate-900 text-white">Male</option>
                      <option value="Female" className="bg-slate-900 text-white">Female</option>
                      <option value="Other" className="bg-slate-900 text-white">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button 
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
            >
              {bookingLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  CONFIRM AND PAY
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8 pb-4 border-b border-white/5">Booking Summary</h4>
              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{train.source}</p>
                      <p className="text-xl font-black text-white">{new Date(train.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <ArrowRight className="text-blue-500/40" size={16} />
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{train.destination}</p>
                      <p className="text-xl font-black text-white">{new Date(train.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Travel Date</p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      {formatDate(initialDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Class Type</p>
                    <p className="text-sm font-bold text-white">{initialClass}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Passengers</p>
                  <p className="text-sm font-bold text-white">{passengers.length}</p>
                </div>
                <div className="mt-8 bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Fare</span>
                    <p className="text-4xl font-black text-white tracking-tighter">
                      <span className="text-xl mr-1 font-bold">₹</span>
                      {calculateTotalFare()}
                    </p>
                  </div>
                  <p className="text-[8px] font-bold text-slate-600 mt-2 uppercase tracking-widest">*Including all taxes and fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
