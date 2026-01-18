import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role); 
      
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0c] text-white">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
        .font-sans-body { font-family: 'Inter', sans-serif; }
        .bg-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#13161c] to-[#0a0a0c]"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
      <div className="absolute inset-0 bg-grain pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl">
        
        <div className="text-center mb-10">
          <h2 className="font-serif-display text-4xl text-white mb-2 tracking-wide">Welcome Back</h2>
          <p className="font-sans-body text-gray-400 text-sm tracking-widest uppercase">Access your personal dashboard</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 mb-6 text-sm text-center font-sans-body tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-sans-body">

          <div className="space-y-2">
            <label htmlFor="email" className="block text-gray-400 text-xs tracking-widest uppercase">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-black/40 transition-all duration-300"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-gray-400 text-xs tracking-widest uppercase">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-black/40 transition-all duration-300"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-xs text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-4 bg-white text-black font-semibold tracking-widest text-xs uppercase transition-all duration-500 hover:bg-gray-200 hover:tracking-[0.2em]
              ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Enter Portal'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-sans-body text-gray-500 text-sm">
            New to Reseldia?{' '}
            <Link to="/register" className="text-white border-b border-transparent hover:border-white transition-all pb-0.5 ml-1">
              Apply for membership
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}