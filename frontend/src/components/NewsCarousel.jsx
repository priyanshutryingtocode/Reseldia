import { useEffect, useState } from 'react';
import axios from 'axios';

const FALLBACK_ITEMS = [
  {
    id: 'fallback-1',
    category: "Announcement",
    title: "Welcome to Reseldia",
    description: "Community announcements will appear here once an admin publishes them.",
    image_url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 'fallback-2',
    category: "Community Event",
    title: "Plan the Next Gathering",
    description: "Create events, track RSVPs, and keep everyone in the loop from one shared board.",
    image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000",
  }
];

export default function NewsCarousel() {
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/announcements`, {
          headers: { Authorization: token }
        });
        if (res.data.length > 0) {
          setItems(res.data);
          setCurrentIndex(0);
        }
      } catch {
        setItems(FALLBACK_ITEMS);
      }
    };

    fetchAnnouncements();
  }, [API_URL]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  return (
    <div
      className="relative w-full h-[320px] md:h-[360px] rounded-lg overflow-hidden border border-white/10 group mb-8 surface"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-black">
            <img
              src={item.image_url || FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].image_url}
              alt={item.title}
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                index === currentIndex ? 'scale-110' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0f] via-[#0b0c0f]/56 to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full max-w-3xl">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest text-blue-100 uppercase bg-white/10 border border-white/15 rounded backdrop-blur-md">
              {item.category}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif-display text-white mb-4 leading-tight drop-shadow-lg">
              {item.title}
            </h2>
            <p className="text-gray-300 font-sans-body text-sm md:text-base leading-relaxed max-w-xl">
              {item.description}
            </p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-7 right-7 z-20 flex gap-3">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Show announcement ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-20">
        <div
          key={currentIndex}
          className={`h-full bg-blue-500/50 ${!isPaused ? 'animate-[progress_5s_linear]' : 'w-full'}`}
        ></div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
