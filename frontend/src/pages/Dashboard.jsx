import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0); 
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

        if (role === 'admin') {
            try {
                const pendingRes = await axios.get(`${API_URL}/api/events/pending`, config);
                setPendingCount(pendingRes.data.length);
            } catch (err) {
                console.error("Could not fetch pending count", err);
            }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

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
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📌 Community Board</h1>
        
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              className="relative bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow transition font-bold flex items-center"
            >
              🛡️ Admin Panel
              
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <button onClick={() => navigate('/create')} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow transition">+ Create Event</button>
          <button onClick={() => navigate('/profile')} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100 shadow-sm transition">👤 Profile</button>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-lg hover:bg-red-100 shadow-sm transition">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
           <div className="col-span-3 text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-lg">No events found.</p>
             <button onClick={() => navigate('/create')} className="mt-4 text-blue-600 hover:underline">Be the first to create one!</button>
           </div>
        ) : (
          events.map((event) => {
            const isJoined = joinedEventIds.has(event.id);
            const canDelete = (currentUserId === event.organizer_id) || isAdmin;

            return (
              <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-full border border-gray-100">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-medium">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm mt-2">{event.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <span className="mr-2">📍</span>{event.venue}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {isJoined ? (
                    <button disabled className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-bold cursor-default border border-green-200 text-sm">
                      ✓ Joined
                    </button>
                  ) : (
                    <button onClick={() => handleJoin(event.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                      Join Event
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(event.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium text-sm" title="Delete Event">
                      🗑️
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