
import React from 'react';
import { AdConfig } from '../types';

interface AdPlaceholderProps {
  position: 'top' | 'middle' | 'bottom';
  ads: AdConfig[];
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ position, ads }) => {
  const ad = ads.find(a => a.position === position && a.enabled);
  
  if (!ad) return null;

  return (
    <div className={`w-full flex justify-center my-6 animate-pulse`}>
      <div className={`
        ${position === 'top' || position === 'bottom' ? 'max-w-[728px] h-[90px]' : 'max-w-[300px] h-[250px]'}
        w-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs font-mono overflow-hidden
      `}>
        <div className="text-center p-4">
          <p className="mb-2 uppercase tracking-widest text-[10px] opacity-50">Advertisement</p>
          <p className="text-sm font-semibold">{ad.code}</p>
        </div>
      </div>
    </div>
  );
};

export default AdPlaceholder;
