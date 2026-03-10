import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    venue: '',
    capacity: 50
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API_URL}/api/events`, formData, {
        headers: { Authorization: token }
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to create event. ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#0f1115]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
        
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

        <h1 className="text-4xl font-serif-display text-white mb-8 text-center">New Activity</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 font-sans-body">
          
          <div className="space-y-2">
            <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Event Title</label>
            <input 
                name="title" 
                onChange={handleChange} 
                required 
                className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" 
                placeholder="e.g., Rooftop Jazz Night" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Description</label>
            <textarea 
                name="description" 
                onChange={handleChange} 
                rows="4"
                className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none" 
                placeholder="Describe the details..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Date & Time</label>
              <input 
                type="datetime-local" 
                name="event_date" 
                onChange={handleChange} 
                required 
                className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Capacity</label>
              <input 
                type="number" 
                name="capacity" 
                onChange={handleChange} 
                defaultValue={50} 
                className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-xs tracking-widest uppercase pl-1">Venue</label>
            <input 
                name="venue" 
                onChange={handleChange} 
                required 
                className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" 
                placeholder="e.g., The Grand Hall" 
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 py-4 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-xs font-bold tracking-widest uppercase transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-4 bg-white text-black hover:bg-gray-200 text-xs font-bold tracking-widest uppercase transition-all">
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}