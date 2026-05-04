import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CustomDatePicker = ({ selectedDate, onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  // Fill empty slots for previous month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  
  // Fill days of the month
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }
  
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    const sDate = new Date(selectedDate);
    return date.getDate() === sDate.getDate() && 
           date.getMonth() === sDate.getMonth() && 
           date.getFullYear() === sDate.getFullYear();
  };

  const isInvalid = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 2);
    
    return date < today || date > maxDate;
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <CalendarIcon size={28} />
            </div>
            <div>
              <h3 className="text-[22px] font-black text-slate-900 uppercase italic tracking-tight">Select Travel Date</h3>
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">Book your journey</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-200/50 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl transition-all flex items-center justify-center">
            <X size={24} />
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="px-10 py-8 flex items-center justify-between">
          <button onClick={prevMonth} className="p-4 hover:bg-slate-100 rounded-xl transition-all text-slate-600">
            <ChevronLeft size={28} />
          </button>
          <h4 className="text-[22px] font-black text-slate-900 uppercase italic tracking-wider">
            {monthNames[month]} {year}
          </h4>
          <button onClick={nextMonth} className="p-4 hover:bg-slate-100 rounded-xl transition-all text-slate-600">
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-10 pb-12">
          <div className="grid grid-cols-7 gap-3 mb-6">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[13px] font-black text-slate-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-3">
            {days.map((date, idx) => (
              <div key={idx} className="aspect-square flex items-center justify-center">
                {date ? (
                  <button
                    disabled={isInvalid(date)}
                    onClick={() => {
                      const formattedDate = date.toISOString().split('T')[0];
                      onSelect(formattedDate);
                    }}
                    className={`w-full h-full rounded-2xl text-[18px] font-black transition-all flex flex-col items-center justify-center gap-1
                      ${isSelected(date) 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40 scale-110 z-10' 
                        : isInvalid(date)
                        ? 'text-slate-200 cursor-not-allowed opacity-50'
                        : isToday(date)
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-100'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 border-2 border-transparent'
                      }
                    `}
                  >
                    <span>{date.getDate()}</span>
                    {isToday(date) && <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Bookings allowed within <span className="text-blue-600">2 months</span> only
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomDatePicker;
