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
      console.error(err);
      setError('Access Denied. You must be an admin to view this page.');
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
      alert("Error approving event: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject and delete this event?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: { Authorization: token }
      });

      setPendingEvents(prev => prev.filter(event => event.id !== id));
      
    } catch (err) {
      alert("Error rejecting event");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-gray-500">
       <span className="animate-pulse">Loading Admin Panel...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-xl font-bold mb-4">⛔ {error}</div>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Go Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
           <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
             &larr; Back to Board
           </button>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">
              Pending Approvals 
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{pendingEvents.length}</span>
            </h2>
          </div>

          <div className="p-6">
            {pendingEvents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-green-600 text-lg font-medium">✨ All caught up!</p>
                <p className="text-gray-500">No events are waiting for approval.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {pendingEvents.map(event => (
                  <li key={event.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition shadow-sm">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>🗓 {new Date(event.event_date).toLocaleDateString()}</span>
                        <span>📍 {event.venue}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Organizer ID: {event.organizer_id}</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(event.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm text-sm font-medium flex items-center gap-2"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(event.id)}
                        className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition shadow-sm text-sm font-medium"
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
    </div>
  );
};

export default AdminDashboard;