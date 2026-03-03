
import React from 'react';
import { ResourceLinks } from '../../types';

interface ResourcesStepProps {
  resources: ResourceLinks;
  setResources: (r: ResourceLinks) => void;
}

const ResourcesStep: React.FC<ResourcesStepProps> = ({ resources, setResources }) => {
  return (
    <div className="space-y-10 animate-fadeIn">
      <h2 className="text-4xl font-black text-[#283b82]">External Ecosystem</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {['mainDriveFolder', 'top20XDriveLink', 'brandwatchDriveLink', 'visualsDriveLink', 'shortsDriveLink'].map(key => (
           <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                      <input 
                          type="checkbox" 
                          className="accent-[#e64d25] w-3 h-3 cursor-pointer"
                          checked={(resources as any)[key + '_visible'] ?? !!(resources as any)[key]}
                          onChange={e => setResources({...resources, [key + '_visible']: e.target.checked})}
                      />
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Show Button</span>
                  </label>
              </div>
              <input 
                className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-medium" 
                value={(resources as any)[key] || ''} 
                onChange={e => setResources({...resources, [key]: e.target.value})} 
                placeholder="https://..."
              />
           </div>
         ))}
      </div>
      <div className="space-y-4">
        <h3 className="font-bold text-[#283b82]">YouTube Video Interviews (Manual)</h3>
        {resources.youtubeLinks.map((link, idx) => (
          <div key={link.id} className="flex gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-400">URL</label>
              <input className="w-full p-3 bg-white border rounded-xl" value={link.url} onChange={e => {
                const next = [...resources.youtubeLinks]; next[idx].url = e.target.value; setResources({...resources, youtubeLinks: next});
              }} />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-400">Title</label>
              <input className="w-full p-3 bg-white border rounded-xl" value={link.title} onChange={e => {
                const next = [...resources.youtubeLinks]; next[idx].title = e.target.value; setResources({...resources, youtubeLinks: next});
              }} />
            </div>
            <button onClick={() => setResources({...resources, youtubeLinks: resources.youtubeLinks.filter(l => l.id !== link.id)})} className="p-3 text-red-500">×</button>
          </div>
        ))}
        <button onClick={() => setResources({...resources, youtubeLinks: [...resources.youtubeLinks, { id: Math.random().toString(), url: '', title: '' }]})} className="text-xs font-bold text-[#e64d25]">+ Add Video</button>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-[#283b82]">Written Articles (Manual)</h3>
        {resources.articleLinks.map((link, idx) => (
          <div key={link.id} className="flex gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-400">Article URL</label>
              <input className="w-full p-3 bg-white border rounded-xl" value={link.url} onChange={e => {
                const next = [...resources.articleLinks]; next[idx].url = e.target.value; setResources({...resources, articleLinks: next});
              }} />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-400">Title</label>
              <input className="w-full p-3 bg-white border rounded-xl" value={link.title} onChange={e => {
                const next = [...resources.articleLinks]; next[idx].title = e.target.value; setResources({...resources, articleLinks: next});
              }} />
            </div>
            <button onClick={() => setResources({...resources, articleLinks: resources.articleLinks.filter(l => l.id !== link.id)})} className="p-3 text-red-500">×</button>
          </div>
        ))}
        <button onClick={() => setResources({...resources, articleLinks: [...resources.articleLinks, { id: Math.random().toString(), url: '', title: '', caption: '' }]})} className="text-xs font-bold text-[#e64d25]">+ Add Article Link</button>
      </div>
    </div>
  );
};

export default ResourcesStep;
