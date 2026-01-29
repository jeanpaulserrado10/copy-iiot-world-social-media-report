import React, { useState } from 'react';
import { ReportData, SocialPost, ArticleInfo, VideoInfo, CustomSlide } from '../types';

declare const LZString: any;

interface PresentationViewProps {
  data: ReportData;
  onBackToEdit?: () => void;
}

export const Icon = ({ type, className = "w-6 h-6" }: { type: string, className?: string }) => {
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
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"/></svg>;
    case 'MAIL':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l12-9.725v15.438h-24v-15.438l12 9.725z"/></svg>;
    case 'PLAY':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
    case 'EDIT':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
    case 'SHARE':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};

const IIoTLogo = () => (
  <div className="flex flex-col items-center">
    <div className="text-8xl font-black text-[#e64d25] tracking-tighter uppercase">IIoT <span className="font-bold">World</span></div>
  </div>
);

const SlideWrapper: React.FC<{ 
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
}> = ({ children, title, noContainer, activeSlide, totalSlides, onDotClick, clientName, campaignName, activeConfigs, isPrint }) => (
  <div className={`w-full ${!isPrint ? 'min-h-[650px]' : 'min-h-[1050px]'} ${noContainer ? '' : 'bg-white rounded-xl shadow-2xl border-t-8 border-[#e64d25]'} overflow-hidden flex flex-col print:shadow-none print:border-none print:m-0 print:border-t-iiot-orange`}>
     {!noContainer && (
       <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#e64d25] rounded flex items-center justify-center text-white text-[10px] font-black">II</div>
            <span className="font-black text-xs text-[#283b82] tracking-tighter">IIoT WORLD</span>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {clientName} | {campaignName}
          </div>
       </div>
     )}
     <div className={`flex-grow ${noContainer ? '' : 'p-10'} ${!isPrint ? 'overflow-y-auto' : ''}`}>
       {title && <h2 className="text-4xl font-extrabold text-[#3f3f3f] mb-10 border-l-8 border-[#e64d25] pl-6 uppercase tracking-tight">{title}</h2>}
       {children}
     </div>
     {!isPrint && (
       <div className={`p-4 ${noContainer ? 'bg-[#e64d25]' : 'bg-gray-50 border-t border-gray-100'} flex justify-between items-center px-8 print:hidden`}>
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

const PresentationView: React.FC<PresentationViewProps> = ({ data, onBackToEdit }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'done'>('idle');

  const activeConfigs = (data.slideSequence || []).filter(s => s.enabled);
  const safeActiveSlide = Math.min(activeSlide, Math.max(0, activeConfigs.length - 1));
  const currentConfig = activeConfigs[safeActiveSlide];

  const handleShare = async () => {
    setShareStatus('copying');
    try {
      const dataToShare = JSON.parse(JSON.stringify(data));
      dataToShare.topXPosts = dataToShare.topXPosts.map((p: any) => ({ ...p, proofImage: undefined }));
      dataToShare.topLinkedinPosts = dataToShare.topLinkedinPosts.map((p: any) => ({ ...p, proofImage: undefined }));
      dataToShare.articles = dataToShare.articles.map((a: any) => ({ ...a, proofImage: undefined }));
      dataToShare.linkedinNewsletters = dataToShare.linkedinNewsletters.map((p: any) => ({ ...p, proofImage: undefined }));
      dataToShare.graphics = [];
      dataToShare.iiotNewsletterInserts = [];
      dataToShare.customSlides = (dataToShare.customSlides || []).map((s: any) => ({ ...s, fileData: undefined }));
      dataToShare.videoCollateral = (dataToShare.videoCollateral || []).map((v: any) => ({ ...v, base64Video: undefined }));
      
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(dataToShare));
      const url = `${window.location.origin}${window.location.pathname}?report=${compressed}`;
      
      await navigator.clipboard.writeText(url);
      setShareStatus('done');
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      alert("Sharing failed. Even with compression, your report is too large.");
      setShareStatus('idle');
    }
  };

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

  const renderSlideContent = (slideId: string) => {
    const custom = (data.customSlides || []).find(s => s.id === slideId);
    if (custom) {
      return (
        <div className="h-full flex flex-col space-y-6">
           {custom.subtitle && <h3 className="text-2xl font-black text-[#e64d25] uppercase tracking-tight">{custom.subtitle}</h3>}
           {custom.content && <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">{custom.content}</p>}
           <div className="flex-grow flex flex-col gap-6">
              {custom.type === 'file' && custom.fileData && (
                 <div className="flex-grow flex items-center justify-center border-4 border-dashed rounded-[3rem] p-10 bg-gray-50 overflow-hidden">
                    <img src={custom.fileData} className="max-w-full max-h-[400px] object-contain shadow-2xl rounded-2xl" alt="" />
                 </div>
              )}
              {custom.link && (
                 <div className="flex justify-center">
                    <a href={custom.link} target="_blank" className="px-12 py-5 bg-[#283b82] text-white rounded-[2rem] text-center shadow-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
                       <Icon type="GLOBE" className="w-4 h-4" />
                       {custom.linkText || 'View Resource'}
                    </a>
                 </div>
              )}
           </div>
        </div>
      );
    }

    switch(slideId) {
      case 'cover':
        return (
          <div className="relative h-full flex flex-col items-center justify-center text-center space-y-12">
             <IIoTLogo />
             <div className="h-2 w-48 bg-[#e64d25] rounded-full mx-auto opacity-50"></div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-[#283b82] uppercase tracking-tighter">{data.metadata.clientName}</h2>
                <p className="text-xl font-medium text-gray-500 uppercase tracking-widest text-center">Statistics for {data.metadata.campaignName}</p>
                <div className="text-lg font-black text-[#e64d25] mt-6 bg-orange-50 px-6 py-2 rounded-full inline-block">{data.metadata.startDate} – {data.metadata.endDate}</div>
             </div>
          </div>
        );
      case 'executive':
        return (
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
              <p className="text-xs text-gray-500 leading-relaxed font-medium italic border-l-4 border-gray-100 pl-4 mb-6 whitespace-pre-line">{data.summaryOfActivities}</p>
              {data.resources.mainDriveFolder && (
                <a href={data.resources.mainDriveFolder} target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-[#283b82] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-2xl">
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
        return (
          <div className="space-y-12">
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Reach', value: data.xMetrics.reach, icon: 'GLOBE' },
                  { label: 'Total Mentions', value: data.xMetrics.mentions, icon: 'CHAT' },
                  { label: 'Total Impressions', value: data.xMetrics.impressions, icon: 'DOCS' },
                  { label: 'Total Engagement', value: data.xMetrics.engagement, icon: 'HAND' },
                  { label: 'Engagement Rate', value: data.xMetrics.rate, icon: 'GROWTH' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 p-6 rounded-[2rem] border text-center space-y-2 flex flex-col items-center">
                     <Icon type={m.icon} className="w-6 h-6 text-[#283b82] mb-1" />
                     <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-tight">{m.label}</div>
                     <div className="text-xl font-black text-[#283b82]">{m.value}</div>
                  </div>
                ))}
             </div>
             
             <div className="flex flex-col md:flex-row gap-6 pt-6">
                {data.resources.brandwatchDriveLink && (
                  <div className="flex-1 flex items-center justify-center p-6 bg-orange-50 rounded-[2.5rem] border border-orange-200 hover:bg-orange-100 transition-all group">
                     <a href={data.resources.brandwatchDriveLink} target="_blank" className="text-center space-y-2 flex flex-col items-center">
                        <Icon type="DOCS" className="w-10 h-10 text-[#e64d25]" />
                        <div className="text-[10px] font-black text-[#283b82] uppercase tracking-widest">Brandwatch Full Report →</div>
                     </a>
                  </div>
                )}
                {data.resources.top20XDriveLink && (
                  <div className="flex-1 flex items-center justify-center p-6 bg-blue-50 rounded-[2.5rem] border border-blue-200 hover:bg-blue-100 transition-all group">
                     <a href={data.resources.top20XDriveLink} target="_blank" className="text-center space-y-2 flex flex-col items-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.topXPosts.map((post, i) => (
              <div key={i} className="flex gap-6 bg-white p-8 rounded-[2rem] border border-gray-50 transition-all shadow-xl">
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
                          <div className="text-[9px] text-gray-400 font-bold uppercase">Impressions</div>
                          <div className="text-2xl font-black text-[#283b82]">{post.impressions}</div>
                       </div>
                       <a href={post.link} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">View Post</a>
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
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Posts', value: data.linkedinMetrics.totalPosts, icon: 'DOCS' },
                  { label: 'Total Reactions', value: data.linkedinMetrics.totalReactions, icon: 'LIKE' },
                  { label: 'Total Comments', value: data.linkedinMetrics.totalComments, icon: 'CHAT' },
                  { label: 'Total Engagement', value: data.linkedinMetrics.engagement, icon: 'GROWTH' },
                ].map(m => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.topLinkedinPosts.map((post, i) => (
              <div key={i} className="flex flex-col bg-white p-8 rounded-[3rem] border border-gray-50 space-y-6 shadow-xl">
                 <div className="aspect-video bg-blue-50 rounded-[2rem] flex items-center justify-center overflow-hidden border">
                    {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-cover" /> : <Icon type="LINKEDIN" className="w-20 h-20 text-blue-100" />}
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-start">
                       <h4 className="text-xl font-black text-[#283b82] leading-tight w-3/4">{post.title}</h4>
                       <div className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{post.date}</div>
                    </div>
                    <div className="flex gap-8 border-t border-gray-100 pt-6">
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
          </div>
        );
      case 'linkedin_inventory':
        return (
          <div className="space-y-6">
             <div className="overflow-x-auto rounded-[2rem] border-2 border-gray-50 bg-white shadow-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.articles.map((art, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border overflow-hidden flex flex-col transition-transform shadow-2xl">
                 <div className="aspect-[21/9] bg-orange-50">
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
          </div>
        );
      case 'video_interviews':
        return (
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
                         <a href={video.link} target="_blank" className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all">Watch Video</a>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        );
      case 'video_collateral':
        return (
          <div className="space-y-8 h-full flex flex-col">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                {data.videoCollateral.map((vid, i) => (
                  <div key={i} className="bg-white p-8 rounded-[3rem] border flex flex-col gap-6 shadow-lg">
                     <div className="aspect-video bg-[#283b82]/10 rounded-2xl flex items-center justify-center overflow-hidden border">{vid.base64Video ? <video src={vid.base64Video} controls className="w-full h-full object-cover" /> : <div className="font-black text-blue-200"><Icon type="VIDEO" className="w-12 h-12" /></div>}</div>
                     <div className="space-y-4">
                        <h4 className="text-xl font-black text-[#283b82]">{vid.title}</h4>
                        <div className="flex gap-4 flex-wrap">
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
               <div className="flex justify-center mt-auto">
                 <a href={data.resources.visualsDriveLink} target="_blank" className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#283b82] hover:text-white transition-colors">
                    <Icon type="DOCS" className="w-4 h-4" />
                    View Video Assets Folder
                 </a>
               </div>
             )}
          </div>
        );
      case 'creative_assets':
        return (
          <div className="space-y-8 h-full flex flex-col">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow content-start">
                {data.graphics.map((g, i) => (
                  <div key={i} className="group relative bg-gray-50 rounded-2xl overflow-hidden border aspect-square shadow-sm">
                     <img src={g.url} className="w-full h-full object-contain" alt={g.label} />
                  </div>
                ))}
             </div>
             {data.resources.visualsDriveLink && (
               <div className="flex justify-center mt-auto pt-8">
                 <a href={data.resources.visualsDriveLink} target="_blank" className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#e64d25] hover:text-white transition-colors">
                    <Icon type="DOCS" className="w-4 h-4" />
                    View Full Visual Assets Folder
                 </a>
               </div>
             )}
          </div>
        );
      case 'newsletter_placements':
        return (
          <div className="space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.linkedinNewsletters.map((newsletter, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] border overflow-hidden flex flex-col group shadow-2xl">
                     <div className="aspect-[4/3] bg-gray-50 border-b relative">
                        {newsletter.proofImage ? <img src={newsletter.proofImage} className="w-full h-full object-contain" alt="" /> : <div className="w-full h-full flex items-center justify-center text-orange-200 font-black text-4xl uppercase"><Icon type="DOCS" className="w-16 h-16" /></div>}
                     </div>
                     <div className="p-10 space-y-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DATE: {newsletter.date || 'N/A'}</div>
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
          </div>
        );
      case 'iiot_newsletter_inserts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.iiotNewsletterInserts.map((ins, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border flex flex-col items-center shadow-xl">
                 <img src={ins.image} className="w-full h-auto max-h-[400px] object-contain rounded-xl" alt="" />
                 <div className="mt-6 text-center font-black text-[#283b82] text-sm uppercase tracking-widest">{ins.title}</div>
              </div>
            ))}
          </div>
        );
      case 'x_metrics':
        return (
          <div className="space-y-8 flex flex-col h-full">
             <div className="mb-4">
               <p className="text-xl text-gray-600 font-medium">Check the full glossary of Brandwatch metrics <a href="https://www.brandwatch.com/help/glossary/" target="_blank" className="text-[#e64d25] underline decoration-2 underline-offset-4">here</a>.</p>
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
          <div className="w-full min-h-full bg-[#e64d25] text-white flex flex-col items-center justify-center relative overflow-hidden p-8 print:p-0">
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

  if (!currentConfig) return null;

  const isFinalSlide = currentConfig?.id === 'thank_you';

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-full animate-fadeIn">
      <div className="hidden print:block w-full">
         <div className="print-content-container">
            {activeConfigs.map((config, idx) => (
               <div key={config.id} className="print-page-break">
                  <SlideWrapper 
                    title={config.id === 'thank_you' ? undefined : config.label} 
                    noContainer={config.id === 'thank_you'}
                    activeSlide={idx}
                    totalSlides={activeConfigs.length}
                    clientName={data.metadata.clientName}
                    campaignName={data.metadata.campaignName}
                    activeConfigs={activeConfigs}
                    isPrint={true}
                  >
                     {renderSlideContent(config.id)}
                  </SlideWrapper>
               </div>
            ))}
         </div>
      </div>

      <div className="lg:w-3/4 h-full print:hidden">
        <SlideWrapper 
          title={isFinalSlide ? undefined : currentConfig?.label} 
          noContainer={isFinalSlide}
          activeSlide={safeActiveSlide}
          totalSlides={activeConfigs.length}
          onDotClick={setActiveSlide}
          clientName={data.metadata.clientName}
          campaignName={data.metadata.campaignName}
          activeConfigs={activeConfigs}
        >
          <div className="animate-slideUp h-full">
             {renderSlideContent(currentConfig.id)}
          </div>
        </SlideWrapper>
      </div>
      <div className="lg:w-1/4 h-full print:hidden">
         <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
            <h3 className="text-sm font-black text-[#283b82] uppercase mb-8 pb-4 border-b">Report Navigator</h3>
            <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
               {activeConfigs.map((config, i) => (
                 <button key={config.id} onClick={() => setActiveSlide(i)} className={`w-full text-left px-5 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${safeActiveSlide === i ? 'bg-[#283b82] text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'}`}>{config.label}</button>
               ))}
            </div>
            <div className="mt-8 space-y-4">
              <button onClick={() => window.print()} className="w-full py-5 bg-[#e64d25] text-white font-black rounded-3xl shadow-xl hover:-translate-y-1 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Icon type="DOCS" className="w-4 h-4" /> Export Report PDF
              </button>
              <button onClick={handleShare} className={`w-full py-5 border-2 ${shareStatus === 'done' ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-500'} font-black rounded-3xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2`}>
                <Icon type={shareStatus === 'done' ? 'STAR' : 'SHARE'} className="w-4 h-4" /> {shareStatus === 'copying' ? 'Generating...' : shareStatus === 'done' ? 'Link Copied!' : 'Website Mode Link'}
              </button>
              {onBackToEdit && (
                <button onClick={onBackToEdit} className="w-full py-4 border-2 border-gray-100 text-gray-400 hover:text-iiot-blue hover:border-iiot-blue/30 font-black rounded-3xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Icon type="EDIT" className="w-3.5 h-3.5" /> Edit Report Details
                </button>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PresentationView;