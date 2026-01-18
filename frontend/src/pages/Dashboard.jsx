import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsCarousel from '../components/NewsCarousel'; 

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
      alert(`⚠️ ${err.response?.data?.message || "Failed to join"}`);
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

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse font-sans-body">
      Loading community events...
    </div>
  );

  return (
    <div>
      <NewsCarousel />

      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-serif-display text-white mb-2">Community Events</h2>
          <p className="text-gray-400 font-sans-body text-sm tracking-wide">Curated activities for residents</p>
        </div>
        <div className="text-right">
             <span className="text-5xl font-serif-display text-white/20">{String(events.length).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.length === 0 ? (
           <div className="col-span-3 text-center py-20 border border-dashed border-white/10 rounded-2xl">
             <p className="text-gray-500 text-lg font-serif-display">No scheduled events.</p>
           </div>
        ) : (
          events.map((event) => {
            const isJoined = joinedEventIds.has(event.id);
            const canDelete = (currentUserId === event.organizer_id) || isAdmin;

            return (
              <div key={event.id} className="group flex flex-col justify-between h-full bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-500 shadow-xl">
                
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-blue-200 text-[10px] tracking-widest uppercase rounded">
                      {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                  </div>

                  <h2 className="text-2xl font-serif-display text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                    {event.title}
                  </h2>
                  
                  <p className="text-gray-400 font-sans-body text-sm leading-relaxed mb-8 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="flex items-center text-gray-500 text-xs tracking-widest uppercase mb-8 border-t border-white/5 pt-4">
                    <span className="mr-2">📍</span> {event.venue}
                  </div>
                </div>

                <div className="flex gap-4">
                  {isJoined ? (
                    <button disabled className="flex-1 py-3 bg-white/10 text-green-400 text-xs font-bold tracking-widest uppercase border border-green-500/20 cursor-default">
                      Attending
                    </button>
                  ) : (
                    <button 
                        onClick={() => handleJoin(event.id)} 
                        className="flex-1 py-3 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors"
                    >
                      Join Event
                    </button>
                  )}
                  
                  {canDelete && (
                    <button 
                        onClick={() => handleDelete(event.id)} 
                        className="px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Event"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}