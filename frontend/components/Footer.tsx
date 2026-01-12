import { useLocations } from '@/hooks/useLocations';

const Footer: React.FC = () => {
  const { districts } = useLocations();

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
              <li><a href="/search" className="hover:text-white">All Schools</a></li>
              <li><a href="/search" className="hover:text-white">All Schools</a></li>
              <li><a href="/search?search=govt" className="hover:text-white">Government Schools</a></li>
              <li><a href="/search?search=private" className="hover:text-white">Private Schools</a></li>
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
        {/* Dynamic District Links - Full Width Section */}
        {districts.length > 0 && (
          <div className="border-t border-slate-800 mt-12 pt-8">
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              Schools by District (Full List)
            </h4>
            <div className="h-auto overflow-visible">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                {districts.map(d => (
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
