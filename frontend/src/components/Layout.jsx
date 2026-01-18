// Layout.jsx
import { Outlet } from 'react-router-dom'; // <--- Make sure this is here
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />  {/* <--- This is where Dashboard renders */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;