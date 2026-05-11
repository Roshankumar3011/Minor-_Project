import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trainApi } from '../api/api';
import { Train as TrainIcon, Clock, ArrowLeft, Filter, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { formatTime } from '../utils/dateUtils';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trains, setTrains] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState({});
  const [error, setError] = useState(null);

  // Parse query params
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const travelClass = searchParams.get('travelClass');
  const quota = searchParams.get('quota');

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await trainApi.search(from, to, date);
        setTrains(response.data);
      } catch (err) {
        console.error("Search API Failure:", err);
        setError("Failed to connect to the server. Please check your internet connection or try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (from && to && date) {
      fetchTrains();
    } else {
      setLoading(false);
    }
  }, [from, to, date]);

  const handleBookNow = (train) => {
    const classType = selectedClasses[train.id];
    if (!classType) {
      alert('Please select a class first');
      return;
    }
    navigate(`/book/${train.id}?date=${date}&from=${from}&to=${to}&class=${classType}`);
  };

  return (
    <div className="min-h-screen bg-[#111827] pt-40 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header / Modify Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <ArrowLeft className="text-white group-hover:-translate-x-1 transition-transform" size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 text-white font-black text-2xl uppercase tracking-tight">
                <span>{from}</span>
                <ChevronRight size={22} className="text-slate-600" />
                <span>{to}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-[16px] font-bold mt-2">
                <span className="flex items-center gap-2"><Calendar size={18} /> {date}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span>{travelClass}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span>{quota}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[16px] rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <Filter size={20} />
            MODIFY SEARCH
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 text-lg font-bold animate-pulse">Fetching the best trains for you...</p>
            </div>
          ) : error ? (
            <div className="bg-slate-900/40 backdrop-blur-xl p-20 rounded-[40px] border border-red-500/20 text-center">
               <p className="text-red-400 font-bold uppercase tracking-widest">{error}</p>
               <button 
                 onClick={() => window.location.reload()}
                 className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
               >
                 Try Again
               </button>
            </div>
          ) : trains.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl p-20 rounded-[40px] border border-white/5 text-center">
               <p className="text-slate-500 font-bold uppercase tracking-widest">No trains found for this route.</p>
            </div>
          ) : (
            trains.map((train) => (
              <div key={train.id} className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden hover:border-blue-500/20 transition-all shadow-xl group">
                <div className="p-8 md:p-10">
                  {/* Train Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <TrainIcon size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">{train.name}</h3>
                        <div className="flex items-center gap-3 text-[16px] text-slate-500 font-black mt-2">
                          <span className="bg-white/5 px-3 py-1 rounded text-blue-400">#{train.trainNumber}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                          <span className="flex items-center gap-2"><Clock size={18} className="text-slate-700" /> Runs Daily</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10 px-8 py-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-center">
                        <p className="text-4xl font-black text-white">{formatTime(train.departureTime)}</p>
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mt-2">{train.source}</p>
                      </div>
                      <div className="flex flex-col items-center min-w-[140px]">
                        <p className="text-[12px] font-black text-blue-400/60 uppercase tracking-widest mb-3">DURATION</p>
                        <div className="w-full h-[3px] bg-slate-800 relative">
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-black text-white">{formatTime(train.arrivalTime)}</p>
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mt-2">{train.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Class Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {train.seatConfigs?.map((config) => {
                      const availability = config.availableSeats;
                      const isSelected = selectedClasses[train.id] === config.classType;
                      const isFull = (availability || 0) <= 0;
                      
                      return (
                        <div 
                          key={config.classType}
                          onClick={() => !isFull && setSelectedClasses({ ...selectedClasses, [train.id]: config.classType })}
                          className={`p-6 rounded-[24px] border-2 transition-all cursor-pointer relative overflow-hidden group/class ${
                            isSelected 
                            ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-600/30' 
                            : isFull
                            ? 'bg-white/5 border-transparent opacity-50 cursor-not-allowed'
                            : 'bg-white/5 border-transparent hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-[14px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                              {config.classType}
                            </span>
                            <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-white'}`}>₹{config.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-[14px] font-black ${isSelected ? 'text-blue-100' : (isFull ? 'text-red-400' : 'text-emerald-400')}`}>
                              {isFull ? 'Waitlist' : `Available ${availability || 0}`}
                            </p>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Book Button */}
                  <div className="mt-10 flex justify-end">
                    <button 
                      onClick={() => handleBookNow(train)}
                      className={`h-16 px-16 font-black text-[16px] uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 ${
                        !selectedClasses[train.id]
                        ? 'bg-white/5 text-slate-700 cursor-not-allowed' 
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30'
                      }`}
                    >
                      Book Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
