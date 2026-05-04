import React from 'react';
import SearchCard from '../components/SearchCard';

const Home = () => {
  return (
    <main className="relative min-h-screen pt-40 flex flex-col md:flex-row overflow-hidden bg-[#111827]">
      {/* Left side: Booking form card */}
      <div className="w-full md:w-[50%] lg:w-[45%] p-8 md:p-16 z-10 flex flex-col justify-center bg-[#111827] shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="max-w-xl mx-auto w-full relative z-10">
          <div className="mb-8">
            <h1 className="text-[32px] md:text-[36px] font-black text-white tracking-tight mb-3 uppercase italic">Book Ticket</h1>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/5 text-slate-400 px-3 py-1 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                LIVE TRACKING
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">
                E-TICKETING
              </span>
            </div>
          </div>
          <SearchCard />
        </div>
      </div>

      {/* Right side: Train background image */}
      <div className="hidden md:block md:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/50 to-transparent z-10"></div>
        <img 
          src="/train-bg.png" 
          alt="Vande Bharat Train" 
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-[10s] ease-linear"
        />
        <div className="absolute bottom-12 right-12 z-20 text-right">
          <h2 className="text-white text-5xl font-black italic drop-shadow-2xl mb-2">VANDE BHARAT</h2>
          <p className="text-white/60 font-bold tracking-widest uppercase drop-shadow-lg">Experience the future of Indian Railways</p>
        </div>
      </div>
    </main>
  );
};

export default Home;
