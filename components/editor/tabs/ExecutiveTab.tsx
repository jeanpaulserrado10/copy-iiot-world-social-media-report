
import React, { useState } from 'react';
import { ReportData } from '../../../types';
import { Icon } from '../../Icon';

interface ExecutiveTabProps {
  reportData: ReportData;
  setReportData: (data: ReportData) => void;
  updateField: (path: string[], value: any) => void;
}

const ExecutiveTab: React.FC<ExecutiveTabProps> = ({ reportData, setReportData, updateField }) => {
  const [newMetric, setNewMetric] = useState({ label: '', value: '', icon: 'GROWTH', color: 'bg-[#e64d25]' });

  const addCustomMetric = () => {
    if (!newMetric.label || !newMetric.value) return;
    const newItem = {
        id: `custom-kpi-${Date.now()}`,
        ...newMetric
    };
    const current = reportData.customExecutiveMetrics || [];
    setReportData({ ...reportData, customExecutiveMetrics: [...current, newItem] });
    setNewMetric({ label: '', value: '', icon: 'GROWTH', color: 'bg-[#e64d25]' });
  };

  const removeCustomMetric = (id: string) => {
    const current = reportData.customExecutiveMetrics || [];
    setReportData({ ...reportData, customExecutiveMetrics: current.filter(c => c.id !== id) });
  };

  const handleActivityDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('activity_index', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleActivityDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleActivityDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('activity_index');
    if (!sourceIndexStr) return;
    
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const list = [...reportData.activitiesList];
    const [moved] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, moved);
    setReportData({ ...reportData, activitiesList: list });
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-8 animate-fadeIn">
       <div className="space-y-4">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Campaign Summary Narrative</h3>
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-medium border-2 border-gray-100 focus:border-[#e64d25] outline-none h-32"
            value={reportData.summaryOfActivities}
            onChange={(e) => updateField(['summaryOfActivities'], e.target.value)}
          />
       </div>
       
       <div className="space-y-4">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest flex justify-between items-center">
            <span>Campaign Activities List (Drag to Reorder)</span>
            <button onClick={() => setReportData({...reportData, activitiesList: [...reportData.activitiesList, { id: Date.now().toString(), text: 'New Activity', icon: 'DOCS', link: '' }]})} className="text-[#e64d25] text-[10px]">+ Add Item</button>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {reportData.activitiesList.map((activity, idx) => (
                <div 
                    key={idx} 
                    draggable
                    onDragStart={(e) => handleActivityDragStart(e, idx)}
                    onDragOver={handleActivityDragOver}
                    onDrop={(e) => handleActivityDrop(e, idx)}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 cursor-move hover:bg-gray-100 transition-colors"
                >
                   <div className="flex gap-2">
                      <div className="text-gray-300 font-bold px-1 self-center">☰</div>
                      <select 
                        value={activity.icon}
                        onChange={(e) => {
                            const next = [...reportData.activitiesList];
                            next[idx].icon = e.target.value;
                            setReportData({...reportData, activitiesList: next});
                        }}
                        className="bg-white p-2 rounded-lg text-[10px] font-bold border"
                      >
                         <option value="DOCS">DOCS</option>
                         <option value="SOCIAL">SOCIAL</option>
                         <option value="GROWTH">GROWTH</option>
                         <option value="STAR">STAR</option>
                      </select>
                      <input 
                        value={activity.text}
                        onChange={(e) => {
                            const next = [...reportData.activitiesList];
                            next[idx].text = e.target.value;
                            setReportData({...reportData, activitiesList: next});
                        }}
                        className="flex-grow p-2 bg-white rounded-lg text-[10px] font-medium border"
                        placeholder="Activity description"
                      />
                      <button onClick={() => setReportData({...reportData, activitiesList: reportData.activitiesList.filter((_, i) => i !== idx)})} className="text-red-400 font-bold px-2">×</button>
                   </div>
                   <div className="flex gap-2">
                       <input 
                         value={activity.link || ''}
                         onChange={(e) => {
                             const next = [...reportData.activitiesList];
                             next[idx].link = e.target.value;
                             setReportData({...reportData, activitiesList: next});
                         }}
                         className="flex-grow p-2 bg-white rounded-lg text-[10px] text-blue-500 border placeholder:text-gray-300"
                         placeholder="External URL (Optional)"
                       />
                       <select
                           value={activity.targetSlideId || ''}
                           onChange={(e) => {
                               const next = [...reportData.activitiesList];
                               next[idx].targetSlideId = e.target.value;
                               setReportData({...reportData, activitiesList: next});
                           }}
                           className="w-1/3 p-2 bg-white rounded-lg text-[10px] font-bold border text-gray-500"
                       >
                           <option value="">No Shortcut</option>
                           {reportData.slideSequence.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                       </select>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Standard KPI Selection */}
       <div className="space-y-4">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Standard KPI Selection</h3>
          <div className="flex flex-wrap gap-2">
             {[
               { id: 'xReach', label: 'X Reach' }, { id: 'xMentions', label: 'X Mentions' }, { id: 'xEngagement', label: 'X Eng.' }, { id: 'xRate', label: 'X Rate' },
               { id: 'liImpressions', label: 'LI Imp.' }, { id: 'liEngagement', label: 'LI Eng.' }, { id: 'liReactions', label: 'LI React.' }, { id: 'liPosts', label: 'LI Posts' }, { id: 'liViews', label: 'LI Views' }
             ].map(kpi => (
                <button 
                  key={kpi.id} 
                  onClick={() => {
                      const current = reportData.executiveKpiSelection || [];
                      const next = current.includes(kpi.id) ? current.filter(k => k !== kpi.id) : [...current, kpi.id];
                      setReportData({ ...reportData, executiveKpiSelection: next });
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${reportData.executiveKpiSelection.includes(kpi.id) ? 'bg-[#283b82] text-white border-[#283b82]' : 'bg-white text-gray-400 border-gray-200'}`}
                >
                   {kpi.label}
                </button>
             ))}
          </div>
       </div>

       {/* Custom KPI Creation */}
       <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Additional Custom KPIs (e.g. Leads)</h3>
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
             <div className="flex gap-2">
                <input className="w-1/3 p-2 bg-white rounded-lg text-xs" placeholder="Label (e.g. Leads)" value={newMetric.label} onChange={e => setNewMetric({...newMetric, label: e.target.value})} />
                <input className="w-1/3 p-2 bg-white rounded-lg text-xs" placeholder="Value (e.g. 50)" value={newMetric.value} onChange={e => setNewMetric({...newMetric, value: e.target.value})} />
                <select className="bg-white rounded-lg text-xs p-2" value={newMetric.color} onChange={e => setNewMetric({...newMetric, color: e.target.value})}>
                   <option value="bg-[#e64d25]">Orange</option>
                   <option value="bg-[#283b82]">Blue</option>
                   <option value="bg-gray-800">Black</option>
                </select>
                <button onClick={addCustomMetric} className="bg-blue-100 text-blue-600 px-4 rounded-lg font-black text-xs uppercase">Add</button>
             </div>
             
             {reportData.customExecutiveMetrics && reportData.customExecutiveMetrics.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                   {reportData.customExecutiveMetrics.map(cm => (
                      <div key={cm.id} className="flex justify-between items-center bg-white p-2 rounded-lg border">
                         <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${cm.color}`}></div>
                            <span className="text-[10px] font-bold">{cm.label}: {cm.value}</span>
                         </div>
                         <button onClick={() => removeCustomMetric(cm.id)} className="text-red-400 font-bold px-2">×</button>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default ExecutiveTab;
