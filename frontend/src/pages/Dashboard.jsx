import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsCarousel from '../components/NewsCarousel'; 
import PollWidget from '../components/PollWidget'; 

// --- Inline Comment Component ---
function CommentSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if(isOpen) fetchComments();
  }, [isOpen]);

  const fetchComments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/events/${eventId}/comments`, {
        headers: { Authorization: token }
      });
      setComments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/events/${eventId}/comments`, 
        { text: newComment }, 
        { headers: { Authorization: token } }
      );
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) { alert('Failed to post'); }
  };

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-[10px] text-blue-300 hover:text-white uppercase tracking-wider mb-2 flex items-center gap-1 transition-colors"
      >
        <span>{isOpen ? '✕' : '💬'}</span> {isOpen ? 'Close' : 'Discuss'}
      </button>

      {isOpen && (
        <div className="animate-fade-in">
            <div className="space-y-3 max-h-40 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-white/20 pr-2">
                {comments.length === 0 && <p className="text-gray-500 text-xs italic">No comments yet.</p>}
                {comments.map((c) => (
                <div key={c.id} className="bg-black/20 p-2 rounded text-sm border border-white/5">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-gray-300 text-xs font-bold">{c.full_name}</span>
                        <span className="text-gray-600 text-[10px]">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{c.text}</p>
                </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Type a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="text-[10px] bg-white text-black px-3 py-1 rounded font-bold uppercase hover:bg-gray-200 transition-colors">Post</button>
            </form>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
     const token = localStorage.getItem('token');
     const role = localStorage.getItem('role');

     if (!token) {
       navigate('/login');
       return;
     }
     if (role === 'admin') setIsAdmin(true);
 
     try {
       const payload = JSON.parse(atob(token.split('.')[1]));
       setCurrentUserId(payload.id || payload.userId || payload.user_id);
     } catch (e) {
       localStorage.removeItem('token');
       navigate('/login');
     }
 
     const fetchData = async () => {
       try {
         const config = { headers: { Authorization: token } };
         const [allEventsRes, myEventsRes] = await Promise.all([
           axios.get(`${API_URL}/api/events`),
           axios.get(`${API_URL}/api/events/my-events`, config)
         ]);
         setEvents(allEventsRes.data);
         setJoinedEventIds(new Set(myEventsRes.data.map(e => e.id)));
       } catch (err) {
         console.error("Error fetching data:", err);
       } finally {
         setLoading(false);
       }
     };
     fetchData();
  }, [navigate, API_URL]);

  const handleJoin = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/events/${eventId}/join`, {}, { headers: { Authorization: token } });
      setJoinedEventIds(prev => new Set(prev).add(eventId)); 
    } catch (err) {
      alert(`${err.response?.data?.message || "Failed to join"}`);
    }
  };

  const handleDelete = async (eventId) => {
    if(!confirm("Are you sure? This cannot be undone.")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/events/${eventId}`, { headers: { Authorization: token } });
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || (event.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse font-sans-body">Loading...</div>;

  return (
    <div>
      <NewsCarousel />

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-serif-display text-white">Community Events</h2>
          <p className="text-gray-400 font-sans-body text-xs tracking-widest uppercase mt-1">
            {events.length} Active Listings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="w-full sm:w-64 bg-black/20 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-black/40 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors">🔍</span>
            </div>
            
            <select 
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer"
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                <option value="All">All Categories</option>
                <option value="General">General</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
                <option value="Meeting">Meeting</option>
            </select>
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. POLL WIDGET INTEGRATED AS FIRST CARD */}
        <div className="h-full">
            <PollWidget />
        </div>

        {/* 2. EVENT CARDS */}
        {filteredEvents.length === 0 ? (
           <div className="col-span-1 md:col-span-2 text-center py-20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
             <p className="text-gray-500 text-lg font-serif-display">No events found.</p>
           </div>
        ) : (
          filteredEvents.map((event) => {
            const isJoined = joinedEventIds.has(event.id);
            const canDelete = (currentUserId === event.organizer_id) || isAdmin;

            return (
              <div key={event.id} className="group flex flex-col justify-between h-full bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 shadow-lg">
                <div 
                    onClick={() => navigate(`/events/${event.id}`)} 
                    className="cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-blue-200 text-[10px] tracking-widest uppercase rounded">
                      {event.category || 'General'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="text-xl font-serif-display text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors">
                    {event.title}
                  </h2>
                  
                  <p className="text-gray-400 font-sans-body text-sm leading-relaxed mb-6 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="flex items-center text-gray-500 text-xs tracking-widest uppercase mb-6 border-t border-white/5 pt-4">
                    <span className="mr-2">📍</span> {event.venue}
                  </div>
                </div>

                <div>
                    <div className="flex gap-3 mb-4">
                        {isJoined ? (
                            <button disabled className="flex-1 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold tracking-widest uppercase border border-green-500/20 cursor-default rounded">
                                Attending
                            </button>
                        ) : (
                            <button onClick={() => handleJoin(event.id)} className="flex-1 py-2 bg-white text-black text-[10px] font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors rounded">
                                Join
                            </button>
                        )}
                        <button 
                            onClick={() => navigate(`/events/${event.id}`)} 
                            className="px-3 py-2 border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded text-[10px] font-bold uppercase tracking-widest"
                        >
                            View
                        </button>
                    </div>
                    
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}