import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Used to trigger re-renders on route change
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (role === 'admin') {
      setIsAdmin(true);
      fetchPendingCount(token);
    }
  }, [location.pathname]); // Re-check when changing pages

  const fetchPendingCount = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/events/pending`, {
        headers: { Authorization: token }
      });
      setPendingCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch badge count");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">📌</span>
              <span className="font-bold text-xl text-gray-800 tracking-tight">Community<span className="text-blue-600">Board</span></span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">Events</Link>
            
            {/* Admin Badge Button */}
            {isAdmin && (
              <Link to="/admin" className="relative group">
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-2">
                  🛡️ Admin
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium text-sm">
              + New Event
            </Link>
            
            <Link to="/profile" className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
              👤
            </Link>

            <button 
              onClick={handleLogout} 
              className="text-gray-500 hover:text-red-600 font-medium text-sm transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Events</Link>
            {isAdmin && <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">Admin Panel ({pendingCount})</Link>}
            <Link to="/create" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Create Event</Link>
            <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Profile</Link>
            <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}