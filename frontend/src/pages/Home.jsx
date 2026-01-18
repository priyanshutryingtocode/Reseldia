import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
      
      {/* --- CSS FOR ANIMATIONS --- */}
      {/* Embedding this here ensures it works without editing your tailwind.config.js */}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-drift { animation: drift 10s infinite ease-in-out; }
        .animate-drift-slow { animation: drift 15s infinite ease-in-out reverse; }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 4s linear infinite; }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* 1. BACKGROUND LAYERS */}
      
      {/* A. Deep Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900"></div>
      
      {/* B. Animated Nebula Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-drift"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-drift-slow"></div>
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-drift"></div>

      {/* C. Noise Texture Overlay (The "Lavish" Detail) */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none z-0"></div>

      {/* 2. MAIN CONTENT CARD */}
      <div className="relative z-10 p-1">
        
        {/* Glowing border effect behind the card */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-12 md:p-16 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 transform rotate-3">
              <span className="text-3xl">✨</span>
            </div>
          </div>

          {/* Typography */}
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white animate-shimmer mb-6 drop-shadow-sm">
            Reseldia
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-lg mx-auto">
            Experience community like never before. Connect with neighbors, discover exclusive events, and shape your local world.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            
            {/* Login: "The Glowing Primary" */}
            <Link 
              to="/login" 
              className="group relative px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] w-full sm:w-auto"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative">Login to Account</span>
            </Link>

            {/* Register: "The Frosted Glass" */}
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 hover:border-white/30 transition-all hover:scale-105 backdrop-blur-md w-full sm:w-auto"
            >
              Register Now
            </Link>

          </div>

          {/* Footer Text */}
          <div className="mt-12 text-slate-500 text-xs tracking-widest uppercase">
            The Future of Community Living
          </div>

        </div>
      </div>
    </div>
  );
}