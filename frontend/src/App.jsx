import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails'; 
import { About, Privacy, Terms, Contact } from './pages/StaticPages';

import Layout from './components/Layout';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route path="/profile" element={<Profile />} />
              <Route path="/create" element={<CreateEvent />} />
              <Route path="/events/:id/edit" element={<CreateEvent />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
