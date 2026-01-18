import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PollWidget() {
  const [poll, setPoll] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPoll = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/polls/active`, {
             headers: { Authorization: token }
        });
        setPoll(res.data);
      } catch (e) { console.error(e); }
    };
    fetchPoll();
  }, []);

  const handleVote = async (optionId) => {
      const token = localStorage.getItem('token');
      try {
          await axios.post(`${API_URL}/api/polls/vote`, 
            { pollId: poll.id, optionId }, 
            { headers: { Authorization: token } }
          );
          // Refresh poll to show new counts
          window.location.reload(); 
      } catch (err) { alert("Already voted!"); }
  };

  if (!poll) return null;

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.vote_count, 0);

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 p-6 rounded-2xl mb-8">
      <h3 className="text-white font-serif-display text-xl mb-4">🗳️ Community Poll</h3>
      <p className="text-gray-300 text-sm mb-4 font-sans-body">{poll.question}</p>
      
      <div className="space-y-3">
        {poll.options.map(opt => {
          const percent = totalVotes === 0 ? 0 : Math.round((opt.vote_count / totalVotes) * 100);
          const isVoted = poll.userVotedOptionId === opt.id;

          return (
            <button 
              key={opt.id}
              onClick={() => !poll.userVotedOptionId && handleVote(opt.id)}
              disabled={!!poll.userVotedOptionId}
              className={`relative w-full text-left p-3 rounded-lg border ${isVoted ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} transition-all`}
            >
              {/* Progress Bar Background */}
              <div className="absolute top-0 left-0 h-full bg-white/10 rounded-lg transition-all duration-1000" style={{ width: `${percent}%` }}></div>
              
              <div className="relative flex justify-between items-center z-10">
                <span className="text-sm text-white font-bold">{opt.option_text}</span>
                <span className="text-xs text-gray-400">{percent}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-right text-xs text-gray-500 mt-2">{totalVotes} votes total</p>
    </div>
  );
}