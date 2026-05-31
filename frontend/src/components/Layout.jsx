import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0c0f] text-white font-sans-body selection:bg-white selection:text-black">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
        .font-sans-body { font-family: 'Inter', sans-serif; }
        
        .bg-grain-app {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .surface {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
        }

        .surface-soft {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.075);
        }

        .focus-ring {
          transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
        }

        .focus-ring:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.28);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
        }
      `}</style>

      <div className="fixed inset-0 bg-grain-app z-0"></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(74,91,126,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_30%)]"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
