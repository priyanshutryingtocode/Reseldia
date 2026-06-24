import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsCarousel from '../components/NewsCarousel';
import PollWidget from '../components/PollWidget';
import api, { getErrorMessage } from '../lib/api';
import { useToast } from '../components/toastContext';

function CommentSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      try {
        const res = await api.get(`/api/events/${eventId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [eventId, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/api/events/${eventId}/comments`, { text: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      showToast('Comment posted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to post comment.'), 'error');
    }
  };

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] text-blue-300 hover:text-white uppercase tracking-wider mb-3 transition-colors"
      >
        {isOpen ? 'Close discussion' : 'Discuss'}
      </button>

      {isOpen && (
        <div className="animate-fade-in">
          <div className="space-y-3 max-h-40 overflow-y-auto mb-4 pr-2">
            {comments.length === 0 && <p className="text-gray-500 text-xs italic">No comments yet.</p>}
            {comments.map((comment) => (
              <div key={comment.id} className="bg-black/20 p-3 rounded-md text-sm border border-white/5">
                <div className="flex justify-between items-baseline mb-1 gap-3">
                  <span className="text-gray-300 text-xs font-bold">{comment.full_name}</span>
                  <span className="text-gray-600 text-[10px]">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-400 text-xs">{comment.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs text-white focus-ring"
              placeholder="Type a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="text-[10px] bg-white text-black px-3 py-1 rounded-md font-bold uppercase hover:bg-gray-200 transition-colors">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isJoined, canDelete, onJoin, onDelete, onBookmark, onOpen }) {
  const spotsLeft = Math.max(Number(event.capacity || 0) - Number(event.attendee_count || 0), 0);
  const capacityPercent = event.capacity ? Math.min(100, Math.round((event.attendee_count / event.capacity) * 100)) : 0;

  return (
    <div className="group flex flex-col justify-between h-full surface-soft p-5 rounded-lg hover:bg-white/[0.065] hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
      <div onClick={onOpen} className="cursor-pointer">
        <div className="flex justify-between items-start mb-4 gap-3">
          <span className="px-2 py-1 bg-white/5 border border-white/10 text-blue-200 text-[10px] tracking-widest uppercase rounded">
            {event.category || 'General'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(event.id);
            }}
            className={`text-[10px] tracking-widest uppercase transition-colors ${event.is_bookmarked ? 'text-blue-300' : 'text-gray-500 hover:text-white'}`}
          >
            {event.is_bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>

        <h2 className="text-xl font-serif-display text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors">
          {event.title}
        </h2>

        <p className="text-gray-400 font-sans-body text-sm leading-relaxed mb-6 line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-3 mb-6 border-t border-white/5 pt-4">
          <div className="flex justify-between text-xs text-gray-500 tracking-widest uppercase gap-3">
            <span>{new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span className="truncate">{event.venue}</span>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mb-2">
              <span>{event.attendee_count || 0} / {event.capacity} attending</span>
              <span>{spotsLeft} left</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded overflow-hidden">
              <div className="h-full bg-blue-300/70" style={{ width: `${capacityPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-2 mb-4">
          {isJoined ? (
            <button disabled className="flex-1 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold tracking-widest uppercase border border-green-500/20 cursor-default rounded-md">
              Attending
            </button>
          ) : (
            <button onClick={() => onJoin(event.id)} className="flex-1 py-2 bg-white text-black text-[10px] font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors rounded-md">
              Join
            </button>
          )}
          <button onClick={onOpen} className="px-3 py-2 border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-md text-[10px] font-bold uppercase tracking-widest">
            View
          </button>
          {canDelete && (
            <button onClick={() => onDelete(event.id)} className="px-3 py-2 border border-red-400/20 text-red-300 hover:bg-red-500/10 transition-colors rounded-md text-[10px] font-bold uppercase tracking-widest">
              Delete
            </button>
          )}
        </div>

        <CommentSection eventId={event.id} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortMode, setSortMode] = useState('date');
  const [viewMode, setViewMode] = useState('grid');

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      navigate('/login');
      return;
    }

    setIsAdmin(role === 'admin');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.id || payload.userId || payload.user_id);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [allEventsRes, myEventsRes] = await Promise.all([
          api.get('/api/events'),
          api.get('/api/events/my-events')
        ]);
        setEvents(allEventsRes.data);
        setJoinedEventIds(new Set(myEventsRes.data.map(event => event.id)));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredEvents = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const sorted = [...events]
      .filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(query) || event.venue.toLowerCase().includes(query);
        const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortMode === 'newest') return new Date(b.created_at || b.event_date) - new Date(a.created_at || a.event_date);
        if (sortMode === 'capacity') return (b.capacity - b.attendee_count) - (a.capacity - a.attendee_count);
        if (sortMode === 'saved') return Number(b.is_bookmarked) - Number(a.is_bookmarked);
        if (sortMode === 'joined') return Number(joinedEventIds.has(b.id)) - Number(joinedEventIds.has(a.id));
        return new Date(a.event_date) - new Date(b.event_date);
      });

    return sorted;
  }, [categoryFilter, events, joinedEventIds, searchTerm, sortMode]);

  const calendarGroups = useMemo(() => {
    return filteredEvents.reduce((groups, event) => {
      const key = new Date(event.event_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      return { ...groups, [key]: [...(groups[key] || []), event] };
    }, {});
  }, [filteredEvents]);

  const handleJoin = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/join`);
      setJoinedEventIds(prev => new Set(prev).add(eventId));
      setEvents(prev => prev.map(event => event.id === eventId ? { ...event, attendee_count: Number(event.attendee_count || 0) + 1 } : event));
      showToast('You joined this event.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to join event.'), 'error');
    }
  };

  const handleBookmark = async (eventId) => {
    try {
      const res = await api.post(`/api/events/${eventId}/bookmark`);
      setEvents(prev => prev.map(event => event.id === eventId ? { ...event, is_bookmarked: res.data.bookmarked } : event));
      showToast(res.data.bookmarked ? 'Event saved.' : 'Event removed from saved.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update saved event.'), 'error');
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setJoinedEventIds(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      showToast('Event deleted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete event.'), 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse font-sans-body">Loading events...</div>;
  }

  return (
    <div>
      <NewsCarousel />

      <div className="surface rounded-lg p-5 mb-8 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-serif-display text-white">Community Events</h2>
            <p className="text-gray-400 font-sans-body text-xs tracking-widest uppercase mt-1">
              {filteredEvents.length} of {events.length} active listings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full sm:w-64 bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select className="bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring cursor-pointer" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Sports">Sports</option>
              <option value="Social">Social</option>
              <option value="Meeting">Meeting</option>
            </select>

            <select className="bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring cursor-pointer" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
              <option value="date">Soonest</option>
              <option value="newest">Newest</option>
              <option value="capacity">Spots Left</option>
              <option value="joined">Joined First</option>
              <option value="saved">Saved First</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center md:justify-end gap-2">
          {['grid', 'calendar'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest uppercase transition-colors ${viewMode === mode ? 'bg-white text-black' : 'border border-white/10 text-gray-400 hover:text-white'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-6">
          {Object.keys(calendarGroups).length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
              <p className="text-gray-500 text-lg font-serif-display">No events found.</p>
            </div>
          ) : (
            Object.entries(calendarGroups).map(([month, monthEvents]) => (
              <div key={month} className="surface-soft rounded-lg p-5">
                <h3 className="text-xl font-serif-display text-white mb-4">{month}</h3>
                <div className="divide-y divide-white/5">
                  {monthEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="w-full py-4 flex items-center justify-between gap-4 text-left hover:bg-white/5 px-3 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 text-center border border-white/10 rounded-md py-2">
                          <p className="text-[10px] text-gray-500 uppercase">{new Date(event.event_date).toLocaleDateString(undefined, { month: 'short' })}</p>
                          <p className="text-xl text-white font-serif-display">{new Date(event.event_date).getDate()}</p>
                        </div>
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{event.venue}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{event.attendee_count || 0}/{event.capacity}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="h-full">
            <PollWidget />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center py-20 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center">
              <p className="text-gray-500 text-lg font-serif-display">No events found.</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isJoined={joinedEventIds.has(event.id)}
                canDelete={currentUserId === event.organizer_id || isAdmin}
                onJoin={handleJoin}
                onDelete={handleDelete}
                onBookmark={handleBookmark}
                onOpen={() => navigate(`/events/${event.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
