import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import { useToast } from '../components/toastContext';

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    venue: '',
    capacity: 50,
    category: 'General'
  });
  const [loading, setLoading] = useState(isEditing);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/api/events/${id}`);
        setFormData({
          title: res.data.title || '',
          description: res.data.description || '',
          event_date: toDateTimeLocal(res.data.event_date),
          venue: res.data.venue || '',
          capacity: res.data.capacity || 50,
          category: res.data.category || 'General'
        });
        setStatus(res.data.status || '');
      } catch (err) {
        showToast(getErrorMessage(err, 'Unable to load this event.'), 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isEditing, navigate, showToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const request = isEditing
        ? api.put(`/api/events/${id}`, formData)
        : api.post('/api/events', formData);

      await request;
      showToast(isEditing ? 'Event updated.' : 'Event submitted.', 'success');
      navigate(isEditing ? `/events/${id}` : '/dashboard');
    } catch (err) {
      showToast(getErrorMessage(err, `Failed to ${isEditing ? 'update' : 'create'} event.`), 'error');
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-400 animate-pulse">Loading event...</div>;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="surface w-full max-w-2xl rounded-lg p-8 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif-display text-white">{isEditing ? 'Edit Activity' : 'New Activity'}</h1>
          {status && (
            <span className="inline-block mt-3 px-3 py-1 text-[10px] tracking-widest uppercase rounded-full border border-white/10 text-gray-300 bg-white/5">
              {status}
            </span>
          )}
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">
            {isEditing ? 'Organizer edits return to moderation unless you are admin' : 'Submit an event for your community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-sans-body">
          <div className="space-y-2">
            <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Event Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white focus-ring" placeholder="e.g., Rooftop Jazz Night" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white focus-ring resize-none" placeholder="Describe the details..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Date & Time</label>
              <input type="datetime-local" name="event_date" value={formData.event_date} onChange={handleChange} required className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white focus-ring [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Capacity</label>
              <input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white focus-ring" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Venue</label>
              <input name="venue" value={formData.venue} onChange={handleChange} required className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white focus-ring" placeholder="e.g., The Grand Hall" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3 text-white focus-ring">
                <option value="General">General</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => navigate(isEditing ? `/events/${id}` : '/dashboard')} className="flex-1 py-4 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 rounded-md text-xs font-bold tracking-widest uppercase transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-4 bg-white text-black hover:bg-gray-200 rounded-md text-xs font-bold tracking-widest uppercase transition-all">
              {isEditing ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
