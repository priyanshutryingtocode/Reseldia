import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PollWidget() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPoll = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/polls/active`, {
             headers: { Authorization: token }
        });
        setPoll(res.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
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
          window.location.reload(); 
      } catch (err) { alert("Already voted!"); }
  };

  if (loading) return <div className="h-full bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>;
  if (!poll) return null;

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.vote_count, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-6 rounded-2xl h-full shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-serif-display text-xl">Community Poll</h3>
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white tracking-widest uppercase">Vote</span>
        </div>
        <p className="text-gray-300 text-sm mb-6 font-sans-body leading-relaxed">{poll.question}</p>
        
        <div className="space-y-3">
            {poll.options.map(opt => {
            const percent = totalVotes === 0 ? 0 : Math.round((opt.vote_count / totalVotes) * 100);
            const isVoted = poll.userVotedOptionId === opt.id;

            return (
                <button 
                key={opt.id}
                onClick={() => !poll.userVotedOptionId && handleVote(opt.id)}
                disabled={!!poll.userVotedOptionId}
                className={`relative w-full text-left p-3 rounded-lg border overflow-hidden ${isVoted ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} transition-all group`}
                >
                <div className="absolute top-0 left-0 h-full bg-white/10 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                <div className="relative flex justify-between items-center z-10">
                    <span className="text-xs text-white font-bold tracking-wide">{opt.option_text}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{percent}%</span>
                </div>
                </button>
            );
            })}
        </div>
      </div>
      <p className="text-right text-[10px] text-gray-500 mt-4 uppercase tracking-widest">{totalVotes} votes total</p>
    </div>
  );
}