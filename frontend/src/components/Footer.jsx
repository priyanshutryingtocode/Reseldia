export default function Footer() {
  return (
    <footer className="bg-[#0a0a0c] border-t border-white/10 mt-auto backdrop-blur-sm z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <h3 className="font-serif-display text-2xl text-white tracking-wide mb-2">
              <span className="italic opacity-60">Re</span>seldia
            </h3>
            <p className="text-xs text-gray-500 font-sans-body tracking-wider uppercase">
              The Exclusive Community Platform
            </p>
          </div>

          <div className="flex space-x-8 text-xs font-sans-body tracking-widest uppercase text-gray-500">
            <a href="#" className="hover:text-white transition-colors duration-300">About</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-[10px] text-gray-600 tracking-[0.2em] uppercase">
            &copy; {new Date().getFullYear()} Reseldia Collection. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}