import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


export default function Profile() {
  const [myEvents, setMyEvents] = useState([]);
  const [user, setUser] = useState(null); // Start as null
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: token } };
        
        // 1. Fetch User Details
        const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
        setUser(userRes.data);

        // 2. Fetch My Events
        const eventsRes = await axios.get('http://localhost:5000/api/events/my-events', config);
        setMyEvents(eventsRes.data);
        
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  if (!user) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      
      {/* Profile Card with REAL Data */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mb-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{user.full_name}</h1>
        <p className="text-gray-500">{user.email}</p>
        <div className="mt-2 inline-block bg-gray-100 px-3 py-1 rounded text-sm text-gray-700 font-semibold">
          🏠 Flat: {user.flat_number || 'N/A'}
        </div>
        
        <div className="mt-6">
            <button 
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:underline"
            >
                ← Back to Dashboard
            </button>
        </div>
      </div>

      {/* Events List (Same as before) */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">📅 My Scheduled Activities</h2>
        {/* ... (keep your existing events mapping code here) ... */}
        {myEvents.map((event) => (
             <div key={event.id} className="bg-white p-5 mb-4 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center">
               <div>
                 <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                 <p className="text-sm text-gray-500">📍 {event.venue} • 🕒 {new Date(event.event_date).toLocaleDateString()}</p>
               </div>
               <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                 CONFIRMED
               </span>
             </div>
        ))}
      </div>
    </div>
  );
}