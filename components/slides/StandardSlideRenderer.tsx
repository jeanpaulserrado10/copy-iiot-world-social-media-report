
import React from 'react';
import { ReportData } from '../../types';
import { Icon } from '../Icon';

interface StandardSlideProps {
  slideId: string;
  data: ReportData;
  goToSlide?: (id: string) => void;
}

const IIoTLogo = () => (
  <div className="flex flex-col items-center">
    <div className="text-8xl font-black text-[#e64d25] tracking-tighter uppercase">IIoT <span className="font-bold">World</span></div>
  </div>
);

const StandardSlideRenderer: React.FC<StandardSlideProps> = ({ slideId, data, goToSlide }) => {
  const getYoutubeID = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper to determine if a metric should be shown (hides 0, '0', '0%', empty)
  const shouldShow = (val: string | number | undefined) => {
    if (val === undefined || val === null) return false;
    const s = String(val).trim();
    return s !== '' && s !== '0' && s !== '0%' && s !== '0.0';
  };

  const getKpiData = (id: string) => {
     switch(id) {
        case 'xReach': return { label: 'X Total Reach', value: data.xMetrics.reach, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
        case 'xMentions': return { label: 'X Mentions', value: data.xMetrics.mentions, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
        case 'xEngagement': return { label: 'X Engagement', value: data.xMetrics.engagement, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
        case 'xRate': return { label: 'X Engagement Rate', value: data.xMetrics.rate, color: 'bg-[#e64d25]', icon: 'GROWTH', group: 'X' };
        case 'liImpressions': return { label: 'LI Impressions', value: data.linkedinMetrics.impressions, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liEngagement': return { label: 'LI Engagement', value: data.linkedinMetrics.engagement, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liReactions': return { label: 'LI Reactions', value: data.linkedinMetrics.totalReactions, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liPosts': return { label: 'LI Total Posts', value: data.linkedinMetrics.totalPosts, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liViews': return { label: 'LI Total Views', value: data.linkedinMetrics.views, color: 'bg-[#283b82]', icon: 'VIDEO', group: 'LI' };
        default: return null;
     }
  };

  const renderVideoLinks = (vid: any) => {
      // Consolidate legacy single fields and new array
      const links = [...(vid.extraLinks || [])];
      if (vid.linkedinLink) links.push({ type: 'linkedin', url: vid.linkedinLink });
      if (vid.xLink) links.push({ type: 'x', url: vid.xLink });
      if (vid.driveLink) links.push({ type: 'drive', url: vid.driveLink });

      // Deduplicate by URL
      const uniqueLinks = Array.from(new Set(links.map(l => l.url)))
          .map(url => links.find(l => l.url === url));

      return (
          <div className="flex gap-2 flex-wrap items-center">
              {uniqueLinks.map((l, idx) => (
                  <a key={idx} href={l!.url} target="_blank" className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-colors ${
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

  switch(slideId) {
      case 'cover':
        return (
          <div className="relative min-h-full flex flex-col items-center justify-center text-center space-y-10 py-10">
             <IIoTLogo />
             <div className="h-2 w-48 bg-[#e64d25] rounded-full mx-auto opacity-50"></div>
             <div className="space-y-4 max-w-4xl">
                <h2 className="text-4xl font-black text-[#283b82] uppercase tracking-tighter">{data.metadata.clientName}</h2>
                <p className="text-xl font-medium text-gray-500 uppercase tracking-widest text-center">Statistics for {data.metadata.campaignName}</p>
                <div className="text-lg font-black text-[#e64d25] mt-6 bg-orange-50 px-6 py-2 rounded-full inline-block">{data.metadata.startDate} – {data.metadata.endDate}</div>
             </div>
             {data.metadata.coverNote && (
                 <p className="text-sm font-medium text-gray-500 max-w-2xl text-center leading-relaxed whitespace-pre-line border-t border-gray-100 pt-6">
                     {data.metadata.coverNote}
                 </p>
             )}
          </div>
        );
      case 'executive':
        const showMainDrive = data.resources.mainDriveFolder_visible ?? !!data.resources.mainDriveFolder;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 min-h-full">
            <div className="space-y-8 pb-4">
              <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-orange-100 pb-2">Campaign Activities</h3>
              <div className="space-y-4">
                {data.activitiesList.map(item => {
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        if (item.link) window.open(item.link, '_blank');
                      }}
                      className={`flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all ${item.link || item.targetSlideId ? 'hover:bg-white hover:border-[#e64d25] cursor-pointer shadow-sm group' : ''}`}
                    >
                       <Icon type={item.icon} className="w-6 h-6 text-[#283b82]" />
                       <div className="flex-grow">
                           <div className={`text-sm font-black uppercase tracking-tighter ${item.link ? 'text-[#e64d25] underline decoration-2 underline-offset-4' : 'text-[#283b82]'}`}>
                              {item.text}
                              {item.link && <span className="ml-2 text-xs no-underline opacity-50">↗</span>}
                           </div>
                       </div>
                       {item.targetSlideId && goToSlide && (
                           <button 
                             onClick={(e) => {
                                 e.stopPropagation();
                                 goToSlide(item.targetSlideId!);
                             }}
                             className="bg-white p-2 rounded-xl text-[#283b82] border border-blue-100 hover:bg-[#283b82] hover:text-white transition-colors"
                             title="Go to detailed slide"
                           >
                             <span className="text-[10px] font-black uppercase">View</span>
                           </button>
                       )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium italic border-l-4 border-gray-100 pl-4 mb-6 whitespace-pre-line">{data.summaryOfActivities}</p>
              {showMainDrive && (
                <a href={data.resources.mainDriveFolder || '#'} target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-[#283b82] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-2xl">
                  <Icon type="DOCS" className="w-5 h-5" />
                  Full Social Media Report Folder
                </a>
              )}
            </div>
            <div className="space-y-8 pb-4">
               <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-blue-100 pb-2">Platform Performance</h3>
               <div className="grid grid-cols-1 gap-6">
                  {/* Merge Standard KPIs with Custom Metrics */}
                  {['X', 'LI', 'CUSTOM'].map(platform => {
                     let platformKpis: any[] = [];
                     
                     if (platform === 'CUSTOM') {
                        platformKpis = data.customExecutiveMetrics || [];
                     } else {
                        platformKpis = data.executiveKpiSelection
                            .map(id => getKpiData(id))
                            .filter(kpi => kpi && kpi.group === platform);
                     }

                     // Filter out empty/zero values - THIS IMPLEMENTS THE USER REQUEST
                     platformKpis = platformKpis.filter(k => k && shouldShow(k.value));

                     if (platformKpis.length === 0) return null;
                     
                     return (
                        <div key={platform} className="space-y-4">
                           <h4 className={`text-[10px] font-black uppercase tracking-widest ${platform === 'X' ? 'text-orange-500' : platform === 'LI' ? 'text-blue-600' : 'text-gray-500'}`}>
                             {platform === 'CUSTOM' ? 'Additional Key Metrics' : `${platform} Highlights`}
                           </h4>
                           <div className="space-y-4">
                              {platformKpis.map((kpi, idx) => (
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
                     );
                  })}
               </div>
            </div>
          </div>
        );
      case 'x_performance':
        const showBrandwatch = data.resources.brandwatchDriveLink_visible ?? !!data.resources.brandwatchDriveLink;
        const showTop20X = data.resources.top20XDriveLink_visible ?? !!data.resources.top20XDriveLink;
        return (
          <div className="space-y-12">
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Reach', value: data.xMetrics.reach, icon: 'GLOBE' },
                  { label: 'Total Mentions', value: data.xMetrics.mentions, icon: 'CHAT' },
                  { label: 'Total Impressions', value: data.xMetrics.impressions, icon: 'DOCS' },
                  { label: 'Total Engagement', value: data.xMetrics.engagement, icon: 'HAND' },
                  { label: 'Engagement Rate', value: data.xMetrics.rate, icon: 'GROWTH' },
                ].filter(m => shouldShow(m.value)).map(m => (
                  <div key={m.label} className="bg-gray-50 p-6 rounded-[2rem] border text-center space-y-2 flex flex-col items-center">
                     <Icon type={m.icon} className="w-6 h-6 text-[#283b82] mb-1" />
                     <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-tight">{m.label}</div>
                     <div className="text-xl font-black text-[#283b82]">{m.value}</div>
                  </div>
                ))}
             </div>
             
             <div className="flex flex-col md:flex-row gap-6 pt-6">
                {showBrandwatch && (
                  <div className="flex-1 flex items-center justify-center p-6 bg-orange-50 rounded-[2.5rem] border border-orange-200 hover:bg-orange-100 transition-all group">
                     <a href={data.resources.brandwatchDriveLink || '#'} target="_blank" className="text-center space-y-2 flex flex-col items-center">
                        <Icon type="DOCS" className="w-10 h-10 text-[#e64d25]" />
                        <div className="text-[10px] font-black text-[#283b82] uppercase tracking-widest">Brandwatch Full Report →</div>
                     </a>
                  </div>
                )}
                {showTop20X && (
                  <div className="flex-1 flex items-center justify-center p-6 bg-blue-50 rounded-[2.5rem] border border-blue-200 hover:bg-blue-100 transition-all group">
                     <a href={data.resources.top20XDriveLink || '#'} target="_blank" className="text-center space-y-2 flex flex-col items-center">
                        <Icon type="TWITTER" className="w-10 h-10 text-iiot-blue" />
                        <div className="text-[10px] font-black text-[#283b82] uppercase tracking-widest">Top 20 X Posts Folder →</div>
                     </a>
                  </div>
                )}
             </div>
          </div>
        );
      case 'x_top':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-start pb-12">
            {data.topXPosts.map((post, i) => (
              <div key={i} className="flex gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 transition-all shadow-lg hover:shadow-xl">
                 <div className="w-1/3 aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border self-start shrink-0">
                    {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-contain" /> : <Icon type="TWITTER" className="w-10 h-10 text-gray-300" />}
                 </div>
                 <div className="flex-1 flex flex-col gap-3 py-1">
                    <div>
                      {post.author && <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 truncate">{post.author.toUpperCase()}</div>}
                      <h4 className="text-lg font-black text-gray-800 leading-tight">{post.title}</h4>
                    </div>
                    <div className="mt-auto space-y-3">
                        {shouldShow(post.impressions) && (
                          <div className="border-t border-gray-50 pt-3">
                            {/* CHANGED FROM IMPRESSIONS TO VIEWS AS REQUESTED */}
                            <div className="text-[9px] text-gray-400 font-bold uppercase">Views</div>
                            <div className="text-2xl font-black text-[#283b82]">{post.impressions}</div>
                          </div>
                        )}
                        <a href={post.link} target="_blank" className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-colors">View Post</a>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        );
      case 'linkedin_performance':
        return (
          <div className="space-y-10">
             <div className="bg-[#283b82] text-white p-12 rounded-[4rem] flex justify-between items-center relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-2">
                   <div className="text-xs font-black tracking-widest uppercase opacity-70">Total LinkedIn Impressions</div>
                   <div className="text-7xl font-black">{data.linkedinMetrics.impressions}</div>
                </div>
                <Icon type="LINKEDIN" className="w-40 h-40 opacity-10 absolute right-8" />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { label: 'Total Posts', value: data.linkedinMetrics.totalPosts, icon: 'DOCS' },
                  { label: 'Total Views', value: data.linkedinMetrics.views, icon: 'VIDEO' },
                  { label: 'Total Reactions', value: data.linkedinMetrics.totalReactions, icon: 'LIKE' },
                  { label: 'Total Comments', value: data.linkedinMetrics.totalComments, icon: 'CHAT' },
                  { label: 'Total Engagement', value: data.linkedinMetrics.engagement, icon: 'GROWTH' },
                ].filter(m => shouldShow(m.value)).map(m => (
                  <div key={m.label} className="bg-white p-6 rounded-[2rem] border-2 border-gray-50 text-center flex flex-col items-center shadow-sm">
                     <Icon type={m.icon} className="w-6 h-6 text-[#283b82] mb-2" />
                     <div className="text-[10px] font-black text-gray-400 uppercase">{m.label}</div>
                     <div className="text-2xl font-black text-[#283b82]">{m.value}</div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'linkedin_top':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-start pb-12">
            {data.topLinkedinPosts.map((post, i) => (
              <div key={i} className="flex flex-col bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all space-y-4">
                 <div className="h-56 bg-blue-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden border w-full flex-shrink-0">
                    {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-contain" /> : <Icon type="LINKEDIN" className="w-16 h-16 text-blue-100" />}
                 </div>
                 <div className="space-y-4 flex-grow flex flex-col">
                    <div className="min-h-0">
                       {post.author && <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 truncate">{post.author.toUpperCase()}</div>}
                       <div className="flex justify-between items-start gap-4">
                          <h4 className="text-lg font-black text-[#283b82] leading-tight line-clamp-3 hover:line-clamp-none transition-all cursor-default" title={post.title}>{post.title}</h4>
                          <div className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full shrink-0 whitespace-nowrap">{post.date}</div>
                       </div>
                    </div>
                    <div className="flex gap-8 border-t border-gray-50 pt-4 mt-auto">
                       {shouldShow(post.impressions) && (
                         <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Impressions</div>
                            <div className="text-2xl font-black text-[#283b82]">{post.impressions}</div>
                         </div>
                       )}
                       {shouldShow(post.reactions) && (
                         <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Reactions</div>
                            <div className="text-2xl font-black text-[#e64d25]">{post.reactions}</div>
                         </div>
                       )}
                    </div>
                    <div className="pt-2">
                       <a href={post.link} target="_blank" className="text-xs font-black text-blue-600 underline uppercase tracking-widest hover:text-[#e64d25] transition-colors">View Post →</a>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        );
      case 'linkedin_inventory':
        return (
          <div className="space-y-6 flex flex-col min-h-0">
             <div className="overflow-x-auto rounded-[2rem] border-2 border-gray-50 bg-white shadow-sm">
                <table className="w-full text-left text-xs min-w-full">
                   <thead className="bg-[#283b82] text-white uppercase font-black tracking-widest sticky top-0 z-10">
                      <tr>
                         {data.inventoryVisibleColumns.map(col => <th key={col} className="p-5">{col}</th>)}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {data.allLinkedinPosts.map((post: any, i) => (
                         <tr key={i} className="hover:bg-gray-50 transition-colors">
                            {data.inventoryVisibleColumns.map(col => (
                               <td key={col} className="p-5 font-bold text-[#283b82] truncate max-w-xs">
                                 {col === 'link' ? (
                                   <a href={post[col]} target="_blank" className="text-blue-500 underline">View Post</a>
                                 ) : (
                                   post[col]
                                 )}
                               </td>
                            ))}
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );
      case 'website_content':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-start pb-12">
            {data.articles.map((art, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all">
                 <div className="h-48 bg-orange-50 shrink-0 relative overflow-hidden flex items-center justify-center">
                    {art.proofImage ? <img src={art.proofImage} className="w-full h-full object-contain" /> : <Icon type="DOCS" className="w-12 h-12 text-iiot-orange/20" />}
                 </div>
                 <div className="p-6 flex flex-col gap-4">
                    <h4 className="text-lg font-black text-[#283b82] leading-tight">{art.title}</h4>
                    <p className="text-sm text-gray-500 italic">{art.caption}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <a href={art.link} target="_blank" className="inline-flex items-center gap-2 text-xs font-black text-[#e64d25] uppercase tracking-widest hover:underline">Read on Website →</a>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        );
      case 'video_interviews':
        return (
          <div className="space-y-12 flex flex-col justify-center min-h-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-center">
                {data.videoInterviews.map((video, i) => {
                  const ytId = getYoutubeID(video.link);
                  return (
                    <div key={i} className="bg-gray-50 rounded-[2.5rem] overflow-hidden border shadow-sm group h-full flex flex-col min-h-0">
                      <div className="aspect-video bg-black relative shrink-0">
                         {ytId ? (
                           <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen></iframe>
                         ) : <div className="w-full h-full flex items-center justify-center text-white/50">PREVIEW N/A</div>}
                      </div>
                      <div className="p-8 flex flex-col justify-between flex-grow gap-4">
                         <h4 className="text-lg font-black text-[#283b82] truncate pr-4">{video.title}</h4>
                         <div className="flex gap-2 flex-wrap items-center">
                            <a href={video.link} target="_blank" className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all hover:bg-red-700">Watch Video</a>
                            {renderVideoLinks(video)}
                         </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        );
      case 'video_collateral':
        // SMART LAYOUT FOR VIDEO COLLATERAL
        const vidCount = data.videoCollateral.length;
        let gridCols = 'grid-cols-1';
        if (vidCount === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
        if (vidCount >= 3) gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

        const showVisualsCollateral = data.resources.visualsDriveLink_visible ?? !!data.resources.visualsDriveLink;

        return (
          <div className="space-y-8 flex flex-col min-h-0">
             <div className={`grid ${gridCols} gap-8 flex-grow content-center`}>
                {data.videoCollateral.map((vid, i) => (
                  <div key={i} className="bg-white p-8 rounded-[3rem] border flex flex-col gap-6 shadow-lg h-full justify-center min-h-0">
                     <div className="aspect-video bg-[#283b82]/10 rounded-2xl flex items-center justify-center overflow-hidden border shrink-0">{vid.base64Video ? <video src={vid.base64Video} controls className="w-full h-full object-cover" /> : <div className="font-black text-blue-200"><Icon type="VIDEO" className="w-12 h-12" /></div>}</div>
                     <div className="space-y-4">
                        <h4 className="text-xl font-black text-[#283b82] truncate">{vid.title}</h4>
                        {renderVideoLinks(vid)}
                     </div>
                  </div>
                ))}
             </div>
             {showVisualsCollateral && (
               <div className="flex justify-center mt-auto shrink-0 pb-4">
                 <a href={data.resources.visualsDriveLink || '#'} target="_blank" className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#283b82] hover:text-white transition-colors">
                    <Icon type="DOCS" className="w-4 h-4" />
                    View Video Assets Folder
                 </a>
               </div>
             )}
          </div>
        );
      case 'creative_assets':
        const showVisualsCreative = data.resources.visualsDriveLink_visible ?? !!data.resources.visualsDriveLink;
        return (
          <div className="space-y-4 flex flex-col min-h-0 h-full">
             <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                {/* Use columns for masonry layout to handle varying aspect ratios better */}
                <div className="columns-2 md:columns-3 gap-6 space-y-6">
                  {data.graphics.map((g, i) => (
                    <div key={i} className="break-inside-avoid bg-gray-50 rounded-2xl overflow-hidden border shadow-sm relative group">
                       <img src={g.url} className="w-full h-auto block" alt={g.label} />
                    </div>
                  ))}
                </div>
             </div>
             {showVisualsCreative && (
               <div className="flex justify-center mt-auto pt-4 shrink-0">
                 <a href={data.resources.visualsDriveLink || '#'} target="_blank" className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#e64d25] hover:text-white transition-colors">
                    <Icon type="DOCS" className="w-4 h-4" />
                    View Full Visual Assets Folder
                 </a>
               </div>
             )}
          </div>
        );
      case 'newsletter_placements':
        return (
          <div className="space-y-10 flex flex-col justify-center min-h-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-center">
                {data.linkedinNewsletters.map((newsletter, i) => (
                  <div key={i} className="bg-white rounded-[2rem] border overflow-hidden flex flex-col group shadow-2xl h-full flex-1 min-h-0">
                     <div className="h-48 bg-gray-50 border-b relative shrink-0 overflow-hidden">
                        {newsletter.proofImage ? <img src={newsletter.proofImage} className="w-full h-full object-contain" alt="" /> : <div className="w-full h-full flex items-center justify-center text-orange-200 font-black text-4xl uppercase"><Icon type="DOCS" className="w-12 h-12" /></div>}
                     </div>
                     <div className="p-6 space-y-4 flex-grow flex flex-col justify-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DATE: {newsletter.date || 'N/A'}</div>
                        <h4 className="text-lg font-black text-[#283b82] leading-tight line-clamp-2">{newsletter.title}</h4>
                        <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
                           <div className="flex gap-4">
                              {shouldShow(newsletter.impressions) && (
                                <div>
                                  <div className="text-[10px] text-gray-400 font-black uppercase">Impressions</div>
                                  <div className="text-2xl font-black text-[#e64d25]">{newsletter.impressions}</div>
                                </div>
                              )}
                              {shouldShow(newsletter.views) && (
                                <div>
                                  <div className="text-[10px] text-gray-400 font-black uppercase">Views</div>
                                  <div className="text-2xl font-black text-[#283b82]">{newsletter.views}</div>
                                </div>
                              )}
                           </div>
                           <a href={newsletter.link} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">View URL</a>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'iiot_newsletter_inserts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
            {data.iiotNewsletterInserts.map((ins, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border flex flex-col items-center shadow-xl justify-center relative group">
                 <img src={ins.image} className="w-full h-auto max-h-[400px] object-contain rounded-xl" alt="" />
                 <div className="mt-6 text-center font-black text-[#283b82] text-sm uppercase tracking-widest">{ins.title}</div>
                 {ins.link && (
                     <a href={ins.link} target="_blank" className="mt-4 px-6 py-2 bg-[#e64d25] text-white text-xs font-black uppercase rounded-xl hover:bg-orange-600 transition-colors">
                        View Insert
                     </a>
                 )}
              </div>
            ))}
          </div>
        );
      case 'x_metrics':
        return (
          <div className="space-y-8 flex flex-col h-full overflow-hidden">
             <div className="mb-4 shrink-0">
               <p className="text-xl text-gray-600 font-medium">Check the full glossary of Brandwatch metrics here.</p>
             </div>
             <div className="overflow-hidden rounded-xl border-2 border-gray-100 flex-grow shadow-sm">
                <table className="w-full text-left border-collapse h-full">
                   <thead className="bg-[#e64d25] text-white uppercase font-black tracking-widest text-lg">
                      <tr>
                         <th className="p-8 w-1/3 border-r border-white/20">X (Twitter) Content Metric</th>
                         <th className="p-8">Definition</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {[
                        { metric: 'Engagements', definition: 'The lifetime number of reactions, comments, and shares on the post' },
                        { metric: 'Engagement rate', definition: "The ratio of the post's lifetime engagements to its lifetime impressions, represented as a percentage." },
                        { metric: 'Impressions', definition: 'The lifetime number of views on the post.' },
                        { metric: 'Reach', definition: 'The total number of people who viewed the post.' },
                        { metric: 'Video views', definition: 'The lifetime number video views on the post that completed the entire video.' }
                      ].map((m, i) => (
                         <tr key={i} className="bg-white">
                            <td className="p-8 font-black text-[#283b82] border-r border-gray-100 text-xl">{m.metric}</td>
                            <td className="p-8 font-medium text-gray-600 text-lg leading-relaxed">{m.definition}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );
      case 'thank_you':
        return (
          <div className="w-full h-full bg-[#e64d25] text-white flex flex-col items-center justify-center relative overflow-hidden p-8 print:p-0">
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="none">
                   <path d="M0 100 Q 200 50 400 100 T 800 100" fill="none" stroke="white" strokeWidth="2" />
                   <path d="M0 300 Q 200 250 400 300 T 800 300" fill="none" stroke="white" strokeWidth="2" />
                   <path d="M0 500 Q 200 450 400 500 T 800 500" fill="none" stroke="white" strokeWidth="2" />
                </svg>
             </div>
             <div className="z-10 flex flex-col items-center justify-center space-y-12 w-full max-w-5xl px-4 py-12">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-center leading-tight">Thank you for your business!</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full pt-8 max-w-3xl">
                   <div className="space-y-2 text-center md:text-left">
                      <div className="text-2xl font-black">Carolina Rudinschi</div>
                      <div className="text-sm font-bold opacity-80">@Crudinshi</div>
                      <div className="text-sm border-t border-white/30 pt-2 font-medium">carolina@iiot-world.com</div>
                   </div>
                   <div className="space-y-2 text-center md:text-left">
                      <div className="text-2xl font-black">Lucian Fogoros</div>
                      <div className="text-sm font-bold opacity-80">@Fogoros</div>
                      <div className="text-sm border-t border-white/30 pt-2 font-medium">lucian@iiot-world.com</div>
                   </div>
                </div>
                <div className="flex gap-6 pt-8 flex-wrap justify-center">
                   {[
                     { icon: 'MAIL', url: 'http://news.iiot-world.com/' },
                     { icon: 'TWITTER', url: 'https://twitter.com/iiot_world' },
                     { icon: 'LINKEDIN', url: 'https://www.linkedin.com/company/iiot-world' },
                     { icon: 'GLOBE', url: 'https://iiot-world.com/' }
                   ].map((soc, idx) => (
                     <a key={idx} href={soc.url} target="_blank" className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#e64d25] shadow-2xl transition-all hover:scale-110">
                        <Icon type={soc.icon} className="w-7 h-7" />
                     </a>
                   ))}
                </div>
             </div>
          </div>
        );
      default: return null;
  }
};

export default StandardSlideRenderer;
