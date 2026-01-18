import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [myJoinedEvents, setMyJoinedEvents] = useState([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [user, setUser] = useState(null);
  
  // --- NEW STATES FOR MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestList, setGuestList] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [currentEventTitle, setCurrentEventTitle] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: token } };
        
        const userRes = await axios.get(`${API_URL}/api/auth/me`, config);
        setUser(userRes.data);

        const joinedRes = await axios.get(`${API_URL}/api/events/my-events`, config);
        setMyJoinedEvents(joinedRes.data);

        const createdRes = await axios.get(`${API_URL}/api/events/created-by-me`, config);
        setMyCreatedEvents(createdRes.data);

      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate, API_URL]);

  // --- NEW HANDLER FOR MODAL ---
  const handleViewAttendees = async (eventId, title) => {
    setIsModalOpen(true);
    setLoadingGuests(true);
    setCurrentEventTitle(title);
    setGuestList([]); // Clear previous list

    const token = localStorage.getItem('token');
    try {
        const res = await axios.get(`${API_URL}/api/events/${eventId}/attendees`, {
            headers: { Authorization: token }
        });
        setGuestList(res.data);
    } catch (err) {
        console.error("Failed to fetch list");
    } finally {
        setLoadingGuests(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'approved': return <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded-full">Live</span>;
        case 'rejected': return <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-widest uppercase rounded-full">Rejected</span>;
        default: return <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold tracking-widest uppercase rounded-full animate-pulse">Pending</span>;
    }
  };

  if (!user) return <div className="text-center mt-20 text-gray-400 font-sans-body animate-pulse">Loading identity...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 relative">
      
      {/* --- GUEST LIST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#0f1115] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-lg font-serif-display text-white">Guest List</h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">{currentEventTitle}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* List Area */}
                <div className="p-0 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                    {loadingGuests ? (
                        <div className="p-8 text-center text-gray-500 text-xs uppercase tracking-widest animate-pulse">Fetching data...</div>
                    ) : guestList.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm italic">No guests have joined yet.</div>
                    ) : (
                        <ul className="divide-y divide-white/5">
                            {guestList.map((guest, idx) => (
                                <li key={idx} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                            {guest.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{guest.full_name}</p>
                                            <p className="text-gray-500 text-xs">{guest.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                            {guest.flat_number || 'N/A'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Guests: {guestList.length}</p>
                </div>
            </div>
        </div>
      )}

      {/* --- IDENTITY CARD --- */}
      <div className="relative w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl mb-12 overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/20 rounded-full blur-[80px] group-hover:bg-blue-800/30 transition-colors duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center text-4xl font-serif-display text-white shadow-lg shadow-blue-900/50 ring-1 ring-white/20">
                {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-serif-display text-white mb-2">{user.full_name}</h1>
                <p className="text-gray-400 font-sans-body tracking-wider text-sm mb-4">{user.email}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg">
                    <span className="text-gray-500 text-xs uppercase tracking-widest">Residence</span>
                    <span className="text-white font-mono">{user.flat_number || 'N/A'}</span>
                </div>
            </div>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 rounded-lg text-xs uppercase tracking-widest font-semibold">
                Return to Board
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
        
        {/* My Created Events */}
        <div className="w-full">
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-serif-display text-white">My Submissions</h2>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Organized by you</span>
            </div>

            {myCreatedEvents.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                    <p className="text-gray-500 text-sm mb-4">You haven't created any events yet.</p>
                    <button onClick={() => navigate('/create')} className="text-blue-400 hover:text-blue-300 text-xs uppercase tracking-widest border-b border-blue-400 pb-1">Create One Now</button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {myCreatedEvents.map((event) => (
                        <div key={event.id} className="bg-white/5 border border-white/5 hover:border-white/20 p-5 rounded-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-serif-display text-gray-200">{event.title}</h3>
                                {getStatusBadge(event.status)}
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500 font-sans-body tracking-wide uppercase mb-3">
                                <span>🗓 {new Date(event.event_date).toLocaleDateString()}</span>
                                <span>👥 Cap: {event.capacity}</span>
                            </div>
                            
                            {/* VIEW GUEST LIST BUTTON */}
                            <button 
                                onClick={() => handleViewAttendees(event.id, event.title)}
                                className="w-full py-2 bg-black/30 hover:bg-black/50 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest rounded border border-white/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>📋</span> View Guest List
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Attending Events */}
        <div className="w-full">
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-serif-display text-white">Attending</h2>
                <span className="text-xs text-gray-500 uppercase tracking-widest">RSVP List</span>
            </div>

            {myJoinedEvents.length === 0 ? (
                <p className="text-gray-500 text-sm italic">You haven't joined any events yet.</p>
            ) : (
                <div className="grid gap-4">
                    {myJoinedEvents.map((event) => (
                        <div key={event.id} className="group bg-white/5 border border-white/5 hover:border-white/20 p-5 rounded-xl flex justify-between items-center transition-all duration-300">
                            <div>
                                <h3 className="text-lg font-serif-display text-gray-200 group-hover:text-white transition-colors">{event.title}</h3>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500 font-sans-body tracking-wide uppercase">
                                    <span>📍 {event.venue}</span>
                                    <span>🕒 {new Date(event.event_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}