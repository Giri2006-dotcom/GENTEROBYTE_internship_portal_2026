'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function MobilePreviewWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isMobileView = searchParams?.get('view') === 'mobile';
  const isLandscape = searchParams?.get('orient') === 'landscape';

  if (isMobileView) {
    return (
      <div className="bg-navy-900 min-h-screen flex items-center justify-center py-10 px-4">
        {/* Phone Frame */}
        <div 
          className={`relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 ${
            isLandscape ? 'h-[375px] w-[812px]' : 'h-[812px] w-[375px]'
          }`}
        >
          <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
          <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
          
          <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
            {/* Status Bar Simulation */}
            <div className="absolute top-0 inset-x-0 h-6 bg-white z-50 flex justify-between px-6 items-end text-[10px] font-bold text-navy-900">
              <span>9:41</span>
              <div className="flex gap-1">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            
            <div className="h-full overflow-y-auto pt-6 scrollbar-hide">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
