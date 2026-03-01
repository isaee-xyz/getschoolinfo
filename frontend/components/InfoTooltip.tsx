import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  return (
    <div className="relative group ml-1 inline-flex items-center">
      <Info className="w-3 h-3 cursor-help transition-colors" style={{ color: 'var(--gsi-border)' }} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-white text-[11px] leading-relaxed p-2.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-20 text-center font-normal shadow-lg" style={{ background: '#1A1A1A' }}>
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#1A1A1A' }}></div>
      </div>
    </div>
  );
};

export default InfoTooltip;
