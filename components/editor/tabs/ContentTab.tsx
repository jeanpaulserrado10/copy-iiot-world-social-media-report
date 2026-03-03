
import React from 'react';
import { ReportData, SocialPost, VideoInfo } from '../../../types';
import { Icon } from '../../Icon';

interface ContentTabProps {
  reportData: ReportData;
  setReportData: (data: ReportData) => void;
  assignProofImage: (file: File, type: 'X' | 'LI', id: string) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ reportData, setReportData, assignProofImage }) => {
  
  const parseVal = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/,/g, '').replace(/%/g, '')) || 0;
  };

  const formatVal = (val: number) => val.toLocaleString();

  const recalculateReportTotals = (posts: SocialPost[]) => {
    const totals = posts.reduce((acc, post) => ({
      impressions: acc.impressions + parseVal(post.impressions),
      engagements: acc.engagements + parseVal(post.engagements),
      reactions: acc.reactions + parseVal(post.reactions),
      comments: acc.comments + parseVal(post.comments),
      clicks: acc.clicks + parseVal(post.clicks),
      reposts: acc.reposts + parseVal(post.reposts),
    }), { impressions: 0, engagements: 0, reactions: 0, comments: 0, clicks: 0, reposts: 0 });

    return {
      ...reportData.linkedinMetrics,
      impressions: formatVal(totals.impressions),
      engagement: formatVal(totals.engagements), 
      totalReactions: formatVal(totals.reactions),
      totalComments: formatVal(totals.comments),
      totalClicks: formatVal(totals.clicks),
      totalReposts: formatVal(totals.reposts),
      totalPosts: String(posts.length)
    };
  };

  const updateInventoryData = (index: number, field: string, value: string) => {
    const newPosts = [...reportData.allLinkedinPosts];
    (newPosts[index] as any)[field] = value;
    const newMetrics = recalculateReportTotals(newPosts);
    setReportData({ ...reportData, allLinkedinPosts: newPosts, linkedinMetrics: newMetrics });
  };

  const addInventoryPost = () => {
    const newPost: SocialPost = {
      id: `ali-new-${Date.now()}`,
      platform: 'LinkedIn',
      title: 'New Content Entry',
      date: new Date().toISOString().split('T')[0],
      impressions: '0',
      engagements: '0',
      reactions: '0',
      clicks: '0',
      reposts: '0',
      views: '0', 
      link: ''
    };
    const newPosts = [newPost, ...reportData.allLinkedinPosts];
    const newMetrics = recalculateReportTotals(newPosts);
    setReportData({ ...reportData, allLinkedinPosts: newPosts, linkedinMetrics: newMetrics });
  };

  const deleteInventoryPost = (index: number) => {
    const newPosts = reportData.allLinkedinPosts.filter((_, i) => i !== index);
    const newMetrics = recalculateReportTotals(newPosts);
    setReportData({ ...reportData, allLinkedinPosts: newPosts, linkedinMetrics: newMetrics });
  };

  const addTopXPost = () => {
    const newPost: SocialPost = { 
      id: `tx-new-${Date.now()}`, 
      platform: 'X', 
      title: 'New X Highlight', 
      impressions: '', 
      reach: '', 
      link: '',
      author: 'IIoT World' 
    };
    setReportData({ ...reportData, topXPosts: [...reportData.topXPosts, newPost] });
  };

  const deleteTopXPost = (index: number) => {
    const newPosts = reportData.topXPosts.filter((_, i) => i !== index);
    setReportData({ ...reportData, topXPosts: newPosts });
  };

  const addTopLiPost = () => {
    const newPost: SocialPost = { 
      id: `tl-new-${Date.now()}`, 
      platform: 'LinkedIn', 
      title: 'New LinkedIn Highlight', 
      impressions: '', 
      reactions: '', 
      link: '' 
    };
    setReportData({ ...reportData, topLinkedinPosts: [...reportData.topLinkedinPosts, newPost] });
  };

  const deleteTopLiPost = (index: number) => {
    const newPosts = reportData.topLinkedinPosts.filter((_, i) => i !== index);
    setReportData({ ...reportData, topLinkedinPosts: newPosts });
  };

  const addNewsletter = () => {
    const newPost: SocialPost = {
      id: `ln-new-${Date.now()}`,
      platform: 'LinkedIn',
      title: 'New Newsletter Edition',
      date: new Date().toISOString().split('T')[0],
      impressions: '0',
      reactions: '0',
      link: ''
    };
    setReportData({ ...reportData, linkedinNewsletters: [...reportData.linkedinNewsletters, newPost] });
  };

  const deleteNewsletter = (index: number) => {
    const newNewsletters = reportData.linkedinNewsletters.filter((_, i) => i !== index);
    setReportData({ ...reportData, linkedinNewsletters: newNewsletters });
  };

  const addFromInventoryToNewsletter = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const postId = e.target.value;
      if (!postId) return;
      
      const post = reportData.allLinkedinPosts.find(p => p.id === postId);
      if (post) {
          const newNewsletter: SocialPost = {
              ...post,
              id: `ln-inv-${Date.now()}`
          };
          setReportData({ ...reportData, linkedinNewsletters: [...reportData.linkedinNewsletters, newNewsletter] });
      }
      e.target.value = "";
  };

  const addArticle = () => {
     setReportData({
        ...reportData,
        articles: [...reportData.articles, { id: `art-new-${Date.now()}`, title: 'New Article', caption: '', link: '', date: '' }]
     });
  };

  const updateArticle = (idx: number, field: string, value: string) => {
     const next = [...reportData.articles];
     (next[idx] as any)[field] = value;
     setReportData({...reportData, articles: next});
  };

  const handleArticleImage = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
     if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
           const next = [...reportData.articles];
           next[idx].proofImage = ev.target?.result as string;
           setReportData({...reportData, articles: next});
        };
        reader.readAsDataURL(e.target.files[0]);
     }
  };

  // --- VIDEO HELPER WITH MULTIPLE LINKS ---
  const addVideoLink = (videoList: VideoInfo[], idx: number, type: 'interview' | 'collateral') => {
      const next = [...videoList];
      const video = next[idx];
      const newLink = { type: 'linkedin' as const, url: '' };
      video.extraLinks = [...(video.extraLinks || []), newLink];
      
      if (type === 'interview') setReportData({...reportData, videoInterviews: next});
      else setReportData({...reportData, videoCollateral: next});
  };

  const updateVideoLink = (videoList: VideoInfo[], vIdx: number, lIdx: number, field: 'type' | 'url', value: string, type: 'interview' | 'collateral') => {
      const next = [...videoList];
      const links = [...(next[vIdx].extraLinks || [])];
      links[lIdx] = { ...links[lIdx], [field]: value };
      next[vIdx].extraLinks = links;

      if (type === 'interview') setReportData({...reportData, videoInterviews: next});
      else setReportData({...reportData, videoCollateral: next});
  };

  const removeVideoLink = (videoList: VideoInfo[], vIdx: number, lIdx: number, type: 'interview' | 'collateral') => {
      const next = [...videoList];
      next[vIdx].extraLinks = (next[vIdx].extraLinks || []).filter((_, i) => i !== lIdx);
      
      if (type === 'interview') setReportData({...reportData, videoInterviews: next});
      else setReportData({...reportData, videoCollateral: next});
  };

  const addVideoInterview = () => {
     setReportData({
        ...reportData,
        videoInterviews: [...reportData.videoInterviews, { id: `vi-new-${Date.now()}`, type: 'interview', title: 'New Video Interview', link: '', extraLinks: [] }]
     });
  };

  const updateVideoInterview = (idx: number, field: string, value: string) => {
     const next = [...reportData.videoInterviews];
     (next[idx] as any)[field] = value;
     setReportData({...reportData, videoInterviews: next});
  };

  return (
    <div className="space-y-8 animate-fadeIn">

       {/* EXTERNAL ECOSYSTEM EDITING */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">External Ecosystem Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {['mainDriveFolder', 'top20XDriveLink', 'brandwatchDriveLink', 'visualsDriveLink', 'shortsDriveLink', 'additionalMedia'].map(key => (
               <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                      {key !== 'additionalMedia' && (
                          <label className="flex items-center gap-1 cursor-pointer bg-gray-50 px-2 rounded hover:bg-gray-100">
                             <input 
                               type="checkbox" 
                               className="accent-[#e64d25] w-3 h-3 cursor-pointer"
                               checked={(reportData.resources as any)[key + '_visible'] ?? !!(reportData.resources as any)[key]}
                               onChange={e => setReportData({...reportData, resources: {...reportData.resources, [key + '_visible']: e.target.checked}})}
                             />
                             <span className="text-[7px] font-bold text-gray-500 uppercase">Show Button</span>
                          </label>
                      )}
                  </div>
                  <input 
                    className="w-full p-2 bg-gray-50 rounded-lg text-xs border focus:border-[#e64d25] outline-none" 
                    value={(reportData.resources as any)[key] || ''} 
                    onChange={e => setReportData({...reportData, resources: {...reportData.resources, [key]: e.target.value}})} 
                    placeholder="https://..."
                  />
               </div>
             ))}
          </div>
       </div>

       {/* Top X Posts */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Top X Posts (Slide 4)</h3>
             <button onClick={addTopXPost} className="text-xs font-bold text-white bg-[#e64d25] px-4 py-2 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">+ Add X Post</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {reportData.topXPosts.map((post, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                   <button onClick={() => deleteTopXPost(i)} className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition-colors z-10">×</button>
                   <div className="flex gap-2">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden group border border-gray-300">
                         {post.proofImage ? (
                            <>
                                <img src={post.proofImage} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { const n = [...reportData.topXPosts]; n[i].proofImage = undefined; setReportData({...reportData, topXPosts: n}); }}
                                    className="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-red-500 z-20"
                                >×</button>
                            </>
                         ) : <div className="flex items-center justify-center h-full text-[8px] text-gray-400">IMG</div>}
                         <input type="file" onChange={(e) => e.target.files && assignProofImage(e.target.files[0], 'X', post.id)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      </div>
                      <div className="flex-grow space-y-2">
                         <input value={post.author || ''} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].author = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] font-bold text-blue-400" placeholder="Author Name" />
                         <input value={post.title} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].title = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] font-bold" placeholder="Title" />
                         <input value={post.impressions} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].impressions = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px]" placeholder="Impressions (Optional)" />
                         <input value={post.link} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].link = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] text-blue-500" placeholder="Link" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Top LinkedIn Posts */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Top LinkedIn Posts (Slide 6)</h3>
             <button onClick={addTopLiPost} className="text-xs font-bold text-white bg-[#283b82] px-4 py-2 rounded-xl shadow-lg hover:bg-[#1a2b63] transition-colors">+ Add LinkedIn Post</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {reportData.topLinkedinPosts.map((post, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                   <button onClick={() => deleteTopLiPost(i)} className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition-colors z-10">×</button>
                   <div className="flex gap-2">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden group border border-gray-300">
                         {post.proofImage ? (
                            <>
                                <img src={post.proofImage} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { const n = [...reportData.topLinkedinPosts]; n[i].proofImage = undefined; setReportData({...reportData, topLinkedinPosts: n}); }}
                                    className="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-red-500 z-20"
                                >×</button>
                            </>
                         ) : <div className="flex items-center justify-center h-full text-[8px] text-gray-400">IMG</div>}
                         <input type="file" onChange={(e) => e.target.files && assignProofImage(e.target.files[0], 'LI', post.id)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      </div>
                      <div className="flex-grow space-y-2">
                         <input value={post.author || ''} onChange={(e) => { const n = [...reportData.topLinkedinPosts]; n[i].author = e.target.value; setReportData({...reportData, topLinkedinPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] font-bold text-blue-400" placeholder="Author Name" />
                         <input value={post.title} onChange={(e) => { const n = [...reportData.topLinkedinPosts]; n[i].title = e.target.value; setReportData({...reportData, topLinkedinPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] font-bold" placeholder="Title" />
                         <div className="flex gap-2">
                            <input value={post.impressions} onChange={(e) => { const n = [...reportData.topLinkedinPosts]; n[i].impressions = e.target.value; setReportData({...reportData, topLinkedinPosts: n}); }} className="w-1/2 p-1 bg-white border rounded text-[10px]" placeholder="Imp." />
                            <input value={post.reactions} onChange={(e) => { const n = [...reportData.topLinkedinPosts]; n[i].reactions = e.target.value; setReportData({...reportData, topLinkedinPosts: n}); }} className="w-1/2 p-1 bg-white border rounded text-[10px]" placeholder="React." />
                         </div>
                         <input value={post.link} onChange={(e) => { const n = [...reportData.topLinkedinPosts]; n[i].link = e.target.value; setReportData({...reportData, topLinkedinPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] text-blue-500" placeholder="Link" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* NEW NEWSLETTER SECTION */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">LinkedIn Newsletter Placements (Slide 12)</h3>
             <div className="flex gap-2 flex-wrap">
               <select onChange={addFromInventoryToNewsletter} className="text-xs font-bold text-[#283b82] bg-blue-50 px-3 py-2 rounded-xl outline-none border-transparent focus:border-blue-200 cursor-pointer max-w-[200px]">
                  <option value="">+ Add from Inventory...</option>
                  {reportData.allLinkedinPosts.map(p => (
                      <option key={p.id} value={p.id}>{p.date} - {p.title ? p.title.substring(0, 30) : 'Untitled'}...</option>
                  ))}
               </select>
               <button onClick={addNewsletter} className="text-xs font-bold text-white bg-[#283b82] px-4 py-2 rounded-xl shadow-lg hover:bg-[#1a2b63] transition-colors">+ Manual Entry</button>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {reportData.linkedinNewsletters.map((post, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                   <button onClick={() => deleteNewsletter(i)} className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition-colors z-10">×</button>
                   <div className="flex gap-2">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden group border border-gray-300">
                         {post.proofImage ? (
                            <>
                                <img src={post.proofImage} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { const n = [...reportData.linkedinNewsletters]; n[i].proofImage = undefined; setReportData({...reportData, linkedinNewsletters: n}); }}
                                    className="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-red-500 z-20"
                                >×</button>
                            </>
                         ) : <div className="flex items-center justify-center h-full text-[8px] text-gray-400">IMG</div>}
                         <input type="file" onChange={(e) => e.target.files && assignProofImage(e.target.files[0], 'LI', post.id)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      </div>
                      <div className="flex-grow space-y-2">
                         <input value={post.title} onChange={(e) => { const n = [...reportData.linkedinNewsletters]; n[i].title = e.target.value; setReportData({...reportData, linkedinNewsletters: n}); }} className="w-full p-1 bg-white border rounded text-[10px] font-bold" placeholder="Newsletter Title" />
                         <div className="flex gap-2">
                            <input value={post.impressions} onChange={(e) => { const n = [...reportData.linkedinNewsletters]; n[i].impressions = e.target.value; setReportData({...reportData, linkedinNewsletters: n}); }} className="w-1/3 p-1 bg-white border rounded text-[10px]" placeholder="Imp." />
                            <input value={post.views || ''} onChange={(e) => { const n = [...reportData.linkedinNewsletters]; n[i].views = e.target.value; setReportData({...reportData, linkedinNewsletters: n}); }} className="w-1/3 p-1 bg-white border rounded text-[10px]" placeholder="Views" />
                            <input value={post.date || ''} onChange={(e) => { const n = [...reportData.linkedinNewsletters]; n[i].date = e.target.value; setReportData({...reportData, linkedinNewsletters: n}); }} className="w-1/3 p-1 bg-white border rounded text-[10px]" placeholder="Date" />
                         </div>
                         <input value={post.link} onChange={(e) => { const n = [...reportData.linkedinNewsletters]; n[i].link = e.target.value; setReportData({...reportData, linkedinNewsletters: n}); }} className="w-full p-1 bg-white border rounded text-[10px] text-blue-500" placeholder="Link" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* NEW: ARTICLES & WEBSITE CONTENT */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Website Articles (Slide 8)</h3>
             <button onClick={addArticle} className="text-xs font-bold text-white bg-[#e64d25] px-4 py-2 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">+ Add Article</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {reportData.articles.map((art, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                   <button onClick={() => setReportData({...reportData, articles: reportData.articles.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition-colors z-10">×</button>
                   <div className="flex gap-2">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden group border border-gray-300">
                         {art.proofImage ? (
                            <>
                                <img src={art.proofImage} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { const n = [...reportData.articles]; n[i].proofImage = undefined; setReportData({...reportData, articles: n}); }}
                                    className="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-red-500 z-20"
                                >×</button>
                            </>
                         ) : <div className="flex items-center justify-center h-full text-[8px] text-gray-400">IMG</div>}
                         <input type="file" onChange={(e) => handleArticleImage(e, i)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      </div>
                      <div className="flex-grow space-y-2">
                         <input value={art.title} onChange={(e) => updateArticle(i, 'title', e.target.value)} className="w-full p-1 bg-white border rounded text-[10px] font-bold" placeholder="Article Title" />
                         <input value={art.date || ''} onChange={(e) => updateArticle(i, 'date', e.target.value)} className="w-full p-1 bg-white border rounded text-[10px]" placeholder="Date (Optional)" />
                         <textarea value={art.caption} onChange={(e) => updateArticle(i, 'caption', e.target.value)} className="w-full p-1 bg-white border rounded text-[10px] h-12" placeholder="Caption/Summary" />
                         <input value={art.link} onChange={(e) => updateArticle(i, 'link', e.target.value)} className="w-full p-1 bg-white border rounded text-[10px] text-blue-500" placeholder="URL" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* NEW: VIDEO INTERVIEWS (MULTIPLE LINKS) */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Video Interviews (Slide 9)</h3>
             <button onClick={addVideoInterview} className="text-xs font-bold text-white bg-[#283b82] px-4 py-2 rounded-xl shadow-lg hover:bg-[#1a2b63] transition-colors">+ Add Interview</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {reportData.videoInterviews.map((vid, i) => (
                <div key={i} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 relative">
                   <button onClick={() => setReportData({...reportData, videoInterviews: reportData.videoInterviews.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 text-red-400 font-bold px-2">×</button>
                   <div className="space-y-2 pr-8">
                      <input value={vid.title} onChange={(e) => updateVideoInterview(i, 'title', e.target.value)} className="w-full p-2 bg-white rounded text-[10px] font-bold" placeholder="Video Title" />
                      <input value={vid.link} onChange={(e) => updateVideoInterview(i, 'link', e.target.value)} className="w-full p-2 bg-white rounded text-[10px] text-red-500" placeholder="YouTube Link (Main)" />
                   </div>
                   
                   {/* Multiple Links Editor */}
                   <div className="space-y-1">
                       <div className="flex justify-between items-center">
                           <span className="text-[9px] font-bold text-gray-400 uppercase">Additional Links</span>
                           <button onClick={() => addVideoLink(reportData.videoInterviews, i, 'interview')} className="text-[9px] text-blue-600 font-bold">+ Add Link</button>
                       </div>
                       {(vid.extraLinks || []).map((link, lIdx) => (
                           <div key={lIdx} className="flex gap-2 items-center">
                               <select 
                                  value={link.type} 
                                  onChange={e => updateVideoLink(reportData.videoInterviews, i, lIdx, 'type', e.target.value, 'interview')}
                                  className="text-[9px] bg-white border rounded p-1"
                               >
                                   <option value="linkedin">LinkedIn</option>
                                   <option value="x">X (Twitter)</option>
                                   <option value="drive">Drive</option>
                               </select>
                               <input 
                                  value={link.url} 
                                  onChange={e => updateVideoLink(reportData.videoInterviews, i, lIdx, 'url', e.target.value, 'interview')}
                                  className="flex-grow p-1 bg-white border rounded text-[9px]" 
                                  placeholder="URL"
                               />
                               <button onClick={() => removeVideoLink(reportData.videoInterviews, i, lIdx, 'interview')} className="text-red-400 font-bold px-1">×</button>
                           </div>
                       ))}
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Video Collateral Links (MULTIPLE LINKS) */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Video Collateral (Slide 10)</h3>
          <div className="grid grid-cols-1 gap-4">
             {reportData.videoCollateral.map((vid, i) => (
                <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl">
                   <div className="w-24 shrink-0 text-[10px] font-bold truncate mt-2">{vid.title}</div>
                   <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-center">
                           <span className="text-[9px] font-bold text-gray-400 uppercase">External Links</span>
                           <button onClick={() => addVideoLink(reportData.videoCollateral, i, 'collateral')} className="text-[9px] text-blue-600 font-bold">+ Add Link</button>
                       </div>
                       {(vid.extraLinks || []).map((link, lIdx) => (
                           <div key={lIdx} className="flex gap-2 items-center">
                               <select 
                                  value={link.type} 
                                  onChange={e => updateVideoLink(reportData.videoCollateral, i, lIdx, 'type', e.target.value, 'collateral')}
                                  className="text-[9px] bg-white border rounded p-1 w-20"
                               >
                                   <option value="linkedin">LinkedIn</option>
                                   <option value="x">X</option>
                                   <option value="drive">Drive</option>
                               </select>
                               <input 
                                  value={link.url} 
                                  onChange={e => updateVideoLink(reportData.videoCollateral, i, lIdx, 'url', e.target.value, 'collateral')}
                                  className="flex-grow p-1 bg-white border rounded text-[9px]" 
                                  placeholder="URL"
                               />
                               <button onClick={() => removeVideoLink(reportData.videoCollateral, i, lIdx, 'collateral')} className="text-red-400 font-bold px-1">×</button>
                           </div>
                       ))}
                       {/* Keep legacy fields editable or migrate them visually? For simplicity, show if they exist, but encourage new list */}
                       {(!vid.extraLinks || vid.extraLinks.length === 0) && (!vid.linkedinLink && !vid.xLink && !vid.driveLink) && (
                           <div className="text-[9px] text-gray-400 italic">No links added.</div>
                       )}
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Newsletter Inserts Editor */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Newsletter Inserts Titles (Slide 13)</h3>
          <div className="space-y-4">
             {reportData.iiotNewsletterInserts.map((ins, i) => (
                <div key={`iiot-${i}`} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border">
                   <img src={ins.image} className="w-16 h-16 object-cover rounded-lg border" />
                   <div className="flex-grow space-y-2">
                       <input 
                          value={ins.title || ''} 
                          onChange={e => {
                             const n = [...reportData.iiotNewsletterInserts];
                             n[i].title = e.target.value;
                             setReportData({...reportData, iiotNewsletterInserts: n});
                          }}
                          className="w-full p-2 bg-white rounded-lg text-xs font-bold"
                          placeholder="Insert Title"
                       />
                       <input 
                          value={ins.link || ''} 
                          onChange={e => {
                             const n = [...reportData.iiotNewsletterInserts];
                             n[i].link = e.target.value;
                             setReportData({...reportData, iiotNewsletterInserts: n});
                          }}
                          className="w-full p-2 bg-white rounded-lg text-xs text-blue-500"
                          placeholder="Link URL (Optional)"
                       />
                   </div>
                   <button onClick={() => {
                        const n = reportData.iiotNewsletterInserts.filter((_, idx) => idx !== i);
                        setReportData({...reportData, iiotNewsletterInserts: n});
                   }} className="text-red-400 font-bold px-2">×</button>
                </div>
             ))}
             {reportData.iiotNewsletterInserts.length === 0 && <div className="text-xs text-gray-400 italic">No newsletter inserts uploaded.</div>}
          </div>
       </div>

       {/* LinkedIn Inventory Editing */}
       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">LinkedIn Inventory Configuration (Slide 7)</h3>
             <div className="flex gap-2">
               <span className="text-xs font-bold text-gray-400 self-center">{reportData.allLinkedinPosts.length} Posts</span>
               <button onClick={addInventoryPost} className="text-xs font-bold text-white bg-[#283b82] px-4 py-2 rounded-xl shadow-lg hover:bg-[#1a2b63] transition-colors">+ Add Inventory Row</button>
             </div>
          </div>
          
          <div className="space-y-2">
             <div className="text-[9px] font-bold text-gray-400 uppercase">Visible Columns</div>
             <div className="flex flex-wrap gap-2">
                {['date', 'title', 'impressions', 'views', 'engagements', 'reactions', 'clicks', 'reposts', 'link'].map(col => (
                   <button 
                     key={col}
                     onClick={() => {
                         const masterOrder = ['date', 'title', 'impressions', 'views', 'engagements', 'reactions', 'clicks', 'reposts', 'link'];
                         const current = reportData.inventoryVisibleColumns || [];
                         let next;
                         if (current.includes(col)) { next = current.filter(c => c !== col); } 
                         else { next = [...current, col]; }
                         const sortedNext = masterOrder.filter(c => next.includes(c));
                         setReportData({ ...reportData, inventoryVisibleColumns: sortedNext });
                     }}
                     className={`px-3 py-1 rounded-full text-[9px] uppercase font-bold border transition-all ${reportData.inventoryVisibleColumns.includes(col) ? 'bg-[#283b82] text-white border-[#283b82]' : 'bg-white text-gray-400 border-gray-200'}`}
                   >
                      {col}
                   </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
             <div className="text-[9px] font-bold text-gray-400 uppercase">Edit Row Data (First 10 shown)</div>
             <div className="overflow-x-auto max-h-[300px] border rounded-xl">
                <table className="w-full text-left text-[9px]">
                   <thead className="bg-gray-100 font-bold sticky top-0 z-10">
                      <tr>
                         {reportData.inventoryVisibleColumns.map((col, idx) => (
                            <th key={idx} className="p-2 capitalize">{col}</th>
                         ))}
                         <th className="p-2 w-10"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {reportData.allLinkedinPosts.slice(0, 10).map((post, i) => (
                         <tr key={i} className="hover:bg-gray-50 transition-colors">
                            {reportData.inventoryVisibleColumns.map((col) => (
                               <td key={col} className="p-1">
                                  <input 
                                    className={`w-full bg-transparent p-2 outline-none focus:bg-white focus:ring-1 focus:ring-[#283b82]/20 rounded ${col === 'title' ? 'font-bold text-[#283b82]' : ''}`}
                                    value={(post as any)[col] || ''} 
                                    onChange={e => updateInventoryData(i, col, e.target.value)}
                                  />
                               </td>
                            ))}
                            <td className="p-1 text-center">
                              <button onClick={() => deleteInventoryPost(i)} className="text-red-400 font-bold hover:text-red-600">×</button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ContentTab;
