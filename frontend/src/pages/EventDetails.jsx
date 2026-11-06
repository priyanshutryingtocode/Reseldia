import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import { useToast } from '../components/toastContext';
import CommentSection from '../components/CommentSection';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
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
      try {
        const eventRes = await api.get(`/api/events/${id}`);
        setEvent(eventRes.data);
      } catch (err) {
        console.error('Failed to load event details:', err);
        const status = err.response?.status;
        const details = getErrorMessage(err, 'Event not found');
        showToast(`Could not load event${status ? ` (${status})` : ''}: ${details}`, 'error');
        navigate('/dashboard');
        return;
      }

      try {
        const myEventsRes = await api.get('/api/events/my-events');
        setIsJoined(myEventsRes.data.some(joinedEvent => joinedEvent.id === Number(id)));
      } catch (err) {
        console.warn('Could not check RSVP status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, showToast]);

  const handleJoin = async () => {
    try {
      await api.post(`/api/events/${id}/join`);
      setIsJoined(true);
      setEvent(prev => ({ ...prev, attendee_count: Number(prev.attendee_count || 0) + 1 }));
      showToast('You joined this event.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to join event.'), 'error');
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await api.post(`/api/events/${id}/bookmark`);
      setEvent(prev => ({ ...prev, is_bookmarked: res.data.bookmarked }));
      showToast(res.data.bookmarked ? 'Event saved.' : 'Event removed from saved.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update saved event.'), 'error');
    }
  };

  const updateLifecycle = async (action, successMessage) => {
    try {
      const res = await api.put(`/api/events/${id}/${action}`);
      setEvent(prev => ({ ...prev, ...res.data.event }));
      showToast(successMessage, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, `Failed to ${action} event.`), 'error');
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-400 font-sans-body animate-pulse">Loading event details...</div>;
  if (!event) return null;

  const canEdit = currentUserId === event.organizer_id || isAdmin;
  const canJoin = event.status === 'approved';
  const attendeeCount = Number(event.attendee_count || 0);
  const spotsLeft = Math.max(Number(event.capacity || 0) - attendeeCount, 0);
  const capacityPercent = event.capacity ? Math.min(100, Math.round((attendeeCount / event.capacity) * 100)) : 0;
  const statusBadge = {
    approved: 'text-green-300 border-green-500/30 bg-green-500/10',
    pending: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
    rejected: 'text-red-300 border-red-500/30 bg-red-500/10',
    cancelled: 'text-gray-300 border-gray-500/30 bg-gray-500/10',
    completed: 'text-blue-300 border-blue-500/30 bg-blue-500/10'
  }[event.status] || 'text-gray-300 border-white/10 bg-white/5';

  return (
    <div className="max-w-6xl mx-auto px-4">
      <button onClick={() => navigate('/dashboard')} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest transition-colors">
        Back to Dashboard
      </button>

      <div className="relative w-full min-h-[360px] rounded-lg overflow-hidden border border-white/10 mb-10 surface">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#111827] to-[#0b0c0f]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(96,165,250,0.2),transparent_35%)]"></div>

        <div className="relative p-8 md:p-10 h-full flex flex-col justify-end min-h-[360px]">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="inline-block w-fit px-3 py-1 text-[10px] font-bold tracking-widest text-blue-200 uppercase bg-white/10 border border-white/15 rounded backdrop-blur-md">
              {event.category || 'General'}
            </span>
            <span className={`inline-block w-fit px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded border backdrop-blur-md ${statusBadge}`}>
              {event.status || 'unknown'}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif-display text-white mb-5 leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-sm text-gray-300 font-sans-body tracking-wide">
            <span>{new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {event.status !== 'approved' && (
        <div className="mb-8 border border-yellow-500/20 bg-yellow-500/10 text-yellow-100 rounded-lg px-5 py-4 text-sm">
          {event.status === 'pending' && 'This event is waiting for admin approval and is hidden from the public feed.'}
          {event.status === 'rejected' && 'This event was rejected by an admin. Edit it and resubmit for approval.'}
          {event.status === 'cancelled' && 'This event has been cancelled.'}
          {event.status === 'completed' && 'This event has already taken place.'}
        </div>
      )}

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
              <p className="text-lg text-white">{event.organizer_name || `Resident #${event.organizer_id}`}</p>
            </div>

            <div className="space-y-3">
              {isJoined ? (
                <button disabled className="w-full py-4 bg-green-500/20 text-green-400 border border-green-500/30 font-bold uppercase tracking-widest rounded-md cursor-default">
                  You are Going
                </button>
              ) : canJoin ? (
                <button onClick={handleJoin} disabled={spotsLeft === 0} className={`w-full py-4 font-bold uppercase tracking-widest rounded-md transition-all ${spotsLeft === 0 ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
                  {spotsLeft === 0 ? 'Event Full' : 'Join Event'}
                </button>
              ) : (
                <button disabled className="w-full py-4 bg-white/5 text-gray-500 border border-white/10 font-bold uppercase tracking-widest rounded-md cursor-not-allowed">
                  Not Open for RSVP
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

              {canEdit && !['cancelled', 'completed'].includes(event.status) && (
                <button onClick={() => updateLifecycle('cancel', 'Event cancelled.')} className="w-full py-3 border border-red-300/20 text-red-200 hover:bg-red-500/10 rounded-md text-xs uppercase tracking-widest transition-colors">
                  Cancel Event
                </button>
              )}

              {canEdit && event.status === 'approved' && (
                <button onClick={() => updateLifecycle('complete', 'Event marked as completed.')} className="w-full py-3 border border-green-300/20 text-green-200 hover:bg-green-500/10 rounded-md text-xs uppercase tracking-widest transition-colors">
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
