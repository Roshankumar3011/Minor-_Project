import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import TicketView from './pages/TicketView';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <Router>
      <div className="min-h-screen flex flex-col bg-[#111827] text-white selection:bg-blue-500/40 font-sans">
        {/* Background Gradient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[140px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[140px]"></div>
        </div>

        <Navbar />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/book/:trainId" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/ticket/:pnr" element={
              <ProtectedRoute>
                <TicketView />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-10 text-center text-slate-400 text-xs border-t border-slate-200 shrink-0">
          <p>© 2026 RailPass Connect. Premium Railway Ticketing System.</p>
        </footer>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
