import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CommentSection({ eventId }) {
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
    <div className="mt-6 pt-6 border-t border-white/10">
      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Discussion</h3>
      
      {/* List */}
      <div className="space-y-3 max-h-40 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-white/20">
        {comments.length === 0 && <p className="text-gray-500 text-xs">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="bg-white/5 p-3 rounded-lg">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-blue-300 text-xs font-bold">{c.full_name}</span>
                <span className="text-gray-600 text-[10px]">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-300 text-sm">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          placeholder="Ask a question..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="text-xs bg-white text-black px-3 py-2 rounded-lg font-bold uppercase hover:bg-gray-200">Post</button>
      </form>
    </div>
  );
}