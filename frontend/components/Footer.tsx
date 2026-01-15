"use client";

import { useLocations } from '@/hooks/useLocations';

const Footer: React.FC = () => {
  const { districts } = useLocations();

  const handleSmartSearch = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Simple location detection for "Near Me" experience
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.city) {
          window.location.href = `/search?search=${encodeURIComponent(data.city)}`;
          return;
        }
      }
    } catch (err) { console.error(err); }
    window.location.href = '/search'; // Fallback
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">GetSchoolsInfo</h3>
            <p className="text-sm leading-relaxed">
              Empowering parents with government-verified data to make informed decisions about their child's education.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/search" onClick={handleSmartSearch} className="hover:text-white flex items-center gap-2">
                  All Schools
                  <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">Near Me</span>
                </a>
              </li>
              {/* Removed Govt/Private filters as requested */}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Data & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about-us" className="hover:text-white">About Us</a></li>
              <li><a href="/about-us#methodology" className="hover:text-white">Methodology</a></li>
              <li><a href="/disclaimer" className="hover:text-white">Disclaimer</a></li>
              <li><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:info@getschoolsinfo.com" className="hover:text-white">info@getschoolsinfo.com</a></li>
            </ul>
          </div>
        </div>
        {/* Dynamic District Links - Full Width Section */}
        {districts.length > 0 && (
          <div className="border-t border-slate-800 mt-12 pt-8">
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              Schools by District (Full List)
            </h4>
            <div className="h-auto overflow-visible">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                {Array.from(new Set(districts.map(d => d.name))).map(d => (
                  <a
                    key={d}
                    href={`/search?district=${encodeURIComponent(d)}`}
                    className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 py-1.5 px-2 rounded transition-colors truncate"
                    title={`Schools in ${d}`}
                  >
                    {d}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} GetSchoolInfo. All rights reserved. Data updated Feb 2025.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
