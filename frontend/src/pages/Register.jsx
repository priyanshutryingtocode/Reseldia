import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    flat_number: '',
    role: 'resident'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0c] text-white py-10">
      

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
        .font-sans-body { font-family: 'Inter', sans-serif; }
        .bg-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E");
        }
      `}</style>


      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#13161c] to-[#0a0a0c]"></div>
      <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 bg-grain pointer-events-none z-0"></div>


      <div className="relative z-10 w-full max-w-md p-8 md:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl">
        
        <div className="text-center mb-10">
          <h2 className="font-serif-display text-3xl md:text-4xl text-white mb-2 tracking-wide">Membership</h2>
          <p className="font-sans-body text-gray-400 text-xs md:text-sm tracking-widest uppercase">Join the Reseldia Community</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 mb-6 text-sm text-center font-sans-body tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-sans-body">

          <div className="space-y-1">
            <label className="text-gray-400 text-xs tracking-widest uppercase ml-1">Full Name</label>
            <input 
              name="full_name" 
              onChange={handleChange} 
              required 
              className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-black/40 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 text-xs tracking-widest uppercase ml-1">Residence / Flat No.</label>
            <input 
              name="flat_number" 
              onChange={handleChange} 
              placeholder="e.g. Unit 402" 
              className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-black/40 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 text-xs tracking-widest uppercase ml-1">Email</label>
            <input 
              type="email" 
              name="email" 
              onChange={handleChange} 
              required 
              className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-black/40 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 text-xs tracking-widest uppercase ml-1">Set Password</label>
            <input 
              type="password" 
              name="password" 
              onChange={handleChange} 
              required 
              className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-black/40 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-6 bg-white text-black font-semibold tracking-widest text-xs uppercase transition-all duration-500 hover:bg-gray-200 hover:tracking-[0.2em]
            ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? 'Processing...' : 'Confirm Registration'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-sans-body text-gray-500 text-sm">
            Already a member?{' '}
            <Link to="/login" className="text-white border-b border-transparent hover:border-white transition-all pb-0.5 ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}