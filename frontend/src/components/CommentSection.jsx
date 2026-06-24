import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../lib/api';
import { useToast } from './toastContext';

export default function CommentSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/api/events/${eventId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/api/events/${eventId}/comments`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
      showToast('Comment posted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to post comment.'), 'error');
    }
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
