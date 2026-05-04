import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { bookingApi } from '../api/api';
import { Printer, Download, ArrowLeft, Train, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

const TicketView = () => {
  const { pnr } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await bookingApi.getByPnr(pnr);
        setBooking(response.data);
      } catch (error) {
        console.error("Failed to fetch ticket:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.open(`http://localhost:8081/api/bookings/ticket/pdf/${pnr}`, '_blank');
  };

  if (loading) return <div className="pt-40 text-center text-slate-400 animate-pulse font-medium">Generating ticket details...</div>;
  if (!booking) return (
    <div className="pt-40 text-center space-y-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
        <Train size={32} />
      </div>
      <p className="text-xl font-bold text-slate-800">Ticket not found.</p>
      <Link to="/dashboard" className="text-blue-600 font-bold hover:underline">Back to Bookings</Link>
    </div>
  );

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Controls - Hidden on Print */}
        <div className="flex justify-between items-center print:hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all font-black uppercase text-sm tracking-widest">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex gap-4">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] uppercase text-xs tracking-widest"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest"
            >
              <Printer size={20} />
              <span>Print Ticket</span>
            </button>
          </div>
        </div>

        {/* Ticket Container */}
        <div ref={ticketRef} className="bg-white text-black p-10 md:p-16 shadow-2xl rounded-[4px] print:shadow-none print:m-0 print:p-6 border-t-[12px] border-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-12 relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">INDIAN RAILWAYS</h1>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Electronic Reservation Slip (RailPass Connect)</p>
            </div>
            <div className="text-right space-y-2">
              <div className="bg-blue-800 text-white px-4 py-1.5 rounded font-black text-sm uppercase tracking-widest">e-Ticket</div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">PNR: <span className="text-slate-900 text-lg font-mono ml-2">{booking.pnr}</span></p>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12 relative z-10">
            <div className="space-y-2">
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Train Name</p>
              <p className="font-black text-lg text-slate-900">{booking.train.name}</p>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">#{booking.train.trainNumber}</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Class / Quota</p>
              <p className="font-black text-lg text-slate-900">{booking.classType}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">General (GN)</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Booking Date</p>
              <p className="font-black text-lg text-slate-900">{formatDate(booking.bookingDate)}</p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Status</p>
              <span className={`inline-block font-black text-sm uppercase tracking-widest px-4 py-1.5 rounded-lg ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Journey Path */}
          <div className="bg-slate-50 border-2 border-slate-100 p-10 rounded-[32px] mb-12 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em]">Source Station</p>
                <h3 className="text-3xl font-black text-slate-900 italic">{booking.train.source}</h3>
                <p className="text-sm font-black text-slate-400 uppercase">DEP: {new Date(booking.train.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              
              <div className="flex flex-col items-center px-12 flex-1">
                <div className="w-full h-1 bg-slate-200 relative rounded-full">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                    <Train size={24} className="text-slate-900" />
                  </div>
                </div>
                <p className="text-xs font-black text-slate-900 mt-8 uppercase tracking-[0.3em] bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100">
                  {formatDate(booking.journeyDate)}
                </p>
              </div>

              <div className="text-right space-y-3">
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em]">Destination Station</p>
                <h3 className="text-3xl font-black text-slate-900 italic">{booking.train.destination}</h3>
                <p className="text-sm font-black text-slate-400 uppercase">ARR: {new Date(booking.train.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          </div>

          {/* Passenger Table */}
          <div className="mb-12">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Passenger Manifest</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="py-4 px-2">SNo.</th>
                  <th className="py-4 px-6">Passenger Name</th>
                  <th className="py-4 px-6">Age / Gender</th>
                  <th className="py-4 px-6">Coach / Berth</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(booking.passengers || []).map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-100 font-bold hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-6 px-6 text-slate-900 uppercase tracking-tight">{p.name}</td>
                    <td className="py-6 px-6 text-slate-600">{p.age} / {p.gender}</td>
                    <td className="py-6 px-6 text-slate-900">B{Math.floor(Math.random() * 5) + 1} / {Math.floor(Math.random() * 60) + 1} / LB</td>
                    <td className="py-6 px-6 text-right">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-200 px-2 py-1 rounded">Confirmed</span>
                    </td>
                  </tr>
                ))}
                {booking.isReplaced && booking.nominee && (
                   <tr className="border-b border-slate-100 font-bold bg-purple-50/30">
                    <td className="py-6 px-2 text-purple-400">*</td>
                    <td className="py-6 px-6 text-purple-900 uppercase tracking-tight">
                      {booking.nominee.name}
                      <span className="block text-[8px] font-black uppercase mt-1">(Active Nominee)</span>
                    </td>
                    <td className="py-6 px-6 text-purple-600">{booking.nominee.age} / {booking.nominee.gender}</td>
                    <td className="py-6 px-6 text-purple-900">REPLACED</td>
                    <td className="py-6 px-6 text-right">
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-200 px-2 py-1 rounded">Active</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Fare Section */}
          <div className="flex justify-end mb-16 relative z-10">
            <div className="bg-slate-900 text-white p-10 rounded-[32px] min-w-[350px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex justify-between items-center mb-6 opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">
                <span>Total Amount Paid</span>
                <ShieldCheck size={16} />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-black opacity-60">INR</span>
                <span className="text-5xl font-black tracking-tighter">₹{booking.fare}.00</span>
              </div>
              <p className="text-[9px] font-black text-slate-500 mt-6 uppercase tracking-widest text-right">Digital Payment Verified</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t-2 border-slate-100 pt-12 grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-900">
                <ShieldCheck size={20} />
                <h5 className="font-black text-xs uppercase tracking-widest">Critical Instructions</h5>
              </div>
              <ul className="text-[10px] space-y-3 text-slate-500 font-bold list-disc pl-6 leading-relaxed">
                <li className="uppercase tracking-tight">E-ticket is valid only with original Government ID proof.</li>
                <li>Please carry photo ID (Aadhaar, Voter ID, PAN) for all passengers listed.</li>
                <li>Reach station 30 mins before scheduled departure.</li>
                {booking.isReplaced && <li className="text-purple-600">Replacement Notice: Passenger list updated via registered nominee protocol.</li>}
              </ul>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-900">
                <Phone size={20} />
                <h5 className="font-black text-xs uppercase tracking-widest">Connect with Support</h5>
              </div>
              <div className="space-y-4 text-[10px] font-black text-slate-600">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Mail size={14} />
                  </div>
                  <span className="tracking-widest">SUPPORT@RAILPASS.COM</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Phone size={14} />
                  </div>
                  <span className="tracking-widest">1800-419-5555 (TOLL FREE)</span>
                </div>
                <p className="mt-8 pt-8 border-t border-slate-50 text-[9px] uppercase tracking-[0.5em] text-slate-300 text-center">HAPPY JOURNEY • RAILPASS CONNECT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
