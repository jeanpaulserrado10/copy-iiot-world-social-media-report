
import React, { useState } from 'react';
import { ReportData, SocialPost, ArticleInfo, VideoInfo, CustomSlide } from '../types';

interface PresentationViewProps {
  data: ReportData;
}

const Icon = ({ type, className = "w-6 h-6" }: { type: string, className?: string }) => {
  switch (type) {
    case 'DOCS':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'SOCIAL':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case 'GROWTH':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    case 'STAR':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
    case 'VIDEO':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    case 'GLOBE':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
    case 'CHAT':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
    case 'HAND':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m-3-2.5c0-1.105.895-2 2-2s2 .895 2 2v2.5m3-2.5c0-1.105.895-2 2-2s2 .895 2 2V14m-9.75 3h9.75a2.25 2.25 0 002.25-2.25V11a2.25 2.25 0 00-2.25-2.25H16.5a2.25 2.25 0 00-2.25 2.25v1.5a.75.75 0 01-1.5 0V11a2.25 2.25 0 00-2.25-2.25H9.75a2.25 2.25 0 00-2.25 2.25v2.5a.75.75 0 01-1.5 0V11a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v4.5A5.25 5.25 0 009 21h.75" /></svg>;
    case 'LIKE':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.757c1.246 0 2.256 1.01 2.256 2.256 0 1.246-1.01 2.256-2.256 2.256H14m0-4.512V6.756a2.256 2.256 0 00-2.256-2.256 2.256 2.256 0 00-2.256 2.256v3.244m4.512 0H9.488m0 0V6.756a2.256 2.256 0 00-2.256-2.256 2.256 2.256 0 00-2.256 2.256v3.244m4.512 0h-4.512" /></svg>;
    case 'LINKEDIN':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
    case 'TWITTER':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};

const PresentationView: React.FC<PresentationViewProps> = ({ data }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const SlideWrapper: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
    <div className="w-full h-full min-h-[650px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border-t-8 border-[#e64d25] print:shadow-none print:border-none print:m-0">
       <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#e64d25] rounded flex items-center justify-center text-white text-[10px] font-black">II</div>
            <span className="font-black text-xs text-[#283b82] tracking-tighter">IIoT WORLD</span>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {data.metadata.clientName} | {data.metadata.campaignName}
          </div>
       </div>
       <div className="flex-grow p-10 overflow-y-auto">
         {title && <h2 className="text-4xl font-extrabold text-[#3f3f3f] mb-10 border-l-8 border-[#e64d25] pl-6 uppercase tracking-tight">{title}</h2>}
         {children}
       </div>
       <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-8 print:hidden">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SLIDE {activeSlide + 1} OF {slides.length}</div>
         <div className="flex gap-2">
           {slides.map((_, i) => (
             <button 
               key={i} 
               onClick={() => setActiveSlide(i)}
               className={`w-2.5 h-2.5 rounded-full transition-all ${activeSlide === i ? 'bg-[#e64d25] w-6' : 'bg-gray-200 hover:bg-gray-300'}`}
             />
           ))}
         </div>
       </div>
    </div>
  );

  const getYoutubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getKpiData = (id: string) => {
     switch(id) {
        case 'xReach': return { label: 'X Total Reach', value: data.xMetrics.reach, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
        case 'xMentions': return { label: 'X Mentions', value: data.xMetrics.mentions, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
        case 'xEngagement': return { label: 'X Engagement', value: data.xMetrics.engagement, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
        case 'liImpressions': return { label: 'LI Impressions', value: data.linkedinMetrics.impressions, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liEngagement': return { label: 'LI Engagement', value: data.linkedinMetrics.engagement, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liReactions': return { label: 'LI Reactions', value: data.linkedinMetrics.totalReactions, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        case 'liPosts': return { label: 'LI Total Posts', value: data.linkedinMetrics.totalPosts, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
        default: return null;
     }
  };

  const standardSlides = [
    // 1. Cover
    <div className="relative h-full flex flex-col items-center justify-center text-center space-y-8">
       <h1 className="text-8xl font-black text-[#283b82] tracking-tighter leading-none uppercase">IIoT <span className="text-[#e64d25]">WORLD</span></h1>
       <div className="h-2 w-48 bg-[#e64d25] rounded-full mx-auto"></div>
       <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-800 uppercase">{data.metadata.clientName}</h2>
          <p className="text-xl font-medium text-gray-500 uppercase tracking-widest">{data.metadata.campaignName}</p>
          <div className="text-lg font-black text-[#e64d25] mt-6">{data.metadata.startDate} – {data.metadata.endDate}</div>
       </div>
    </div>,

    // 2. Executive Overview
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-orange-100 pb-2">Campaign Activities</h3>
        <div className="space-y-4">
          {data.activitiesList.map(item => {
            const Content = (
              <div key={item.id} className={`flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all ${item.link ? 'hover:bg-white hover:border-[#e64d25] cursor-pointer shadow-sm' : ''}`}>
                 <Icon type={item.icon} className="w-6 h-6 text-[#283b82]" />
                 <div className="text-sm font-black text-[#283b82] uppercase tracking-tighter">{item.text}</div>
              </div>
            );
            return item.link ? <a key={item.id} href={item.link} target="_blank" className="block">{Content}</a> : Content;
          })}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed font-medium italic border-l-4 border-gray-100 pl-4 mb-6">{data.summaryOfActivities}</p>
        
        {data.resources.mainDriveFolder && (
          <a 
            href={data.resources.mainDriveFolder} 
            target="_blank" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#283b82] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
          >
            <Icon type="DOCS" className="w-5 h-5" />
            Full Social Media Report Folder
          </a>
        )}
      </div>
      <div className="space-y-8">
         <h3 className="text-2xl font-bold text-[#283b82] uppercase tracking-tight border-b-2 border-blue-100 pb-2">Platform Performance</h3>
         <div className="grid grid-cols-1 gap-6">
            {['X', 'LI'].map(platform => {
               const platformKpis = data.executiveKpiSelection
                  .map(id => getKpiData(id))
                  .filter(kpi => kpi && kpi.group === platform);
               
               if (platformKpis.length === 0) return null;

               return (
                  <div key={platform} className="space-y-4">
                     <h4 className={`text-[10px] font-black uppercase tracking-widest ${platform === 'X' ? 'text-orange-500' : 'text-blue-600'}`}>{platform} Highlights</h4>
                     <div className="space-y-4">
                        {platformKpis.map((kpi, idx) => kpi && (
                           <div key={idx} className={`p-6 ${kpi.color} text-white rounded-[2rem] shadow-lg flex justify-between items-center`}>
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
    </div>,

    // 3. X Channel Performance
    <div className="space-y-12">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Reach', value: data.xMetrics.reach, icon: 'GLOBE' },
            { label: 'Total Mentions', value: data.xMetrics.mentions, icon: 'CHAT' },
            { label: 'Total Engagement', value: data.xMetrics.engagement, icon: 'HAND' },
            { label: 'Engagement Rate', value: data.xMetrics.rate, icon: 'GROWTH' },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 p-8 rounded-[2rem] border text-center space-y-2 flex flex-col items-center">
               <Icon type={m.icon} className="w-8 h-8 text-[#283b82] mb-2" />
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</div>
               <div className="text-3xl font-black text-[#283b82]">{m.value}</div>
            </div>
          ))}
       </div>
       <div className="flex flex-col md:flex-row gap-8">
          {data.resources.top20XDriveLink && (
            <div className="w-full flex items-center justify-center p-8 bg-gray-50 rounded-[3rem] border border-dashed hover:border-[#e64d25] transition-colors group">
               <a href={data.resources.top20XDriveLink} target="_blank" className="text-center space-y-2 flex flex-col items-center">
                  <Icon type="DOCS" className="w-10 h-10 text-gray-300 group-hover:text-[#e64d25] transition-all" />
                  <div className="text-[10px] font-black text-[#283b82] uppercase tracking-widest">Top 20 X Posts →</div>
               </a>
            </div>
          )}
       </div>
    </div>,

    // 4. Top X Interactions
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {data.topXPosts.map((post, i) => (
        <div key={i} className="flex gap-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl transition-all">
           <div className="w-1/3 aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border">
              {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-cover" /> : <Icon type="TWITTER" className="w-10 h-10 text-gray-300" />}
           </div>
           <div className="w-2/3 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{post.author?.toUpperCase() || 'X HIGHLIGHT'}</div>
                <h4 className="text-lg font-black text-gray-800 leading-tight">{post.title}</h4>
              </div>
              <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                 <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">Reach</div>
                    <div className="text-2xl font-black text-[#283b82]">{post.reach}</div>
                 </div>
                 <a href={post.link} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">View Post</a>
              </div>
           </div>
        </div>
      ))}
    </div>,

    // 5. LinkedIn Channel Performance
    <div className="space-y-10">
       <div className="bg-[#283b82] text-white p-12 rounded-[4rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
             <div className="text-xs font-black tracking-widest uppercase opacity-70">Total LinkedIn Impressions</div>
             <div className="text-7xl font-black">{data.linkedinMetrics.impressions}</div>
          </div>
          <Icon type="LINKEDIN" className="w-40 h-40 opacity-10 absolute right-8" />
       </div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Posts', value: data.linkedinMetrics.totalPosts, icon: 'DOCS' },
            { label: 'Total Reactions', value: data.linkedinMetrics.totalReactions, icon: 'LIKE' },
            { label: 'Total Comments', value: data.linkedinMetrics.totalComments, icon: 'CHAT' },
            { label: 'Total Engagement', value: data.linkedinMetrics.engagement, icon: 'GROWTH' },
          ].map(m => (
            <div key={m.label} className="bg-white p-6 rounded-[2rem] border-2 border-gray-50 text-center shadow-sm flex flex-col items-center">
               <Icon type={m.icon} className="w-6 h-6 text-[#283b82] mb-2" />
               <div className="text-[10px] font-black text-gray-400 uppercase">{m.label}</div>
               <div className="text-2xl font-black text-[#283b82]">{m.value}</div>
            </div>
          ))}
       </div>
    </div>,

    // 6. Top LinkedIn Highlights
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {data.topLinkedinPosts.map((post, i) => (
        <div key={i} className="flex flex-col bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 space-y-6">
           <div className="aspect-video bg-blue-50 rounded-[2rem] flex items-center justify-center overflow-hidden border">
              {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-cover" /> : <Icon type="LINKEDIN" className="w-20 h-20 text-blue-100" />}
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-start">
                 <h4 className="text-xl font-black text-[#283b82] leading-tight w-3/4">{post.title}</h4>
                 <div className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{post.date}</div>
              </div>
              <div className="flex gap-8 border-t border-gray-50 pt-6">
                 <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Impressions</div>
                    <div className="text-2xl font-black text-[#283b82]">{post.impressions}</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Reactions</div>
                    <div className="text-2xl font-black text-[#e64d25]">{post.reactions}</div>
                 </div>
              </div>
              <div className="pt-2">
                 <a href={post.link} target="_blank" className="text-xs font-black text-blue-600 underline uppercase tracking-widest">View Post →</a>
              </div>
           </div>
        </div>
      ))}
    </div>,

    // 7. LinkedIn Post Inventory
    <div className="space-y-6">
       <div className="overflow-x-auto rounded-[2rem] border-2 border-gray-50 shadow-sm bg-white">
          <table className="w-full text-left text-xs">
             <thead className="bg-[#283b82] text-white uppercase font-black tracking-widest">
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
                             <a href={post[col]} target="_blank" className="text-blue-500 underline hover:text-blue-700">View Post</a>
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
    </div>,

    // 8. Website Content
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {data.articles.map((art, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] border overflow-hidden shadow-2xl flex flex-col hover:scale-[1.02] transition-transform">
           <div className="aspect-[21/9] bg-iiot-orange/5">
              {art.proofImage ? <img src={art.proofImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon type="DOCS" className="w-12 h-12 text-iiot-orange/20" /></div>}
           </div>
           <div className="p-10 space-y-4 flex-grow">
              <h4 className="text-2xl font-black text-[#283b82] leading-tight">{art.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 italic">{art.caption}</p>
              <div className="pt-4">
                <a href={art.link} target="_blank" className="inline-flex items-center gap-2 text-xs font-black text-[#e64d25] uppercase tracking-widest border-b-2 border-[#e64d25] pb-1">Read on Website →</a>
              </div>
           </div>
        </div>
      ))}
    </div>,

    // 9. Video Interviews
    <div className="space-y-12">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.videoInterviews.map((video, i) => {
            const ytId = getYoutubeID(video.link);
            return (
              <div key={i} className="bg-gray-50 rounded-[2.5rem] overflow-hidden border shadow-sm group">
                <div className="aspect-video bg-black relative">
                   {ytId ? (
                     <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen></iframe>
                   ) : <div className="w-full h-full flex items-center justify-center text-white/50">PREVIEW N/A</div>}
                </div>
                <div className="p-8 flex justify-between items-center">
                   <h4 className="text-lg font-black text-[#283b82] truncate pr-4">{video.title}</h4>
                   <a 
                      href={video.link} 
                      target="_blank" 
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex-shrink-0"
                   >Watch Video</a>
                </div>
              </div>
            );
          })}
       </div>
    </div>,

    // 10. Video Collateral
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.videoCollateral.map((vid, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border shadow-lg flex flex-col gap-6">
               <div className="aspect-video bg-[#283b82]/10 rounded-2xl flex items-center justify-center overflow-hidden border">
                  {vid.base64Video ? <video src={vid.base64Video} controls className="w-full h-full object-cover" /> : <div className="font-black text-blue-200"><Icon type="VIDEO" className="w-12 h-12" /></div>}
               </div>
               <div className="space-y-4">
                  <h4 className="text-xl font-black text-[#283b82]">{vid.title}</h4>
                  <div className="flex gap-4">
                     {vid.linkedinLink && (
                        <a href={vid.linkedinLink} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-[#283b82] uppercase underline">
                           <Icon type="LINKEDIN" className="w-4 h-4" /> View on LinkedIn
                        </a>
                     )}
                     {vid.xLink && (
                        <a href={vid.xLink} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-[#e64d25] uppercase underline">
                           <Icon type="TWITTER" className="w-4 h-4" /> View on X
                        </a>
                     )}
                  </div>
               </div>
            </div>
          ))}
       </div>
       {data.resources.visualsDriveLink && (
          <div className="flex justify-center pt-6">
            <a 
               href={data.resources.visualsDriveLink} 
               target="_blank" 
               className="px-10 py-5 bg-[#283b82] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
            >
               <Icon type="DOCS" className="w-5 h-5" />
               Visuals Drive Folder
            </a>
          </div>
       )}
    </div>,

    // 11. Creative Assets
    <div className="space-y-8">
       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {data.graphics.map((g, i) => (
            <div key={i} className="group relative bg-gray-50 rounded-2xl overflow-hidden border shadow-sm aspect-square">
               <img src={g.url} className="w-full h-full object-contain" alt={g.label} />
            </div>
          ))}
       </div>
       {data.resources.visualsDriveLink && (
          <div className="flex justify-center mt-10">
            <a 
               href={data.resources.visualsDriveLink} 
               target="_blank" 
               className="px-10 py-5 bg-[#283b82] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all"
            >
               Full Assets Drive Folder
            </a>
          </div>
       )}
    </div>,

    // 12. Newsletter Placements
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.linkedinNewsletters.map((newsletter, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border overflow-hidden shadow-2xl flex flex-col group">
               <div className="aspect-[4/3] bg-gray-50 border-b relative">
                  {newsletter.proofImage ? <img src={newsletter.proofImage} className="w-full h-full object-contain" alt="" /> : <div className="w-full h-full flex items-center justify-center text-orange-200 font-black text-4xl uppercase"><Icon type="DOCS" className="w-16 h-16" /></div>}
               </div>
               <div className="p-10 space-y-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DATE: {newsletter.date}</div>
                  <h4 className="text-xl font-black text-[#283b82] leading-tight line-clamp-2">{newsletter.title}</h4>
                  <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                     <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase">Impressions</div>
                        <div className="text-2xl font-black text-[#e64d25]">{newsletter.impressions}</div>
                     </div>
                     <a href={newsletter.link} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">View URL</a>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>,

    // 13. IIoT World Newsletter Inserts
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.iiotNewsletterInserts.map((ins, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border shadow-xl flex flex-col items-center">
               <img src={ins.image} className="w-full h-auto max-h-[400px] object-contain rounded-xl" alt="" />
               <div className="mt-6 text-center font-black text-[#283b82] text-sm uppercase tracking-widest">{ins.title}</div>
            </div>
          ))}
       </div>
    </div>
  ];

  const customSlideViews = data.customSlides.map(slide => (
    <div key={slide.id} className="h-full flex flex-col space-y-6">
       {slide.subtitle && <h3 className="text-2xl font-black text-[#e64d25] uppercase tracking-tight">{slide.subtitle}</h3>}
       {slide.content && <p className="text-lg text-gray-600 leading-relaxed font-medium">{slide.content}</p>}
       
       <div className="flex-grow flex flex-col gap-6">
          {slide.type === 'file' && slide.fileData && (
             <div className="flex-grow flex items-center justify-center border-4 border-dashed rounded-[3rem] p-10 bg-gray-50 overflow-hidden">
                <img src={slide.fileData} className="max-w-full max-h-[400px] object-contain shadow-2xl rounded-2xl" alt="" />
             </div>
          )}
          
          {(slide.link || slide.type === 'link') && slide.link && (
             <div className="flex justify-center">
                <a 
                   href={slide.link} 
                   target="_blank" 
                   className="px-12 py-5 bg-[#283b82] text-white rounded-[2rem] text-center shadow-2xl hover:scale-105 transition-transform font-black uppercase text-xs tracking-widest flex items-center gap-3"
                >
                   <Icon type="GLOBE" className="w-4 h-4" />
                   {slide.linkText || 'View Resource'}
                </a>
             </div>
          )}
       </div>
    </div>
  ));

  const slides = [...standardSlides];
  const slideTitles = [...data.slideTitles];

  // Map custom slides and their titles
  data.customSlides.forEach((slide, idx) => {
    slides.push(customSlideViews[idx]);
    slideTitles.push(slide.title);
  });

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-full animate-fadeIn">
      <div className="lg:w-3/4 h-full print:w-full">
        <SlideWrapper title={slideTitles[activeSlide]}>
          <div className="animate-slideUp">{slides[activeSlide]}</div>
        </SlideWrapper>
      </div>
      <div className="lg:w-1/4 h-full print:hidden">
         <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
            <h3 className="text-sm font-black text-[#283b82] uppercase mb-8 pb-4 border-b">Report Navigator</h3>
            <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
               {slideTitles.map((title, i) => (
                 <button key={i} onClick={() => setActiveSlide(i)} className={`w-full text-left px-5 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${activeSlide === i ? 'bg-[#283b82] text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'}`}>{title}</button>
               ))}
            </div>
            <button onClick={() => window.print()} className="w-full mt-10 py-5 bg-[#e64d25] text-white font-black rounded-3xl shadow-xl hover:-translate-y-1 transition-all text-xs uppercase tracking-widest">Export Report PDF</button>
         </div>
      </div>
    </div>
  );
};

export default PresentationView;
