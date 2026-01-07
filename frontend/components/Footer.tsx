import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">GetSchoolInfo</h3>
            <p className="text-sm leading-relaxed">
              Empowering parents with government-verified data to make informed decisions about their child's education.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Search Schools</a></li>
              <li><a href="#" className="hover:text-white">Compare Schools</a></li>
              <li><a href="#" className="hover:text-white">Audit Reports</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Data</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Methodology</a></li>
              <li><a href="#" className="hover:text-white">Government Sources</a></li>
              <li><a href="#" className="hover:text-white">Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@getschoolinfo.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
          © {new Date().getFullYear()} GetSchoolInfo. All rights reserved. Data updated Feb 2025.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
