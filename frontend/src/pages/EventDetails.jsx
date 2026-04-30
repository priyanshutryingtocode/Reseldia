import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CommentSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchComments();
  }, [eventId]);

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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
      <h3 className="text-white font-serif-display text-xl mb-6">Discussion Board</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-white/20">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No comments yet. Be the first to start the conversation!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-blue-300 text-sm font-bold">{c.full_name}</span>
                    <span className="text-gray-600 text-[10px] uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 pr-20 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          placeholder="Ask a question or share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
            type="submit" 
            className="absolute right-2 top-2 bottom-2 bg-white text-black px-4 rounded-lg text-xs font-bold uppercase hover:bg-gray-200 transition-colors"
        >
            Post
        </button>
      </form>
    </div>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload.id || payload.userId || payload.user_id);
    } catch (e) {
        console.error("Token error");
    }

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: token } };
            // 1. Fetch Event Details
            const eventRes = await axios.get(`${API_URL}/api/events`, config);
            const foundEvent = eventRes.data.find(e => e.id === parseInt(id));
            
            if (foundEvent) {
                setEvent(foundEvent);
                // 2. Check if joined
                const myEventsRes = await axios.get(`${API_URL}/api/events/my-events`, config);
                const hasJoined = myEventsRes.data.some(e => e.id === parseInt(id));
                setIsJoined(hasJoined);
            } else {
                alert("Event not found");
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id, navigate, API_URL]);

  const handleJoin = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/events/${id}/join`, {}, { headers: { Authorization: token } });
      setIsJoined(true);
      alert("Successfully joined! 🎉");
    } catch (err) {
      alert(`⚠️ ${err.response?.data?.message || "Failed to join"}`);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-400 font-sans-body animate-pulse">Loading Event Details...</div>;
  if (!event) return null;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboard')} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest transition-colors">
        ← Back to Dashboard
      </button>

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-12">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="absolute inset-0 bg-black/40"></div>
         </div>
         
         <div className="absolute bottom-0 left-0 p-10 w-full">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest text-blue-200 uppercase bg-blue-500/20 border border-blue-500/30 rounded backdrop-blur-md">
              {event.category || 'General'}
            </span>
            <h1 className="text-5xl md:text-6xl font-serif-display text-white mb-4 leading-tight drop-shadow-lg">
              {event.title}
            </h1>
            <div className="flex gap-6 text-sm text-gray-200 font-sans-body tracking-wide">
                <span className="flex items-center gap-2">🗓 {new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="flex items-center gap-2">📍 {event.venue}</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* --- LEFT COLUMN: DETAILS --- */}
        <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <div>
                <h2 className="text-2xl font-serif-display text-white mb-6">About the Event</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 leading-relaxed text-gray-300 font-sans-body text-lg whitespace-pre-wrap">
                    {event.description}
                </div>
            </div>

            {/* Discussion Board */}
            <CommentSection eventId={event.id} />
        </div>

        {/* --- RIGHT COLUMN: ACTIONS --- */}
        <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sticky top-24">
                <div className="mb-8">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Capacity</p>
                    <p className="text-2xl text-white font-serif-display">{event.capacity} Guests</p>
                </div>

                <div className="mb-8">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Organizer</p>
                    <p className="text-lg text-white">Resident ID #{event.organizer_id}</p>
                </div>

                {isJoined ? (
                    <button disabled className="w-full py-4 bg-green-500/20 text-green-400 border border-green-500/30 font-bold uppercase tracking-widest rounded-xl cursor-default flex items-center justify-center gap-2">
                        <span>✓</span> You are Going
                    </button>
                ) : (
                    <button 
                        onClick={handleJoin} 
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-1"
                    >
                        Join Event
                    </button>
                )}

            </div>
        </div>

      </div>
    </div>
  );
}