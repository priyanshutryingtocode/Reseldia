import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [myEvents, setMyEvents] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: token } };
        const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
        setUser(userRes.data);
        const eventsRes = await axios.get('http://localhost:5000/api/events/my-events', config);
        setMyEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  if (!user) return <div className="text-center mt-20 text-gray-400 font-sans-body animate-pulse">Loading identity...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      
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

            <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 rounded-lg text-xs uppercase tracking-widest font-semibold"
            >
                Return to Board
            </button>
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-2xl font-serif-display text-white mb-8 border-b border-white/10 pb-4">
            Scheduled Activities
        </h2>

        {myEvents.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No active schedules found.</p>
        ) : (
            <div className="grid gap-4">
                {myEvents.map((event) => (
                    <div key={event.id} className="group bg-white/5 border border-white/5 hover:border-white/20 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center transition-all duration-300 hover:bg-white/10">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-serif-display text-gray-200 group-hover:text-white transition-colors">{event.title}</h3>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 font-sans-body tracking-wide uppercase">
                                <span>📍 {event.venue}</span>
                                <span>🕒 {new Date(event.event_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded-full shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                            Confirmed
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}