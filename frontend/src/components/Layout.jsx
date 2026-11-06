import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0c0f] text-white font-sans-body selection:bg-white selection:text-black">

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
