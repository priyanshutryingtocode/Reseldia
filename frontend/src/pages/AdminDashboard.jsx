import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if(!token) {
        navigate('/login');
        return;
      }
      const res = await axios.get(`${API_URL}/api/events/pending`, {
        headers: { Authorization: token }
      });
      setPendingEvents(res.data);
    } catch (err) {
      setError('Access Denied. Admin privileges required.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/events/approve/${id}`, {}, {
        headers: { Authorization: token }
      });
      setPendingEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      alert("Error approving event");
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: { Authorization: token }
      });
      setPendingEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      alert("Error deleting event");
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse">Loading Command Center...</div>;
  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="text-red-400 text-xl font-serif-display mb-4">⛔ {error}</div>
        <button onClick={() => navigate('/')} className="text-white underline text-sm tracking-widest uppercase">Return Home</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
        
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
         <div>
            <h1 className="text-3xl font-serif-display text-white mb-2">Command Center</h1>
            <p className="text-gray-500 text-xs tracking-widest uppercase">Moderation Dashboard</p>
         </div>
         <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-xs tracking-widest uppercase transition-colors">
           &larr; Exit
         </button>
      </div>
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-white font-serif-display text-lg tracking-wide">
            Pending Approvals 
          </h2>
          {pendingEvents.length > 0 && (
             <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs px-3 py-1 font-bold rounded">
                {pendingEvents.length} Awaiting
             </span>
          )}
        </div>

        <div className="p-6">
          {pendingEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-green-400 text-xl font-serif-display mb-2">All Clear</p>
              <p className="text-gray-600 text-sm tracking-widest uppercase">No pending actions required</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {pendingEvents.map(event => (
                <li key={event.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/20 border border-white/5 p-6 rounded-xl hover:border-white/20 transition-all">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-serif-display text-xl text-white mb-1">{event.title}</h3>
                    <div className="flex gap-4 text-xs text-gray-500 font-sans-body tracking-wide uppercase">
                      <span>🗓 {new Date(event.event_date).toLocaleDateString()}</span>
                      <span>📍 {event.venue}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2 font-mono">ID: {event.organizer_id}</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleApprove(event.id)}
                      className="px-6 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-green-400 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(event.id)}
                      className="px-6 py-2 border border-white/10 text-red-400 text-xs font-bold tracking-widest uppercase hover:bg-red-500/10 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;