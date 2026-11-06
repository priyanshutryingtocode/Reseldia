import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0c] text-white">

      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#13161c] to-[#0a0a0c]"></div>
      
      <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-fog"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] animate-fog" style={{ animationDelay: '2s' }}></div>
      
      <div className="absolute inset-0 bg-grain pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        
        <p className="font-sans-body text-blue-200/60 text-xs md:text-sm tracking-[0.3em] uppercase mb-8">
          The Exclusive Community Platform
        </p>

        <h1 className="font-serif-display text-7xl md:text-8xl lg:text-9xl text-white mb-8 leading-none drop-shadow-2xl">
          <span className="italic opacity-80">Re</span>seldia
        </h1>

        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent mb-10"></div>

        <p className="font-sans-body text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-xl mx-auto mb-14">
          Connect with neighbors, curate exclusive events, and shape the culture of your local environment.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto font-sans-body">
          
          <Link 
            to="/login" 
            className="group relative px-10 py-4 bg-white text-black font-semibold tracking-wider text-sm transition-all duration-500 hover:tracking-widest overflow-hidden"
          >
            <span className="relative z-10">LOGIN</span>

            <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
          </Link>

          <Link 
            to="/register" 
            className="px-10 py-4 bg-transparent border border-white/20 text-white font-semibold tracking-wider text-sm transition-all duration-300 hover:bg-white hover:text-black hover:border-transparent"
          >
            BECOME A MEMBER
          </Link>

        </div>

        <div className="absolute bottom-[-15vh] md:bottom-[-20vh] text-white/10 text-[10px] tracking-widest font-sans-body">
        Made by Priyanshu Srivastava
        </div>

      </div>
    </div>
  );
}