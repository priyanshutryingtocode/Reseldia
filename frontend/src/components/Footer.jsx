export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-800">CommunityBoard</h3>
            <p className="text-sm text-gray-500 mt-1">Connect, Share, and Participate.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">About</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">Terms</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">Contact</a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Community Board Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}