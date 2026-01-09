import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-4">Reseldia</h1>
      <p className="text-xl mb-8">Connect with your neighbors and join activities.</p>
      
      <div className="space-x-4">
        <Link 
          to="/login" 
          className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          Login
        </Link>
        
        <Link 
          to="/register" 
          className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}