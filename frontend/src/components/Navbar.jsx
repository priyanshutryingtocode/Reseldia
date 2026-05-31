import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const isAdmin = localStorage.getItem('role') === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAdmin || !token) return;

    const fetchPendingCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/pending`, {
          headers: { Authorization: token }
        });
        setPendingCount(res.data.length);
      } catch {
        console.error("Failed to fetch badge count");
      }
    };

    fetchPendingCount();
  }, [API_URL, isAdmin, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navLinkClass = "text-gray-400 hover:text-white text-xs tracking-[0.18em] uppercase transition-colors";
  const mobileLinkClass = "block text-gray-400 hover:text-white py-3 text-xs tracking-widest uppercase";

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0c0f]/78 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="group flex items-center gap-2">
              <span className="font-serif-display text-2xl text-white tracking-wide">
                <span className="italic opacity-70 group-hover:opacity-100 transition-opacity">Re</span>seldia
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-7">
            <Link to="/dashboard" className={navLinkClass}>Events</Link>

            {isAdmin && (
              <Link to="/admin" className="relative group">
                <div className="surface-soft text-white px-4 py-2 rounded-md text-xs tracking-widest uppercase hover:bg-white/10 transition flex items-center gap-2">
                  Admin
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {pendingCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            <Link to="/create" className="bg-white text-black px-5 py-2 rounded-md text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
              New Event
            </Link>

            <Link to="/profile" className={navLinkClass}>Profile</Link>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-10 w-10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors flex items-center justify-center"
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#0b0c0f]/95 border-b border-white/10 backdrop-blur-xl">
          <div className="px-4 pt-3 pb-5 space-y-1">
            <Link to="/dashboard" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Events</Link>
            {isAdmin && (
              <Link to="/admin" className="block text-indigo-300 hover:text-indigo-200 py-3 text-xs tracking-widest uppercase" onClick={() => setIsMenuOpen(false)}>
                Admin ({pendingCount})
              </Link>
            )}
            <Link to="/create" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Create Event</Link>
            <Link to="/profile" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Profile</Link>
            <button onClick={handleLogout} className="block w-full text-left text-red-400 hover:text-red-300 py-3 text-xs tracking-widest uppercase">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}
