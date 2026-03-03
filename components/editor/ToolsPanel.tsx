
import React from 'react';
import { Icon } from '../Icon';
import { ReportMetadata } from '../../services/firebaseService';
import { ReportData } from '../../types';

interface ToolsPanelProps {
  metadata: any;
  previousReports: ReportMetadata[];
  selectedReportIds: string[];
  setSelectedReportIds: (ids: string[]) => void;
  handleGenerateCumulative: () => void;
  isGeneratingTool: boolean;
  handleImportReportSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  importSlidesList: any[];
  handleImportSlide: (slide: any) => void;
  reportData: ReportData; // Kept for interface compatibility even if unused directly here
  setReportData: (data: ReportData) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({
  metadata, previousReports, selectedReportIds, setSelectedReportIds,
  handleGenerateCumulative, isGeneratingTool, handleImportReportSelect,
  importSlidesList, handleImportSlide, reportData, setReportData
}) => {
  
  return (
    <div className="space-y-8 animate-fadeIn">
       
       {/* CUMULATIVE SLIDE GENERATOR */}
       <div className="p-8 bg-orange-50 rounded-[2rem] border-2 border-orange-100">
           <h3 className="text-lg font-black text-[#e64d25] uppercase mb-4 flex items-center gap-2">
              <Icon type="GROWTH" className="w-5 h-5"/> Campaign Accumulator
           </h3>
           <p className="text-sm text-gray-600 mb-6 font-medium">Select previous reports from the <strong>same collection</strong> to generate a cumulative comparison slide.</p>
           
           <div className="max-h-60 overflow-y-auto bg-white rounded-xl border p-4 mb-6 space-y-2">
               {previousReports.length === 0 && <div className="text-xs text-gray-400 p-2 font-bold uppercase">No reports available in this collection for aggregation.</div>}
               {previousReports.map(r => (
                   <label key={r.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                       <input 
                          type="checkbox" 
                          checked={selectedReportIds.includes(r.id)}
                          onChange={(e) => {
                              if(e.target.checked) setSelectedReportIds([...selectedReportIds, r.id]);
                              else setSelectedReportIds(selectedReportIds.filter(id => id !== r.id));
                          }}
                          className="w-5 h-5 accent-[#e64d25]" 
                       />
                       <div>
                           <div className="text-sm font-black text-[#283b82]">{r.title}</div>
                           <div className="text-[10px] text-gray-400 font-bold uppercase">{r.updatedAt ? new Date(r.updatedAt.seconds * 1000).toLocaleDateString() : 'Draft'}</div>
                       </div>
                   </label>
               ))}
           </div>
           <button onClick={handleGenerateCumulative} disabled={isGeneratingTool || selectedReportIds.length === 0} className="w-full py-4 bg-[#e64d25] text-white font-black uppercase rounded-2xl text-xs tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-xl">
               {isGeneratingTool ? 'Calculating & Generating...' : 'Generate Cumulative Slide'}
           </button>
       </div>

       {/* SLIDE IMPORTER */}
       <div className="p-8 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
           <h3 className="text-lg font-black text-[#283b82] uppercase mb-4 flex items-center gap-2">
              <Icon type="DOCS" className="w-5 h-5"/> Slide Importer
           </h3>
           <p className="text-sm text-gray-600 mb-6 font-medium">Import specific slides from ANY of your reports.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-bold text-gray-400 uppercase">1. Select Source Report</label>
                 <select onChange={handleImportReportSelect} className="w-full p-4 bg-white rounded-xl text-xs font-bold text-gray-600 border-none outline-none shadow-sm h-14">
                     <option value="">Select Report...</option>
                     {/* Importer shows ALL reports for convenience */}
                     {previousReports.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                 </select>
               </div>
               <div className="bg-white rounded-xl p-2 max-h-60 overflow-y-auto shadow-sm">
                   {importSlidesList.length === 0 && <div className="text-xs text-gray-400 p-4 font-bold text-center h-full flex items-center justify-center">Select a report to view slides</div>}
                   {importSlidesList.map(slide => (
                       <div key={slide.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-0">
                           <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{slide.label}</span>
                           <button onClick={() => handleImportSlide(slide)} className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">Import</button>
                       </div>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
};

export default ToolsPanel;
