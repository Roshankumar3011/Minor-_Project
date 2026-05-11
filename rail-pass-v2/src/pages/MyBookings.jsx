import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/api';
import { Ticket, Train as TrainIcon, Calendar, MapPin, XCircle, UserPlus, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, parseDate, formatTime } from '../utils/dateUtils';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedBookingForReplace, setSelectedBookingForReplace] = useState(null);
  const [selectedPassengerId, setSelectedPassengerId] = useState(null);

  const [showCancelPassengerModal, setShowCancelPassengerModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelPassengerId, setCancelPassengerId] = useState(null);

  // Consolidate all loading logic into a single robust useEffect
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      console.log("MyBookings: Initializing page...");
      
      // Safety timeout: if after 10 seconds we are still loading, force stop
      const timeout = setTimeout(() => {
        if (mounted && loading) {
          console.warn("MyBookings: Loading timeout reached, forcing completion.");
          setLoading(false);
        }
      }, 10000);

      if (!user) {
        console.log("MyBookings: No user found, waiting for auth...");
        return;
      }

      await fetchBookings();
      
      if (mounted) {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => {
          clearInterval(timer);
          clearTimeout(timeout);
        };
      }
    };

    initialize();
    return () => { mounted = false; };
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.id) {
      console.error("MyBookings: Cannot fetch bookings, user ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("MyBookings: Fetching bookings for user:", user.id);
      const response = await bookingApi.getHistory(user.id);
      console.log("MyBookings: Data received:", response.data);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("MyBookings: API Error:", error);
      const message = error.response?.data?.message || "Failed to sync travel history. Please verify your connection.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-[#111827]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Ticket className="text-indigo-600 animate-pulse" size={32} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-white italic tracking-tighter uppercase">Syncing Bookings</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">Retrieving Digital Travel Passes...</p>
        </div>
      </div>
    );
  }

  const getHoursUntilDeparture = (journeyDate, departureTime) => {
    const jDate = parseDate(journeyDate);
    const dTime = new Date(departureTime);
    
    // Combine date from journeyDate and time from departureTime
    const combined = new Date(
      jDate.getFullYear(),
      jDate.getMonth(),
      jDate.getDate(),
      dTime.getHours(),
      dTime.getMinutes(),
      dTime.getSeconds()
    );
    
    return (combined - currentTime) / (1000 * 60 * 60);
  };


  const handleCancel = async (pnr) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.cancel(pnr);
      alert("Ticket cancelled successfully.");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data || "Cancellation failed.");
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
    const otp = prompt("Enter OTP (Use 123456 for demo):");
    if (!otp) return;
    try {
      const response = await bookingApi.replace({ 
        pnr: selectedBookingForReplace.pnr, 
        otp, 
        passengerId: selectedPassengerId 
      });
      alert(response.data);
      setShowReplaceModal(false);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data || "Replacement failed.");
    }
  };

  const handleCancelPassengerClick = (booking) => {
    setSelectedBookingForCancel(booking);
    setShowCancelPassengerModal(true);
    setCancelPassengerId(null);
  };

  const handleConfirmCancelPassenger = async () => {
    if (!cancelPassengerId) {
      alert("Please select a passenger to cancel.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to cancel this passenger? This action cannot be undone.")) return;

    try {
      await bookingApi.cancelPassenger(selectedBookingForCancel.pnr, cancelPassengerId);
      alert("Passenger cancelled successfully.");
      setShowCancelPassengerModal(false);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data || "Cancellation failed.");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const journeyDate = parseDate(b.journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const journeyDay = new Date(journeyDate);
    journeyDay.setHours(0, 0, 0, 0);

    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    if (b.status === 'CANCELLED') return false; 

    if (activeTab === 'upcoming') {
      return journeyDay > today;
    }
    
    if (activeTab === 'past') {
      return journeyDay <= today || b.status === 'COMPLETED';
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-[#111827] pt-40 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">My <span className="text-blue-500">Bookings</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs mt-3 border-l-4 border-blue-600 pl-4">Manage your system reservations / Travel History</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl mb-8 text-center">
            <p className="text-red-400 font-bold uppercase tracking-widest text-xs">{error}</p>
            <button onClick={fetchBookings} className="mt-4 text-white bg-red-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-slate-900/40 backdrop-blur-xl p-20 rounded-[40px] border border-white/5 text-center">
            <Ticket className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No {activeTab} bookings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden hover:border-blue-500/20 transition-all shadow-xl">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/10 shadow-inner">
                        <TrainIcon size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-3xl font-black text-white italic uppercase tracking-tight leading-none">{booking.train?.name || 'Unknown Train'}</h3>
                          <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest border border-white/5 italic ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                          PNR: <span className="text-blue-400">#{booking.pnr}</span> • {booking.train?.trainNumber || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-14 bg-white/5 px-10 py-7 rounded-[32px] border border-white/5 shadow-inner">
                      <div className="text-center">
                        <p className="text-3xl font-black text-white italic">{formatTime(booking.train?.departureTime) || '--:--'}</p>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{booking.train?.source || 'N/A'}</p>
                      </div>
                      <div className="text-center text-slate-700 px-4">
                        <ArrowRight size={20} className="text-blue-600/40" />
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-white italic">{formatTime(booking.train?.arrivalTime) || '--:--'}</p>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{booking.train?.destination || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 lg:justify-end">
                      {activeTab === 'upcoming' && (
                        <>
                          <button 
                            onClick={() => handleCancel(booking.pnr)}
                            className="p-3 bg-white/5 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-white/5 text-slate-400"
                            title="Cancel Full Ticket"
                          >
                            <XCircle size={22} />
                          </button>
                          {booking.passengers && booking.passengers.filter(p => p.status !== 'CANCELLED').length > 1 && (
                            <button 
                              onClick={() => handleCancelPassengerClick(booking)}
                              className="p-3 bg-white/5 hover:bg-orange-600 hover:text-white rounded-xl transition-all border border-white/5 text-slate-400"
                              title="Cancel Single Passenger"
                            >
                              <User size={22} className="text-orange-500 group-hover:text-white" />
                            </button>
                          )}
                          {booking.nominee && !booking.isReplaced && getHoursUntilDeparture(booking.journeyDate, booking.train.departureTime) >= 15 && (
                            <button 
                              onClick={() => handleReplaceClick(booking)}
                              className="p-3 bg-white/5 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-white/5 text-slate-400"
                              title="Replace Passenger"
                            >
                              <UserPlus size={22} />
                            </button>
                          )}
                        </>
                      )}
                      <button 
                        onClick={() => navigate(`/ticket/${booking.pnr}`)}
                        className="bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-4 rounded-2xl text-sm font-black transition-all shadow-2xl uppercase tracking-widest active:scale-95 border border-white/10"
                      >
                        View Ticket
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/2 px-10 py-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Calendar size={18} className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-widest">{formatDate(booking.journeyDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <MapPin size={18} className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-widest">{booking.classType} Class</span>
                    </div>
                    <div className="text-xl font-black text-white italic tracking-tight">
                      ₹{booking.fare}
                    </div>
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Authorized Traveler: <span className="text-white bg-blue-600/10 px-3 py-1 rounded-lg border border-blue-600/20">{booking.isReplaced ? booking.nominee.name : (booking.passengers && booking.passengers.length > 0 ? booking.passengers[0].name + (booking.passengers.length > 1 ? ` +${booking.passengers.length - 1} more` : '') : 'N/A')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replacement Modal */}
      {showReplaceModal && selectedBookingForReplace && selectedBookingForReplace.nominee && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowReplaceModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Replace Passenger</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Select one traveler to be replaced by nominee</p>
              </div>
              <button onClick={() => setShowReplaceModal(false)} className="text-slate-500 hover:text-white transition-all"><XCircle size={32} /></button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex items-center gap-6">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <UserPlus size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Incoming Nominee</p>
                  <p className="text-xl font-black text-white italic uppercase">{selectedBookingForReplace.nominee.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest border-l-4 border-blue-600 pl-4">Select Passenger to Replace</p>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedBookingForReplace.passengers?.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPassengerId(p.id)}
                      className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                        selectedPassengerId === p.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedPassengerId === p.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                          <User size={20} />
                        </div>
                        <div className="text-left">
                          <p className={`text-lg font-black uppercase italic ${selectedPassengerId === p.id ? 'text-white' : 'text-slate-200'}`}>{p.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{p.gender} • {p.age} Years</p>
                        </div>
                      </div>
                      {selectedPassengerId === p.id && <CheckCircle2 size={24} className="text-white animate-scale-in" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-950/50 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleConfirmReplace}
                disabled={!selectedPassengerId}
                className={`flex-[2] py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  selectedPassengerId 
                  ? 'bg-white text-black hover:bg-blue-600 hover:text-white' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Confirm Replacement
              </button>
              <button 
                onClick={() => setShowReplaceModal(false)}
                className="flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cancel Passenger Modal */}
      {showCancelPassengerModal && selectedBookingForCancel && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowCancelPassengerModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Cancel <span className="text-orange-500">Passenger</span></h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Select one traveler to cancel from this booking</p>
              </div>
              <button onClick={() => setShowCancelPassengerModal(false)} className="text-slate-500 hover:text-white transition-all"><XCircle size={32} /></button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest border-l-4 border-orange-600 pl-4">Confirmed Passengers</p>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedBookingForCancel.passengers?.filter(p => p.status !== 'CANCELLED').map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCancelPassengerId(p.id)}
                      className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                        cancelPassengerId === p.id 
                        ? 'bg-orange-600 border-orange-500 text-white shadow-xl shadow-orange-600/20' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cancelPassengerId === p.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                          <User size={20} />
                        </div>
                        <div className="text-left">
                          <p className={`text-lg font-black uppercase italic ${cancelPassengerId === p.id ? 'text-white' : 'text-slate-200'}`}>{p.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{p.gender} • {p.age} Years</p>
                        </div>
                      </div>
                      {cancelPassengerId === p.id && <CheckCircle2 size={24} className="text-white animate-scale-in" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-950/50 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleConfirmCancelPassenger}
                disabled={!cancelPassengerId}
                className={`flex-[2] py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  cancelPassengerId 
                  ? 'bg-white text-black hover:bg-orange-600 hover:text-white' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Cancel Passenger
              </button>
              <button 
                onClick={() => setShowCancelPassengerModal(false)}
                className="flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
