import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    venue: '',
    capacity: 50 // default
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:5000/api/events', formData, {
        headers: { Authorization: token }
      });
      alert('Event Created Successfully! 🎉');
      navigate('/dashboard'); // Go back to the board
    } catch (err) {
      alert('Failed to create event. ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">✨ Create New Activity</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Event Title</label>
            <input name="title" onChange={handleChange} required className="w-full border p-2 rounded" placeholder="e.g., Sunday Yoga" />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Description</label>
            <textarea name="description" onChange={handleChange} className="w-full border p-2 rounded" placeholder="What's happening?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">Date & Time</label>
              <input type="datetime-local" name="event_date" onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Capacity</label>
              <input type="number" name="capacity" onChange={handleChange} defaultValue={50} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Venue</label>
            <input name="venue" onChange={handleChange} required className="w-full border p-2 rounded" placeholder="e.g., Club House" />
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
              Post Event
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}