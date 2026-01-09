import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  // State for all the fields we need
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    flat_number: '',
    role: 'resident' // Default role
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send data to backend
      await axios.post('http://localhost:5000/api/auth/register', formData);
      
      alert('Registration Successful! Please Login.');
      navigate('/login'); // Send them to login page
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">📝 Resident Sign Up</h1>
        
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Full Name</label>
            <input name="full_name" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Flat Number</label>
            <input name="flat_number" onChange={handleChange} placeholder="e.g. B-402" className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}