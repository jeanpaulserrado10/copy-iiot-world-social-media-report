import React from 'react';
import { ReportData } from '../../../types';

interface MetricsTabProps {
  reportData: ReportData;
  updateField: (path: string[], value: any) => void;
}

const MetricsTab: React.FC<MetricsTabProps> = ({ reportData, updateField }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <h3 className="font-black text-[#e64d25] uppercase text-xs tracking-widest">X (Twitter) Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
             {Object.entries(reportData.xMetrics).map(([key, val]) => (
                <div key={key} className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">{key}</label>
                   <input 
                     value={val}
                     onChange={(e) => updateField(['xMetrics', key], e.target.value)}
                     className="w-full p-2 bg-gray-50 rounded-lg text-sm font-black text-[#283b82] border-b-2 border-transparent focus:border-[#e64d25] outline-none"
                   />
                </div>
             ))}
          </div>
       </div>
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">LinkedIn Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
             {Object.entries(reportData.linkedinMetrics).map(([key, val]) => (
                <div key={key} className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                   <input 
                     value={val}
                     onChange={(e) => updateField(['linkedinMetrics', key], e.target.value)}
                     className="w-full p-2 bg-gray-50 rounded-lg text-sm font-black text-[#283b82] border-b-2 border-transparent focus:border-[#283b82] outline-none"
                   />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default MetricsTab;