
import React from 'react';
import { CustomSlide } from '../../types';
import { Icon } from '../Icon';

interface CustomSlideProps {
  custom: CustomSlide;
}

const CustomSlideRenderer: React.FC<CustomSlideProps> = ({ custom }) => {
  
  const shouldShow = (val: string | number | undefined) => {
    if (val === undefined || val === null) return false;
    const s = String(val).trim();
    return s !== '' && s !== '0' && s !== '0%' && s !== '0.0';
  };

  const renderVideoLinks = (vid: any) => {
      const links = [...(vid.extraLinks || [])];
      // Keep support for legacy fields if present
      if (vid.linkedinLink) links.push({ type: 'linkedin', url: vid.linkedinLink });
      if (vid.xLink) links.push({ type: 'x', url: vid.xLink });
      if (vid.driveLink) links.push({ type: 'drive', url: vid.driveLink });

      // Deduplicate by URL
      const uniqueLinks = Array.from(new Set(links.map(l => l.url)))
          .map(url => links.find(l => l.url === url));

      return (
          <div className="flex gap-2 flex-wrap justify-center mt-2">
              {uniqueLinks.map((l, idx) => (
                  <a key={idx} href={l!.url} target="_blank" className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded transition-colors ${
                      l!.type === 'linkedin' ? 'text-[#283b82] bg-blue-50 hover:bg-blue-100' :
                      l!.type === 'x' ? 'text-[#e64d25] bg-orange-50 hover:bg-orange-100' :
                      'text-gray-600 bg-gray-200 hover:bg-gray-300'
                  }`}>
                      <Icon type={l!.type === 'linkedin' ? 'LINKEDIN' : l!.type === 'x' ? 'TWITTER' : 'DOCS'} className="w-3 h-3" />
                      {l!.type === 'drive' ? 'Asset' : l!.type}
                  </a>
              ))}
          </div>
      );
  };

  // --- TOP POSTS TEMPLATE (LIST OF SOCIAL POSTS) ---
  if (custom.template === 'top-posts' && custom.posts) {
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full content-center">
           {custom.posts.map((post, i) => (
              <div key={i} className="flex gap-6 bg-white p-6 rounded-[2rem] border border-gray-50 transition-all shadow-xl h-full flex-1 min-h-0">
                 <div className="w-1/3 aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border self-center">
                    {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-contain" /> : <Icon type={post.platform === 'X' ? 'TWITTER' : 'LINKEDIN'} className="w-10 h-10 text-gray-300" />}
                 </div>
                 <div className="w-2/3 flex flex-col justify-between py-1 overflow-hidden">
                    <div className="min-h-0">
                       <div className={`text-[10px] font-black uppercase tracking-widest mb-1 truncate ${post.platform === 'X' ? 'text-blue-400' : 'text-blue-700'}`}>{post.platform} HIGHLIGHT</div>
                       <h4 className="text-lg font-black text-gray-800 leading-tight line-clamp-3">{post.title}</h4>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-50 pt-4 mt-auto">
                       {shouldShow(post.impressions) && (
                         <div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase">Impressions</div>
                            <div className="text-2xl font-black text-[#283b82]">{post.impressions}</div>
                         </div>
                       )}
                       <a href={post.link} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">View</a>
                    </div>
                 </div>
              </div>
           ))}
        </div>
     );
  }

  // --- EXECUTIVE STYLE TEMPLATE ---
  if (custom.template === 'executive') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
        <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2 max-h-full">
           <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-orange-100 pb-2">{custom.subtitle || 'Highlights'}</h3>
           <div className="space-y-4">
              {custom.bullets && custom.bullets.map((b, idx) => {
                 const txt = typeof b === 'string' ? b : b.text;
                 const lnk = typeof b === 'string' ? undefined : b.link;
                 const content = (
                    <div key={idx} className={`flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all ${lnk ? 'hover:bg-white hover:border-[#e64d25] cursor-pointer shadow-sm group' : ''}`}>
                         <Icon type="STAR" className="w-6 h-6 text-[#283b82]" />
                         <div className={`text-sm font-black uppercase tracking-tighter ${lnk ? 'text-[#e64d25]' : 'text-[#283b82]'}`}>{txt}</div>
                    </div>
                 );
                  return lnk ? <a key={idx} href={lnk} target="_blank" data-pdf-link={lnk}>{content}</a> : content;
              })}
           </div>
        </div>
        <div className="space-y-8 flex flex-col justify-center h-full overflow-y-auto custom-scrollbar pr-2">
            <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">{custom.content}</p>
            {/* Show Metrics Here too if added */}
            {custom.metricsData && custom.metricsData.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {custom.metricsData.map((kpi, idx) => (
                      <div key={idx} className={`p-4 ${kpi.color} text-white rounded-[2rem] flex justify-between items-center shadow-lg`}>
                        <div>
                            <div className="text-[9px] font-black opacity-80 uppercase tracking-widest">{kpi.label}</div>
                            <div className="text-xl font-black mt-1">{kpi.value}</div>
                        </div>
                        <Icon type={kpi.icon} className="w-8 h-8 opacity-20" />
                      </div>
                  ))}
               </div>
            )}

            {custom.images && custom.images.length > 0 && (
               <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-center overflow-hidden max-h-[300px] shrink-0">
                  <img src={custom.images[0].url} className="max-w-full max-h-full object-contain shadow-md rounded-xl" />
               </div>
            )}
            {custom.buttons && (
               <div className="flex flex-wrap gap-4 shrink-0">
                  {custom.buttons.map((btn, idx) => (
                     <a key={idx} href={btn.link} target="_blank" data-pdf-link={btn.link} className="px-8 py-4 bg-[#283b82] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#e64d25] transition-colors shadow-xl">
                       <Icon type="GLOBE" className="w-4 h-4" /> {btn.text}
                     </a>
                  ))}
               </div>
            )}
        </div>
      </div>
    );
  }

  // --- EXECUTIVE SNAPSHOT TEMPLATE (IMPORTED OR CUSTOM) ---
  if (custom.template === 'executive-snapshot') {
    return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
            <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-orange-100 pb-2">{custom.subtitle || 'Campaign Activities'}</h3>
              <div className="space-y-4">
                {custom.bullets && custom.bullets.map((item, idx) => {
                  const Content = (
                    <div key={idx} className={`flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all ${item.link ? 'hover:bg-white hover:border-[#e64d25] cursor-pointer shadow-sm group' : ''}`}>
                       <Icon type={item.icon || 'STAR'} className="w-6 h-6 text-[#283b82]" />
                       <div className={`text-sm font-black uppercase tracking-tighter ${item.link ? 'text-[#e64d25] underline decoration-2 underline-offset-4' : 'text-[#283b82]'}`}>{item.text}</div>
                    </div>
                  );
                  return item.link ? <a key={idx} href={item.link} target="_blank" className="block" data-pdf-link={item.link}>{Content}</a> : Content;
                })}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium italic border-l-4 border-gray-100 pl-4 mb-6 whitespace-pre-line flex-grow">{custom.content}</p>
              {custom.buttons && custom.buttons.map((btn, idx) => (
                <a key={idx} href={btn.link} target="_blank" data-pdf-link={btn.link} className="inline-flex items-center gap-3 px-8 py-4 bg-[#283b82] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-2xl">
                  <Icon type="DOCS" className="w-5 h-5" />
                  {btn.text}
                </a>
              ))}
            </div>
            <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2">
               <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-blue-100 pb-2">Key Metrics</h3>
               <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {custom.metricsData && custom.metricsData.map((kpi, idx) => (
                           <div key={idx} className={`p-6 ${kpi.color} text-white rounded-[2rem] flex justify-between items-center shadow-lg`}>
                              <div>
                                 <div className="text-[9px] font-black opacity-80 uppercase tracking-widest">{kpi.label}</div>
                                 <div className="text-3xl font-black mt-1">{kpi.value}</div>
                              </div>
                              <Icon type={kpi.icon} className="w-10 h-10 opacity-20" />
                           </div>
                        ))}
                      </div>
                   </div>
               </div>
            </div>
          </div>
    );
  }

  // --- GRID STYLE TEMPLATE (ASSETS/VIDEOS) ---
  if (custom.template === 'grid') {
     // Smart Grid Logic for Images
     const imgCount = custom.images?.length || 0;
     const vidCount = custom.videos?.length || 0;
     const totalCount = imgCount + vidCount;

     // If there is only one item, don't use the grid which forces aspect-square.
     // Instead, show it large and centered but contained.
     if (totalCount === 1) {
         return (
            <div className="flex flex-col h-full space-y-8">
               {custom.subtitle && <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-blue-100 pb-2 shrink-0">{custom.subtitle}</h3>}
               {custom.content && <p className="text-lg text-gray-500 shrink-0">{custom.content}</p>}
               
               <div className="flex-grow flex items-center justify-center min-h-0 p-4">
                   {custom.videos && custom.videos.length > 0 ? (
                       <div className="w-full max-w-5xl h-full flex flex-col justify-center gap-4">
                            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                                {custom.videos[0].url.startsWith('data:') ? (
                                    <video src={custom.videos[0].url} controls className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full text-white flex flex-col items-center justify-center p-4">
                                        <a href={custom.videos[0].url} target="_blank" className="text-[#e64d25] font-black underline mb-2">Watch Video</a>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-4 rounded-2xl border shadow-sm self-center">
                                <span className="text-xs font-bold text-gray-600 block text-center mb-2">{custom.videos[0].title || 'Video Resource'}</span>
                                {renderVideoLinks(custom.videos[0])}
                            </div>
                       </div>
                   ) : custom.images && custom.images.length > 0 ? (
                       <img src={custom.images[0].url} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-gray-100" />
                   ) : null}
               </div>

               {custom.buttons && (
                   <div className="flex justify-center mt-auto shrink-0 pt-4">
                      {custom.buttons.map((btn, idx) => (
                         <a key={idx} href={btn.link} target="_blank" className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#e64d25] hover:text-white transition-colors">
                           <Icon type="DOCS" className="w-4 h-4" /> {btn.text}
                         </a>
                      ))}
                   </div>
               )}
            </div>
         );
     }

     let gridCols = 'grid-cols-1';
     if (totalCount === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
     if (totalCount >= 3) gridCols = 'grid-cols-1 md:grid-cols-3';

     return (
        <div className="flex flex-col h-full space-y-8">
           {custom.subtitle && <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-blue-100 pb-2 shrink-0">{custom.subtitle}</h3>}
           {custom.content && <p className="text-lg text-gray-500 shrink-0">{custom.content}</p>}
           
           <div className={`grid ${gridCols} gap-6 flex-grow content-start overflow-y-auto custom-scrollbar p-2`}>
              {/* Videos */}
              {custom.videos && custom.videos.map((vid, i) => {
                 // Check if it's base64 or youtube
                 const isBase64 = vid.url.startsWith('data:');
                 return (
                    <div key={`v-${i}`} className="bg-gray-900 rounded-2xl overflow-hidden border shadow-lg relative flex flex-col min-h-0">
                        <div className="aspect-video relative bg-black flex items-center justify-center">
                            {isBase64 ? (
                                <video src={vid.url} controls className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full text-white flex flex-col items-center justify-center p-4">
                                    <a href={vid.url} target="_blank" className="text-[#e64d25] font-black underline mb-2">Watch Video</a>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white flex flex-col gap-2">
                             <span className="text-xs font-bold text-gray-600 truncate">{vid.title || 'Video Resource'}</span>
                             {renderVideoLinks(vid)}
                        </div>
                    </div>
                 );
              })}

              {/* Images */}
              {custom.images && custom.images.map((img, i) => (
                <div key={`i-${i}`} className="group relative bg-gray-50 rounded-2xl overflow-hidden border aspect-square shadow-sm flex items-center justify-center">
                   <img src={img.url} className="w-full h-full object-contain" alt="" />
                </div>
              ))}
           </div>
           {custom.buttons && (
               <div className="flex justify-center mt-auto shrink-0 pt-4">
                  {custom.buttons.map((btn, idx) => (
                     <a key={idx} href={btn.link} target="_blank" className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#e64d25] hover:text-white transition-colors">
                       <Icon type="DOCS" className="w-4 h-4" /> {btn.text}
                     </a>
                  ))}
               </div>
           )}
        </div>
     );
  }

  // --- COMPARISON STYLE TEMPLATE ---
  if (custom.template === 'comparison' && custom.comparisonData) {
     const visibleRows = custom.comparisonData.rows.filter(row => !row.hidden);
     
     return (
        <div className="flex flex-col h-full space-y-8">
           <div className="space-y-4">
              {custom.subtitle && <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-orange-100 pb-2">{custom.subtitle}</h3>}
              {custom.content && <p className="text-lg text-gray-600 font-medium leading-relaxed">{custom.content}</p>}
           </div>
           <div className="overflow-x-auto rounded-[2rem] border-2 border-gray-50 bg-white shadow-sm flex-grow">
              <table className="w-full text-left">
                 <thead className="bg-[#283b82] text-white">
                    <tr>
                       {custom.comparisonData.headers.map((h, i) => (
                          <th key={i} className="p-5 font-black uppercase text-xs tracking-widest border-r border-white/10 last:border-r-0">
                             {h}
                          </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {visibleRows.map((row, idx) => {
                       if (row.isHeader) {
                          return (
                            <tr key={idx} className="bg-orange-50">
                               <td colSpan={custom.comparisonData!.headers.length} className="p-4 font-black text-[#e64d25] uppercase text-xs tracking-widest text-center">
                                  {row.label}
                               </td>
                            </tr>
                          );
                       }
                       return (
                           <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="p-5 font-black text-[#283b82] text-sm bg-gray-50/50 border-r border-gray-100">{row.label}</td>
                              {row.values.map((val, vIdx) => (
                                 <td key={vIdx} className={`p-5 font-medium text-gray-600 text-sm border-l border-gray-50 ${vIdx === row.values.length - 1 ? 'font-black text-[#e64d25] bg-orange-50/30' : ''}`}>
                                    {val}
                                 </td>
                              ))}
                           </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
     );
  }

  // --- DEFAULT (ENHANCED) TEMPLATE ---
  return (
    <div className="h-full flex flex-col space-y-6">
       {custom.subtitle && <h3 className="text-2xl font-black text-[#e64d25] uppercase tracking-tight shrink-0">{custom.subtitle}</h3>}
       
       <div className="flex-grow flex flex-col gap-6 overflow-hidden">
           {/* Main Content Area */}
           <div className="flex gap-8 h-full min-h-0">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {custom.content && <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">{custom.content}</p>}
                 {custom.bullets && (
                   <ul className="space-y-3 mt-6">
                      {custom.bullets.map((b, i) => {
                         const txt = typeof b === 'string' ? b : b.text;
                         const lnk = typeof b === 'string' ? undefined : b.link;
                         const inner = (
                            <>
                              <span className="w-2 h-2 bg-[#e64d25] rounded-full shrink-0"></span>
                              <span className={`text-sm font-bold uppercase ${lnk ? 'text-[#283b82] underline decoration-2 underline-offset-4 hover:text-[#e64d25]' : 'text-gray-600'}`}>{txt}</span>
                            </>
                         );
                         return (
                           <li key={i} className="flex items-center gap-3">
                              {lnk ? <a href={lnk} target="_blank" className="flex items-center gap-3">{inner}</a> : inner}
                           </li>
                         );
                      })}
                   </ul>
                 )}
                 {/* Metrics in Default Template if present */}
                 {custom.metricsData && custom.metricsData.length > 0 && (
                     <div className="grid grid-cols-2 gap-4 mt-6">
                        {custom.metricsData.map((kpi, idx) => (
                           <div key={idx} className={`p-4 ${kpi.color} text-white rounded-2xl shadow-md`}>
                              <div className="text-[8px] font-black opacity-80 uppercase tracking-widest">{kpi.label}</div>
                              <div className="text-xl font-black">{kpi.value}</div>
                           </div>
                        ))}
                     </div>
                 )}
              </div>
              
              {/* Media Area */}
              {((custom.fileData) || (custom.images && custom.images.length > 0) || (custom.videos && custom.videos.length > 0)) && (
                 <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed rounded-[3rem] p-10 bg-gray-50 overflow-hidden max-h-[400px] shrink-0 self-center gap-4">
                    {/* Video if present */}
                    {custom.videos && custom.videos.length > 0 && (
                        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl relative">
                             <video src={custom.videos[0].url} controls className="w-full h-full object-contain" />
                             {/* Overlay links for single video default view */}
                             <div className="absolute bottom-2 right-2">
                                {renderVideoLinks(custom.videos[0])}
                             </div>
                        </div>
                    )}
                    {/* Image if present */}
                    {custom.images && custom.images.length > 0 ? (
                       <img src={custom.images[0].url} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl" />
                    ) : custom.fileData ? (
                       <img src={custom.fileData} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl" />
                    ) : null}
                 </div>
              )}
           </div>

           {/* Action Area */}
           <div className="flex justify-center gap-4 mt-auto shrink-0 pt-2">
              {custom.link && (
                <a href={custom.link} target="_blank" data-pdf-link={custom.link} className="px-12 py-5 bg-[#283b82] text-white rounded-[2rem] text-center shadow-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
                   <Icon type="GLOBE" className="w-4 h-4" />
                   {custom.linkText || 'View Resource'}
                </a>
              )}
              {custom.buttons && custom.buttons.map((btn, i) => (
                 <a key={i} href={btn.link} target="_blank" data-pdf-link={btn.link} className="px-12 py-5 bg-[#283b82] text-white rounded-[2rem] text-center shadow-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
                   <Icon type="GLOBE" className="w-4 h-4" />
                   {btn.text}
                 </a>
              ))}
           </div>
       </div>
    </div>
  );
};

export default CustomSlideRenderer;
