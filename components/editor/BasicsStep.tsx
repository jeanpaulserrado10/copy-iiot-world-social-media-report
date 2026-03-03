
import React from 'react';
import { CampaignMetadata } from '../../types';

interface BasicsStepProps {
  metadata: CampaignMetadata;
  setMetadata: (m: CampaignMetadata) => void;
}

const BasicsStep: React.FC<BasicsStepProps> = ({ metadata, setMetadata }) => {
  return (
    <div className="space-y-10 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-[#283b82]">Project Basics</h2>
        <p className="text-gray-400 font-medium mt-2 uppercase tracking-widest text-xs">Identity of the campaign</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">Client Name</label>
          <input className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-bold text-gray-700" value={metadata.clientName} onChange={e => setMetadata({...metadata, clientName: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">Campaign Name</label>
          <input className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-bold" value={metadata.campaignName} onChange={e => setMetadata({...metadata, campaignName: e.target.value})} />
        </div>
        
        <div className="space-y-2 md:col-span-2">
           <label className="text-[10px] font-black uppercase text-gray-400">Cover Slide Note (Optional)</label>
           <textarea 
             className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-medium text-sm h-24" 
             placeholder="Add an extra sentence, note, or paragraph to appear on the cover slide..."
             value={metadata.coverNote || ''} 
             onChange={e => setMetadata({...metadata, coverNote: e.target.value})} 
           />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400">Campaign Hashtags</label>
          {metadata.hashtag.map((h, idx) => (
             <div key={idx} className="flex gap-2">
               <input className="flex-grow p-4 bg-white rounded-xl border-2 border-gray-50 font-bold text-[#e64d25]" value={h} onChange={e => { const next = [...metadata.hashtag]; next[idx] = e.target.value; setMetadata({...metadata, hashtag: next}); }} />
               <button onClick={() => setMetadata({...metadata, hashtag: metadata.hashtag.filter((_, i) => i !== idx)})} className="text-red-400">×</button>
             </div>
          ))}
          <button onClick={() => setMetadata({...metadata, hashtag: [...metadata.hashtag, '']})} className="text-xs font-bold text-[#e64d25]">+ Add Hashtag</button>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400">LinkedIn Mentions</label>
          {metadata.linkedinMention.map((m, idx) => (
             <div key={idx} className="flex gap-2">
               <input className="flex-grow p-4 bg-white rounded-xl border-2 border-gray-50 font-bold text-blue-600" value={m} onChange={e => { const next = [...metadata.linkedinMention]; next[idx] = e.target.value; setMetadata({...metadata, linkedinMention: next}); }} />
               <button onClick={() => setMetadata({...metadata, linkedinMention: metadata.linkedinMention.filter((_, i) => i !== idx)})} className="text-red-400">×</button>
             </div>
          ))}
          <button onClick={() => setMetadata({...metadata, linkedinMention: [...metadata.linkedinMention, '']})} className="text-xs font-bold text-blue-600">+ Add Mention</button>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">Period Start</label>
          <input type="date" className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 font-bold" value={metadata.startDate} onChange={e => setMetadata({...metadata, startDate: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">Period End</label>
          <input type="date" className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 font-bold" value={metadata.endDate} onChange={e => setMetadata({...metadata, endDate: e.target.value})} />
        </div>
      </div>
    </div>
  );
};

export default BasicsStep;
