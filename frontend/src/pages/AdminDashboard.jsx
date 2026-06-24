import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import { useToast } from '../components/toastContext';

const emptyAnnouncement = {
  title: '',
  description: '',
  category: 'Announcement',
  image_url: '',
  is_active: true
};

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchAdminData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [pendingRes, announcementRes] = await Promise.all([
        api.get('/api/events/pending'),
        api.get('/api/announcements/all')
      ]);
      setPendingEvents(pendingRes.data);
      setAnnouncements(announcementRes.data);
    } catch {
      setError('Access denied. Admin privileges required.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/events/approve/${id}`);
      setPendingEvents(prev => prev.filter(event => event.id !== id));
      showToast('Event approved.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error approving event.'), 'error');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this event?")) return;
    try {
      await api.put(`/api/events/reject/${id}`);
      setPendingEvents(prev => prev.filter(event => event.id !== id));
      showToast('Event rejected.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error rejecting event.'), 'error');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      const request = editingAnnouncementId
        ? api.put(`/api/announcements/${editingAnnouncementId}`, announcementForm)
        : api.post('/api/announcements', announcementForm);
      const res = await request;

      setAnnouncements(prev => {
        if (editingAnnouncementId) {
          return prev.map(item => item.id === editingAnnouncementId ? res.data : item);
        }
        return [res.data, ...prev];
      });
      setAnnouncementForm(emptyAnnouncement);
      setEditingAnnouncementId(null);
      showToast(editingAnnouncementId ? 'Announcement updated.' : 'Announcement published.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to save announcement.'), 'error');
    }
  };

  const startEditAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementForm({
      title: announcement.title,
      description: announcement.description,
      category: announcement.category,
      image_url: announcement.image_url || '',
      is_active: announcement.is_active
    });
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      showToast('Announcement deleted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete announcement.'), 'error');
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse">Loading...</div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <div className="text-red-400 text-xl font-serif-display mb-4">{error}</div>
      <button onClick={() => navigate('/')} className="text-white underline text-sm tracking-widest uppercase">Return Home</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif-display text-white mb-2">Admin Center</h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase">Moderation and announcements</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-xs tracking-widest uppercase transition-colors">
          Exit
        </button>
      </div>

      <section className="surface rounded-lg overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-white font-serif-display text-lg tracking-wide">Pending Approvals</h2>
          {pendingEvents.length > 0 && (
            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs px-3 py-1 font-bold rounded">
              {pendingEvents.length} Awaiting
            </span>
          )}
        </div>

        <div className="p-6">
          {pendingEvents.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-green-400 text-xl font-serif-display mb-2">All Clear</p>
              <p className="text-gray-600 text-sm tracking-widest uppercase">No pending actions required</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {pendingEvents.map(event => (
                <li key={event.id} className="flex flex-col md:flex-row justify-between items-start md:items-center surface-soft p-5 rounded-lg">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-serif-display text-xl text-white mb-1">{event.title}</h3>
                    <div className="flex gap-4 text-xs text-gray-500 font-sans-body tracking-wide uppercase">
                      <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      <span>{event.venue}</span>
                      <span>{event.attendee_count || 0}/{event.capacity}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2 font-mono">Organizer ID: {event.organizer_id}</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(event.id)} className="px-6 py-2 bg-white text-black rounded-md text-xs font-bold tracking-widest uppercase hover:bg-green-400 transition-colors">
                      Approve
                    </button>
                    <button onClick={() => handleReject(event.id)} className="px-6 py-2 border border-white/10 text-red-400 rounded-md text-xs font-bold tracking-widest uppercase hover:bg-red-500/10 transition-colors">
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleAnnouncementSubmit} className="surface rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-white font-serif-display text-xl">{editingAnnouncementId ? 'Edit Announcement' : 'New Announcement'}</h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Shown in the dashboard carousel</p>
          </div>

          <input className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring" placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))} required />
          <textarea className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring resize-none" rows="4" placeholder="Description" value={announcementForm.description} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, description: e.target.value }))} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring" placeholder="Category" value={announcementForm.category} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, category: e.target.value }))} />
            <label className="flex items-center gap-3 text-sm text-gray-300 bg-black/20 border border-white/10 rounded-md px-4">
              <input type="checkbox" checked={announcementForm.is_active} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, is_active: e.target.checked }))} />
              Active
            </label>
          </div>
          <input className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus-ring" placeholder="Image URL" value={announcementForm.image_url} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, image_url: e.target.value }))} />

          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-3 bg-white text-black rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              {editingAnnouncementId ? 'Save' : 'Publish'}
            </button>
            {editingAnnouncementId && (
              <button type="button" onClick={() => { setEditingAnnouncementId(null); setAnnouncementForm(emptyAnnouncement); }} className="px-5 py-3 border border-white/10 text-gray-300 rounded-md text-xs font-bold uppercase tracking-widest">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="surface rounded-lg p-6">
          <h2 className="text-white font-serif-display text-xl mb-4">Announcements</h2>
          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements yet.</p>
            ) : announcements.map(announcement => (
              <div key={announcement.id} className="surface-soft rounded-lg p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{announcement.title}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{announcement.category} - {announcement.is_active ? 'Active' : 'Hidden'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditAnnouncement(announcement)} className="text-xs text-blue-300 hover:text-white uppercase tracking-widest">Edit</button>
                    <button onClick={() => deleteAnnouncement(announcement.id)} className="text-xs text-red-300 hover:text-red-200 uppercase tracking-widest">Delete</button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-3 line-clamp-2">{announcement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
