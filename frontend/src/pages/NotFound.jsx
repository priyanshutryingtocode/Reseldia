import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0c] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#13161c] to-[#0a0a0c]"></div>
      <div className="absolute inset-0 bg-grain pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <p className="font-sans-body text-blue-200/60 text-xs tracking-[0.3em] uppercase mb-6">404</p>
        <h1 className="font-serif-display text-6xl md:text-7xl text-white mb-6 leading-none">Page not found</h1>
        <p className="font-sans-body text-gray-400 mb-10 max-w-md">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          to="/"
          className="px-8 py-4 bg-white text-black font-semibold tracking-wider text-xs uppercase transition-colors hover:bg-gray-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
