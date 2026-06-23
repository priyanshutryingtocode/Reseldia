import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function CommentSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/events/${eventId}/comments`, {
          headers: { Authorization: token }
        });
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [API_URL, eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${API_URL}/api/events/${eventId}/comments`,
        { text: newComment },
        { headers: { Authorization: token } }
      );
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch {
      alert('Failed to post');
    }
  };

  return (
    <div className="surface-soft rounded-lg p-6">
      <h3 className="text-white font-serif-display text-xl mb-6">Discussion Board</h3>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No comments yet. Be the first to start the conversation.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-black/20 p-4 rounded-md border border-white/5">
              <div className="flex justify-between items-baseline mb-2 gap-3">
                <span className="text-blue-300 text-sm font-bold">{comment.full_name}</span>
                <span className="text-gray-600 text-[10px] uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-4 pr-20 text-sm text-white focus-ring"
          placeholder="Ask a question or share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-white text-black px-4 rounded-md text-xs font-bold uppercase hover:bg-gray-200 transition-colors">
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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      return token ? JSON.parse(atob(token.split('.')[1])).user_id : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = localStorage.getItem('role') === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      const config = { headers: { Authorization: token } };

      try {
        const eventRes = await axios.get(`${API_URL}/api/events/${id}`, config);
        setEvent(eventRes.data);
      } catch (err) {
        console.error('Failed to load event details:', err);
        const status = err.response?.status;
        const details = err.response?.data?.message || err.response?.data?.msg || err.response?.data?.error || err.message;
        alert(`Could not load event${status ? ` (${status})` : ''}: ${details}`);
        navigate('/dashboard');
        return;
      }

      try {
        const myEventsRes = await axios.get(`${API_URL}/api/events/my-events`, config);
        setIsJoined(myEventsRes.data.some(joinedEvent => joinedEvent.id === Number(id)));
      } catch (err) {
        console.warn('Could not check RSVP status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, id, navigate]);

  const handleJoin = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/events/${id}/join`, {}, { headers: { Authorization: token } });
      setIsJoined(true);
      setEvent(prev => ({ ...prev, attendee_count: Number(prev.attendee_count || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join");
    }
  };

  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/events/${id}/bookmark`, {}, { headers: { Authorization: token } });
      setEvent(prev => ({ ...prev, is_bookmarked: res.data.bookmarked }));
    } catch {
      alert("Failed to update saved event.");
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-400 font-sans-body animate-pulse">Loading event details...</div>;
  if (!event) return null;

  const canEdit = currentUserId === event.organizer_id || isAdmin;
  const attendeeCount = Number(event.attendee_count || 0);
  const spotsLeft = Math.max(Number(event.capacity || 0) - attendeeCount, 0);
  const capacityPercent = event.capacity ? Math.min(100, Math.round((attendeeCount / event.capacity) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <button onClick={() => navigate('/dashboard')} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest transition-colors">
        Back to Dashboard
      </button>

      <div className="relative w-full min-h-[360px] rounded-lg overflow-hidden border border-white/10 mb-10 surface">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#111827] to-[#0b0c0f]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(96,165,250,0.2),transparent_35%)]"></div>

        <div className="relative p-8 md:p-10 h-full flex flex-col justify-end min-h-[360px]">
          <span className="inline-block w-fit px-3 py-1 mb-4 text-[10px] font-bold tracking-widest text-blue-200 uppercase bg-white/10 border border-white/15 rounded backdrop-blur-md">
            {event.category || 'General'}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif-display text-white mb-5 leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-sm text-gray-300 font-sans-body tracking-wide">
            <span>{new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-serif-display text-white mb-4">About the Event</h2>
            <div className="surface-soft rounded-lg p-6 leading-relaxed text-gray-300 font-sans-body text-base whitespace-pre-wrap">
              {event.description || 'No description provided.'}
            </div>
          </div>

          <CommentSection eventId={event.id} />
        </div>

        <div className="lg:col-span-1">
          <div className="surface rounded-lg p-6 sticky top-24">
            <div className="mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Capacity</p>
              <p className="text-2xl text-white font-serif-display">{attendeeCount} / {event.capacity} Guests</p>
              <div className="h-1.5 bg-white/5 rounded overflow-hidden mt-3">
                <div className="h-full bg-blue-300/70" style={{ width: `${capacityPercent}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">{spotsLeft} spots left</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Organizer</p>
              <p className="text-lg text-white">Resident ID #{event.organizer_id}</p>
            </div>

            <div className="space-y-3">
              {isJoined ? (
                <button disabled className="w-full py-4 bg-green-500/20 text-green-400 border border-green-500/30 font-bold uppercase tracking-widest rounded-md cursor-default">
                  You are Going
                </button>
              ) : (
                <button onClick={handleJoin} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-md hover:bg-gray-200 transition-all">
                  Join Event
                </button>
              )}

              <button onClick={handleBookmark} className="w-full py-3 border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 rounded-md text-xs uppercase tracking-widest transition-colors">
                {event.is_bookmarked ? 'Remove Saved Event' : 'Save Event'}
              </button>

              {canEdit && (
                <button onClick={() => navigate(`/events/${event.id}/edit`)} className="w-full py-3 border border-blue-300/20 text-blue-200 hover:bg-blue-500/10 rounded-md text-xs uppercase tracking-widest transition-colors">
                  Edit Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
