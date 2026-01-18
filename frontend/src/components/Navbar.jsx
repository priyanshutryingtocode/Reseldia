import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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
  }, [location.pathname]);

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
    <nav className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="group flex items-center gap-2">
              <span className="font-serif-display text-2xl text-white tracking-wide">
                <span className="italic opacity-70 group-hover:opacity-100 transition-opacity">Re</span>seldia
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-400 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors">
              Events
            </Link>
            
            {/* Admin Badge */}
            {isAdmin && (
              <Link to="/admin" className="relative group">
                <div className="bg-white/5 text-white px-4 py-1.5 border border-white/10 text-xs tracking-widest uppercase hover:bg-white/10 transition flex items-center gap-2">
                  Admin Panel
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      {pendingCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            <Link to="/create" className="bg-white text-black px-5 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
              + New Event
            </Link>
            
            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
              <span className="text-lg">👤</span>
            </Link>

            <button 
              onClick={handleLogout} 
              className="text-gray-500 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0a0a0c] border-b border-white/10 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/dashboard" className="block text-gray-400 hover:text-white py-2 text-xs tracking-widest uppercase">Events</Link>
            {isAdmin && (
              <Link to="/admin" className="block text-indigo-300 hover:text-indigo-200 py-2 text-xs tracking-widest uppercase">
                Admin Panel ({pendingCount})
              </Link>
            )}
            <Link to="/create" className="block text-gray-400 hover:text-white py-2 text-xs tracking-widest uppercase">Create Event</Link>
            <Link to="/profile" className="block text-gray-400 hover:text-white py-2 text-xs tracking-widest uppercase">Profile</Link>
            <button onClick={handleLogout} className="block w-full text-left text-red-400 hover:text-red-300 py-2 text-xs tracking-widest uppercase">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}