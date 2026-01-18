import { useState, useEffect } from 'react';

const NEWS_ITEMS = [
  {
    id: 1,
    category: "Announcement",
    title: "Pool Maintenance Schedule",
    description: "The main swimming pool will be closed for deep cleaning and pH balancing from Oct 10th to Oct 12th.",
    image: "https://img.freepik.com/free-photo/umbrella-chair_74190-2092.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    id: 2,
    category: "Community Event",
    title: "Saturday Night Jazz",
    description: "Join us at the clubhouse rooftop for an evening of smooth jazz and cocktails. 8:00 PM onwards.",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 3,
    category: "Security Update",
    title: "New Gate Access System",
    description: "We are upgrading to biometric entry systems starting next week. Please register your fingerprints at the office.",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2000",
  }
];

export default function NewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {NEWS_ITEMS.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-black">
            <img 
              src={item.image} 
              alt={item.title} 
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                index === currentIndex ? 'scale-110' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 p-10 w-full max-w-3xl">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest text-blue-200 uppercase bg-blue-500/20 border border-blue-500/30 rounded backdrop-blur-md">
              {item.category}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif-display text-white mb-4 leading-tight drop-shadow-lg">
              {item.title}
            </h2>
            <p className="text-gray-300 font-sans-body text-sm md:text-base leading-relaxed max-w-xl">
              {item.description}
            </p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-10 right-10 z-20 flex gap-3">
        {NEWS_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === currentIndex 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
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