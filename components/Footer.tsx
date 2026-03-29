import React from 'react';
import { Target } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-white py-12 sm:py-16 md:py-20 rounded-t-2xl sm:rounded-t-[2.5rem] md:rounded-t-[3rem] mt-4 sm:mt-6 md:mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

        {/* Top: CTA + Email */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 sm:mb-16">
          <div className="mb-8 md:mb-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Target size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Ovi<span className="text-blue-400">Select</span>
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 max-w-xs leading-relaxed">
              The AI counselling OS for engineering admissions in India. From rank to right college — intelligently.
            </p>
          </div>

          {/* Email Signup */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-900 border border-gray-700 rounded-full px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-300 w-full sm:w-80"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
              Join Waitlist
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 border-t border-gray-800 pt-10 sm:pt-12">
          <div>
            <h4 className="font-bold text-sm mb-4 sm:mb-5 text-white">Product</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors duration-200">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Prediction Engine</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Counselling Copilot</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 sm:mb-5 text-white">Counselling</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">JoSAA Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">State CETs</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">COMEDK</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">WBJEE</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 sm:mb-5 text-white">Company</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#about-us" className="hover:text-white transition-colors duration-200">About</a></li>
              <li><a href="#team" className="hover:text-white transition-colors duration-200">Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 sm:mb-5 text-white">Legal</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs sm:text-sm gap-3">
          <p>© 2026 OviSelect Inc. (by Team Oviqo). All rights reserved.</p>
          <div className="flex gap-5">
            <a href="https://www.linkedin.com/company/oviqo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">LinkedIn</a>
            <a href="https://www.instagram.com/oviqo_/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">Instagram</a>
            <a href="https://www.youtube.com/@Oviqolabs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">YouTube</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
