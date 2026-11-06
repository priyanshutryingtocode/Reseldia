import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../lib/api';
import { useToast } from './toastContext';

export default function CommentSection({ eventId, collapsible = false }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(!collapsible);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (collapsible && !isOpen) return undefined;

    let cancelled = false;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/events/${eventId}/comments`);
        if (!cancelled) setComments(res.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      cancelled = true;
    };
  }, [eventId, isOpen, collapsible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;

    try {
      const res = await api.post(`/api/events/${eventId}/comments`, { text });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      showToast('Comment posted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to post comment.'), 'error');
    }
  };

  const body = (
    <div className="animate-fade-in">
      <div className={`space-y-3 overflow-y-auto mb-4 pr-2 ${collapsible ? 'max-h-40' : 'max-h-96'}`}>
        {loading ? (
          <p className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No comments yet.{collapsible ? '' : ' Be the first to start the conversation.'}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-black/20 p-3 rounded-md border border-white/5 text-sm">
              <div className="flex justify-between items-baseline mb-1 gap-3">
                <span className={`text-xs font-bold ${collapsible ? 'text-gray-300' : 'text-blue-300'}`}>{comment.full_name}</span>
                <span className="text-gray-600 text-[10px] uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs text-white focus-ring"
          placeholder="Type a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          aria-label="Comment text"
        />
        <button type="submit" className="text-[10px] bg-white text-black px-4 py-2 rounded-md font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
          Post
        </button>
      </form>
    </div>
  );

  if (collapsible) {
    return (
      <div className="mt-4 border-t border-white/5 pt-4">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="text-[10px] text-blue-300 hover:text-white uppercase tracking-wider mb-3 transition-colors"
        >
          {isOpen ? 'Close discussion' : 'Discuss'}
        </button>
        {isOpen && body}
      </div>
    );
  }

  return (
    <div className="surface-soft rounded-lg p-6">
      <h3 className="text-white font-serif-display text-xl mb-6">Discussion Board</h3>
      {body}
    </div>
  );
}
