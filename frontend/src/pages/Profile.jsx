import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [myJoinedEvents, setMyJoinedEvents] = useState([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestList, setGuestList] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [currentEventTitle, setCurrentEventTitle] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: token } };
        const userRes = await axios.get(`${API_URL}/api/auth/me`, config);
        setUser(userRes.data);

        const sectionRequests = [
          ['attending events', axios.get(`${API_URL}/api/events/my-events`, config)],
          ['created events', axios.get(`${API_URL}/api/events/created-by-me`, config)],
          ['saved events', axios.get(`${API_URL}/api/events/bookmarked`, config)],
          ['profile stats', axios.get(`${API_URL}/api/events/stats/me`, config)]
        ];

        const [joinedRes, createdRes, savedRes, statsRes] = await Promise.allSettled(
          sectionRequests.map(([, request]) => request)
        );

        if (joinedRes.status === 'fulfilled') setMyJoinedEvents(joinedRes.value.data);
        if (createdRes.status === 'fulfilled') setMyCreatedEvents(createdRes.value.data);
        if (savedRes.status === 'fulfilled') setSavedEvents(savedRes.value.data);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);

        const failedSections = [joinedRes, createdRes, savedRes, statsRes]
          .map((result, index) => result.status === 'rejected' ? sectionRequests[index][0] : null)
          .filter(Boolean);

        if (failedSections.length > 0) {
          console.warn('Profile sections failed to load:', failedSections);
          setProfileError(`Could not load: ${failedSections.join(', ')}.`);
        } else {
          setProfileError('');
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
          return;
        }
        setProfileError('Unable to load your profile.');
      }
    };

    fetchData();
  }, [API_URL, navigate]);

  const handleViewAttendees = async (eventId, title) => {
    setIsModalOpen(true);
    setLoadingGuests(true);
    setCurrentEventTitle(title);
    setGuestList([]);

    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/events/${eventId}/attendees`, {
        headers: { Authorization: token }
      });
      setGuestList(res.data);
    } catch {
      console.error("Failed to fetch guest list");
    } finally {
      setLoadingGuests(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded-full">Live</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-widest uppercase rounded-full">Rejected</span>;
      default: return <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold tracking-widest uppercase rounded-full">Pending</span>;
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-400 font-sans-body animate-pulse">Loading identity...</p>
        {profileError && <p className="text-yellow-200 text-sm mt-4">{profileError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 relative">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-[#0f1115] border border-white/10 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-lg font-serif-display text-white">Guest List</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{currentEventTitle}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">Close</button>
            </div>

            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {loadingGuests ? (
                <div className="p-8 text-center text-gray-500 text-xs uppercase tracking-widest animate-pulse">Fetching data...</div>
              ) : guestList.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm italic">No guests have joined yet.</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {guestList.map((guest, idx) => (
                    <li key={idx} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-600/70 flex items-center justify-center text-xs font-bold text-white">
                          {guest.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{guest.full_name}</p>
                          <p className="text-gray-500 text-xs">{guest.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                        {guest.flat_number || 'N/A'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Guests: {guestList.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="surface rounded-lg p-8 md:p-10 mb-8 w-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 bg-blue-600/80 rounded-lg flex items-center justify-center text-4xl font-serif-display text-white ring-1 ring-white/20">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-serif-display text-white mb-2">{user.full_name}</h1>
            <p className="text-gray-400 font-sans-body tracking-wider text-sm mb-4">{user.email}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/10 rounded-md">
              <span className="text-gray-500 text-xs uppercase tracking-widest">Residence</span>
              <span className="text-white font-mono">{user.flat_number || 'N/A'}</span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-all rounded-md text-xs uppercase tracking-widest font-semibold">
            Return to Board
          </button>
        </div>
      </div>

      {profileError && (
        <div className="w-full mb-6 border border-yellow-500/20 bg-yellow-500/10 text-yellow-200 rounded-lg px-4 py-3 text-sm">
          {profileError}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full mb-10">
        {[
          ['Joined', stats?.joined_count || 0],
          ['Created', stats?.created_count || 0],
          ['Saved', stats?.saved_count || 0],
          ['Live', stats?.live_count || 0],
          ['Pending', stats?.pending_count || 0]
        ].map(([label, value]) => (
          <div key={label} className="surface-soft rounded-lg p-4">
            <p className="text-2xl text-white font-serif-display">{value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <section>
          <div className="flex justify-between items-end mb-5 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-serif-display text-white">My Submissions</h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Organized</span>
          </div>

          {myCreatedEvents.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-lg text-center">
              <p className="text-gray-500 text-sm mb-4">You haven't created any events yet.</p>
              <button onClick={() => navigate('/create')} className="text-blue-400 hover:text-blue-300 text-xs uppercase tracking-widest border-b border-blue-400 pb-1">Create One Now</button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myCreatedEvents.map((event) => (
                <div key={event.id} className="surface-soft p-5 rounded-lg">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="text-lg font-serif-display text-gray-200">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 font-sans-body tracking-wide uppercase mb-4">
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    <span>{event.attendee_count || 0}/{event.capacity}</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleViewAttendees(event.id, event.title)} className="flex-1 py-2 bg-black/30 hover:bg-black/50 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest rounded-md border border-white/5 transition-colors">
                      Guest List
                    </button>
                    <button onClick={() => navigate(`/events/${event.id}/edit`)} className="px-4 py-2 border border-blue-300/20 text-blue-200 text-[10px] uppercase tracking-widest rounded-md hover:bg-blue-500/10">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-5 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-serif-display text-white">Attending</h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest">RSVP</span>
          </div>

          {myJoinedEvents.length === 0 ? (
            <p className="text-gray-500 text-sm italic">You haven't joined any events yet.</p>
          ) : (
            <div className="grid gap-4">
              {myJoinedEvents.map((event) => (
                <button key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="group surface-soft p-5 rounded-lg text-left hover:bg-white/[0.065] transition-colors">
                  <h3 className="text-lg font-serif-display text-gray-200 group-hover:text-white transition-colors">{event.title}</h3>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500 font-sans-body tracking-wide uppercase">
                    <span>{event.venue}</span>
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-5 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-serif-display text-white">Saved</h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Bookmarks</span>
          </div>

          {savedEvents.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Saved events will appear here.</p>
          ) : (
            <div className="grid gap-4">
              {savedEvents.map((event) => (
                <button key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="group surface-soft p-5 rounded-lg text-left hover:bg-white/[0.065] transition-colors">
                  <h3 className="text-lg font-serif-display text-gray-200 group-hover:text-white transition-colors">{event.title}</h3>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500 font-sans-body tracking-wide uppercase">
                    <span>{event.venue}</span>
                    <span>{event.attendee_count || 0}/{event.capacity}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
