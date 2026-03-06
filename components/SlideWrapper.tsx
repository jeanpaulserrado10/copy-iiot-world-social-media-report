
import React, { useRef, useEffect } from 'react';

interface SlideWrapperProps { 
  children: React.ReactNode; 
  title?: string; 
  noContainer?: boolean; 
  activeSlide: number; 
  totalSlides: number; 
  onDotClick?: (i: number) => void;
  clientName: string;
  campaignName: string;
  activeConfigs: any[];
  isPrint?: boolean;
  isPdf?: boolean;
}

const SlideWrapper: React.FC<SlideWrapperProps> = ({ children, title, noContainer, activeSlide, totalSlides, onDotClick, clientName, campaignName, activeConfigs, isPrint, isPdf }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top whenever the active slide changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeSlide]);

  return (
    <div className={`w-full ${!isPrint && !isPdf ? 'h-[80vh] min-h-[600px] max-h-[900px]' : isPdf ? 'min-h-[720px] h-auto' : 'min-h-[1050px]'} ${noContainer ? '' : 'bg-white rounded-xl shadow-2xl border-t-8 border-[#e64d25]'} ${isPdf ? 'overflow-visible' : 'overflow-hidden'} flex flex-col ${isPrint ? 'print:shadow-none print:border-none print:m-0 print:border-t-iiot-orange print:h-auto' : ''}`}>
       {!noContainer && (
         <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#e64d25] rounded flex items-center justify-center text-white text-[10px] font-black">II</div>
              <span className="font-black text-xs text-[#283b82] tracking-tighter">IIoT WORLD</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {clientName} | {campaignName}
            </div>
         </div>
       )}
       <div 
         ref={scrollContainerRef}
         className={`flex-grow ${noContainer ? '' : 'p-10'} ${!isPrint && !isPdf ? 'overflow-y-auto custom-scrollbar' : ''} ${noContainer ? 'flex flex-col' : ''}`}
       >
         {title && <h2 className="text-4xl font-extrabold text-[#3f3f3f] mb-10 border-l-8 border-[#e64d25] pl-6 uppercase tracking-tight shrink-0">{title}</h2>}
         {children}
       </div>
       {!isPrint && !isPdf && (
         <div className={`p-4 ${noContainer ? 'bg-[#e64d25]' : 'bg-gray-50 border-t border-gray-100'} flex justify-between items-center px-8 print:hidden shrink-0`}>
           <div className={`text-[10px] font-bold ${noContainer ? 'text-white/60' : 'text-gray-400'} uppercase tracking-widest`}>SLIDE {activeSlide + 1} OF {totalSlides}</div>
           <div className="flex gap-2">
             {activeConfigs.map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => onDotClick?.(i)}
                 className={`w-2.5 h-2.5 rounded-full transition-all ${activeSlide === i ? (noContainer ? 'bg-white w-6' : 'bg-[#e64d25] w-6') : (noContainer ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-200 hover:bg-gray-300')}`}
               />
             ))}
           </div>
         </div>
       )}
    </div>
  );
};

export default SlideWrapper;
