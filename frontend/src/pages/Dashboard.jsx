import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set()); // New State for tracking IDs
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: token } };

        // 1. Fetch ALL Events
        const eventsRes = await axios.get('http://localhost:5000/api/events');
        setEvents(eventsRes.data);

        // 2. Fetch MY Events (to know which ones I joined)
        const myEventsRes = await axios.get('http://localhost:5000/api/events/my-events', config);
        
        // Create a Set of IDs for fast lookup
        const myIds = new Set(myEventsRes.data.map(e => e.id));
        setJoinedEventIds(myIds);

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleJoin = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5000/api/events/${eventId}/join`, 
        {}, 
        { headers: { Authorization: token } }
      );
      
      // Update UI instantly without refreshing
      alert("✅ You have successfully joined!");
      setJoinedEventIds(prev => new Set(prev).add(eventId)); // Add to our "Joined" set

    } catch (err) {
      alert(`⚠️ ${err.response?.data?.message || "Failed to join"}`);
    }
  };

  const handleDelete = async (eventId) => {
    if(!confirm("Are you sure? This cannot be undone.")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: token }
      });
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📌 Community Board</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow">+ New Event</button>
          <button onClick={() => navigate('/profile')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 shadow-sm">👤 Profile</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow">Logout</button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
           <p className="text-gray-500 col-span-3 text-center mt-10">No events found.</p>
        ) : (
          events.map((event) => {
            // Check if user has already joined this event
            const isJoined = joinedEventIds.has(event.id);

            return (
              <div key={event.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition flex flex-col justify-between h-full border border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <p>📍 {event.venue}</p>
                    <p>📅 {new Date(event.event_date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {/* SMART BUTTON LOGIC */}
                  {isJoined ? (
                    <button 
                      disabled 
                      className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-bold cursor-not-allowed border border-green-200"
                    >
                      Joined ✅
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(event.id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Join Event
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}