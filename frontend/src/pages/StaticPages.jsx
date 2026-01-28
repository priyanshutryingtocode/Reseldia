import { useNavigate } from 'react-router-dom';

const InfoLayout = ({ title, date, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-[80px] pointer-events-none"></div>

        <h1 className="text-4xl md:text-5xl font-serif-display text-white mb-4">{title}</h1>
        {date && <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Last Updated: {date}</p>}
        
        <div className="space-y-6 text-gray-300 font-sans-body leading-relaxed text-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export const About = () => (
  <InfoLayout title="About Reseldia">
    <p>
      Reseldia is a next-generation community management platform designed to bring neighbors together. 
      Born from the need for a more transparent and engaging way to manage residential societies, 
      we combine modern technology with the warmth of community living.
    </p>
    <p>
      Our mission is simple: <strong>To foster connections that turn a housing complex into a home.</strong>
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
            <h3 className="text-white font-serif-display text-xl mb-2">Connect</h3>
            <p className="text-sm text-gray-400">Bridging the gap between residents through events and forums.</p>
        </div>
        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
            <h3 className="text-white font-serif-display text-xl mb-2">Organize</h3>
            <p className="text-sm text-gray-400">Streamlining amenities, voting, and issue resolution.</p>
        </div>
        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
            <h3 className="text-white font-serif-display text-xl mb-2">Secure</h3>
            <p className="text-sm text-gray-400">Ensuring privacy and safety for all community data.</p>
        </div>
    </div>
  </InfoLayout>
);

export const Privacy = () => (
  <InfoLayout title="Privacy Policy" date="January 2026">
    <p>Your privacy is critically important to us. At Reseldia, we have a few fundamental principles:</p>
    <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
      <li>We don’t ask you for personal information unless we truly need it.</li>
      <li>We don’t share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
      <li>We don’t store personal information on our servers unless required for the on-going operation of one of our services.</li>
    </ul>
    <h3 className="text-2xl text-white font-serif-display mt-8 mb-4">Data We Collect</h3>
    <p>
        We only collect basic resident information (Name, Flat Number, Email) required to verify identity within the society. 
        This data is encrypted and accessible only to authorized administrators.
    </p>
  </InfoLayout>
);

export const Terms = () => (
  <InfoLayout title="Terms of Service" date="January 2026">
    <p>
      By accessing or using Reseldia, you agree to be bound by these terms. If you disagree with any part of the terms, 
      then you may not access the service.
    </p>
    <h3 className="text-white font-serif-display text-xl mt-6 mb-2">1. Use License</h3>
    <p>
      Permission is granted to temporarily download one copy of the materials (information or software) on Reseldia's website for personal, 
      non-commercial transitory viewing only.
    </p>
    <h3 className="text-white font-serif-display text-xl mt-6 mb-2">2. Conduct</h3>
    <p>
      Users are expected to maintain civil discourse in community forums. Harassment, hate speech, or spam will result in immediate account suspension.
    </p>
  </InfoLayout>
);

export const Contact = () => (
  <InfoLayout title="Contact Support">
    <p>Have a question or feedback? We'd love to hear from you.</p>
    
    <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div>
            <h3 className="text-white text-lg font-bold mb-2">General Inquiries</h3>
            <a href="mailto:hello@reseldia.com" className="text-blue-400 hover:text-white transition-colors text-xl">hello@reseldia.com</a>
        </div>
        <div>
            <h3 className="text-white text-lg font-bold mb-2">Technical Support</h3>
            <a href="mailto:support@reseldia.com" className="text-blue-400 hover:text-white transition-colors text-xl">support@reseldia.com</a>
        </div>
    </div>

    <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-200">
            <strong>Note:</strong> For urgent society-related issues (e.g., water leakage, security), please contact your building admin directly via the Dashboard.
        </p>
    </div>
  </InfoLayout>
);