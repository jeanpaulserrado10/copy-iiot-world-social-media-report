
import React from 'react';
import { Icon } from '../Icon';

interface DataUploadStepProps {
  uploadedFiles: any[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, section: string) => void;
  deleteFile: (id: string) => void;
  generateLIMetrics: () => void;
  generateXMetrics: () => void;
  isLIAnalyzing: boolean;
  isXAnalyzing: boolean;
  liDataBuffer: any;
  xDataBuffer: any;
  setLiDataBuffer: (data: any) => void;
  setXDataBuffer: (data: any) => void;
}

const DataUploadStep: React.FC<DataUploadStepProps> = ({ 
  uploadedFiles, handleFileUpload, deleteFile, 
  generateLIMetrics, generateXMetrics, isLIAnalyzing, isXAnalyzing,
  liDataBuffer, xDataBuffer, setLiDataBuffer, setXDataBuffer
}) => {

  const renderFileList = (section: string) => {
    const sectionFiles = uploadedFiles.filter(f => f.section === section);
    if (sectionFiles.length === 0) return null;
    return (
      <div className="mt-4 space-y-2 border-t pt-4">
        <h5 className="text-[9px] font-black uppercase text-gray-400 mb-2">Stored Assets:</h5>
        {sectionFiles.map(file => (
          <div key={file.id} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:border-iiot-orange/30">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-iiot-blue truncate max-w-[200px]">{file.name}</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase">{file.mimeType}</span>
            </div>
            <button onClick={() => deleteFile(file.id)} className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">×</button>
          </div>
        ))}
      </div>
    );
  };

  // --- HELPERS FOR UPDATING RAW DATA ---

  const parseVal = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/,/g, '').replace(/%/g, '')) || 0;
  };

  const formatVal = (val: number) => val.toLocaleString();

  const recalculateLiTotals = (posts: any[]) => {
    const totals = posts.reduce((acc, post) => ({
      impressions: acc.impressions + parseVal(post.impressions),
      engagements: acc.engagements + parseVal(post.engagements),
      reactions: acc.reactions + parseVal(post.reactions),
      comments: acc.comments + parseVal(post.comments),
      clicks: acc.clicks + parseVal(post.clicks),
      reposts: acc.reposts + parseVal(post.reposts),
    }), { impressions: 0, engagements: 0, reactions: 0, comments: 0, clicks: 0, reposts: 0 });

    return {
      ...liDataBuffer.executiveSummary,
      totalImpressions: formatVal(totals.impressions),
      totalEngagements: formatVal(totals.engagements),
      reactions: formatVal(totals.reactions), // API sometimes returns number, sometimes string
      comments: formatVal(totals.comments),
      clicks: formatVal(totals.clicks),
      reposts: formatVal(totals.reposts),
      totalPostCount: posts.length
    };
  };

  const updateLiPost = (index: number, field: string, value: string) => {
    const newPosts = [...liDataBuffer.postDetailTable];
    newPosts[index] = { ...newPosts[index], [field]: value };
    const newSummary = recalculateLiTotals(newPosts);
    setLiDataBuffer({ ...liDataBuffer, postDetailTable: newPosts, executiveSummary: newSummary });
  };

  const addLiPost = () => {
    const newPost = { 
      date: new Date().toISOString().split('T')[0], 
      snippet: 'New Post Entry', 
      impressions: 0, engagements: 0, reactions: 0, comments: 0, clicks: 0, reposts: 0, views: 0, link: '' 
    };
    const newPosts = [newPost, ...liDataBuffer.postDetailTable];
    const newSummary = recalculateLiTotals(newPosts);
    setLiDataBuffer({ ...liDataBuffer, postDetailTable: newPosts, executiveSummary: newSummary });
  };

  const deleteLiPost = (index: number) => {
    const newPosts = liDataBuffer.postDetailTable.filter((_: any, i: number) => i !== index);
    const newSummary = recalculateLiTotals(newPosts);
    setLiDataBuffer({ ...liDataBuffer, postDetailTable: newPosts, executiveSummary: newSummary });
  };

  const updateLiTop4 = (index: number, field: string, value: string) => {
    const newPosts = [...(liDataBuffer.top4Posts || [])];
    newPosts[index] = { ...newPosts[index], [field]: value };
    setLiDataBuffer({ ...liDataBuffer, top4Posts: newPosts });
  };

  const addLiTop4 = () => {
    const newPost = { title: 'New Top Post', date: '', impressions: '0', reactions: '0', link: '' };
    setLiDataBuffer({ ...liDataBuffer, top4Posts: [...(liDataBuffer.top4Posts || []), newPost] });
  };

  const deleteLiTop4 = (index: number) => {
    const newPosts = liDataBuffer.top4Posts.filter((_: any, i: number) => i !== index);
    setLiDataBuffer({ ...liDataBuffer, top4Posts: newPosts });
  };

  const updateXPost = (index: number, field: string, value: string) => {
    const newPosts = [...xDataBuffer.topXPosts];
    newPosts[index] = { ...newPosts[index], [field]: value };
    setXDataBuffer({ ...xDataBuffer, topXPosts: newPosts });
  };

  const addXPost = () => {
    const newPost = { title: 'New X Post', impressions: '0', reach: '0', link: '' };
    setXDataBuffer({ ...xDataBuffer, topXPosts: [...xDataBuffer.topXPosts, newPost] });
  };

  const deleteXPost = (index: number) => {
    const newPosts = xDataBuffer.topXPosts.filter((_: any, i: number) => i !== index);
    setXDataBuffer({ ...xDataBuffer, topXPosts: newPosts });
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <h2 className="text-4xl font-black text-[#283b82]">Analytics Data Feed</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'LinkedIn CSVs (Pre-calc metrics)', section: 'linkedin', multiple: true },
          { label: 'X Metrics (Single CSV)', section: 'x_csv', multiple: false },
        ].map(item => (
          <div key={item.section} className="p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-[#e64d25] transition-all min-h-[160px] flex flex-col justify-start">
             <div className="font-black text-[#283b82]">{item.label}</div>
             <input type="file" multiple={item.multiple} onChange={e => handleFileUpload(e, item.section)} className="block w-full text-xs text-gray-500 mt-4" />
             {renderFileList(item.section)}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-10 rounded-[3rem] border-2 border-dashed border-gray-200 space-y-8">
         <h3 className="text-center text-xl font-black text-[#283b82] uppercase tracking-widest">Individual Metric Generation</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <button onClick={generateLIMetrics} disabled={isLIAnalyzing || uploadedFiles.filter(f => f.section === 'linkedin').length === 0}
              className={`p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg ${isLIAnalyzing ? 'bg-gray-100' : 'bg-[#283b82] text-white hover:scale-105'}`}>
              <Icon type="LINKEDIN" className="w-8 h-8" />
              <span className="font-black uppercase text-xs tracking-widest">{isLIAnalyzing ? 'Filtering Data...' : liDataBuffer ? 'LinkedIn Metrics Ready ✓' : 'Generate LinkedIn Metrics'}</span>
           </button>
           <button onClick={generateXMetrics} disabled={isXAnalyzing || uploadedFiles.filter(f => f.section === 'x_csv').length === 0}
              className={`p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg ${isXAnalyzing ? 'bg-gray-100' : 'bg-[#e64d25] text-white hover:scale-105'}`}>
              <Icon type="TWITTER" className="w-8 h-8" />
              <span className="font-black uppercase text-xs tracking-widest">{isXAnalyzing ? 'Processing...' : xDataBuffer ? 'X Metrics Ready ✓' : 'Generate X Metrics'}</span>
           </button>
         </div>
      </div>

      {/* Generated Data Preview Tables */}
      {(liDataBuffer || xDataBuffer) && (
        <div className="space-y-12 pt-8 border-t border-gray-200">
           <h3 className="text-2xl font-black text-[#283b82]">Generated Data Preview (Editable)</h3>
           
           {/* LinkedIn Preview */}
           {liDataBuffer && (
             <div className="space-y-6">
                
                {/* 1. Executive Summary Totals */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                   <h4 className="font-black text-[#283b82] uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Icon type="GROWTH" className="w-5 h-5"/> LinkedIn Totals (Auto-Calculated)
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {liDataBuffer.executiveSummary && Object.entries(liDataBuffer.executiveSummary).map(([k, v]) => (
                         <div key={k} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="text-[9px] font-black uppercase text-gray-400 mb-1">{k.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="text-lg font-black text-[#283b82]">{String(v)}</div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* 2. Newsletter Placements */}
                {liDataBuffer.newsletterAnalysis?.articles && (
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                     <h4 className="font-black text-[#283b82] uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Icon type="DOCS" className="w-5 h-5"/> Detected Newsletter Placements
                     </h4>
                     <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-left text-[10px]">
                           <thead className="bg-gray-100 font-bold text-gray-600 uppercase">
                              <tr>
                                 <th className="p-3">Title</th>
                                 <th className="p-3 text-center">Imp.</th>
                                 <th className="p-3 text-center">Eng.</th>
                                 <th className="p-3">Link</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {liDataBuffer.newsletterAnalysis.articles.map((art: any, i: number) => (
                                 <tr key={i}>
                                    <td className="p-2 font-bold text-[#283b82]">{art.title}</td>
                                    <td className="p-2 text-center">{art.impressions}</td>
                                    <td className="p-2 text-center">{art.engagements}</td>
                                    <td className="p-2 text-blue-500 truncate max-w-[150px]">{art.link}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                )}

                {/* 3. Top 4 Posts */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-black text-[#283b82] uppercase tracking-widest flex items-center gap-2">
                          <Icon type="STAR" className="w-5 h-5"/> Top 4 LinkedIn Highlights
                      </h4>
                      <button onClick={addLiTop4} className="text-[10px] font-bold text-[#e64d25] bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100">+ Add Top Post</button>
                   </div>
                   <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full text-left text-[10px]">
                         <thead className="bg-gray-100 font-bold text-gray-600 uppercase">
                            <tr>
                               <th className="p-3">Title</th>
                               <th className="p-3 text-center">Imp.</th>
                               <th className="p-3 text-center">React.</th>
                               <th className="p-3">Link</th>
                               <th className="p-3 w-10"></th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {liDataBuffer.top4Posts && liDataBuffer.top4Posts.map((post: any, i: number) => (
                               <tr key={i} className="hover:bg-blue-50/30">
                                  <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white font-bold" value={post.title} onChange={e => updateLiTop4(i, 'title', e.target.value)} /></td>
                                  <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.impressions} onChange={e => updateLiTop4(i, 'impressions', e.target.value)} /></td>
                                  <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.reactions} onChange={e => updateLiTop4(i, 'reactions', e.target.value)} /></td>
                                  <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-blue-500" value={post.link} onChange={e => updateLiTop4(i, 'link', e.target.value)} /></td>
                                  <td className="p-1 text-center"><button onClick={() => deleteLiTop4(i)} className="text-red-400 font-bold hover:text-red-600">×</button></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* 4. Full Detail Table */}
                {liDataBuffer.postDetailTable && (
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-[#283b82] uppercase tracking-widest flex items-center gap-2">
                            <Icon type="LINKEDIN" className="w-5 h-5"/> Full Post Inventory
                        </h4>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400">{liDataBuffer.postDetailTable.length} Posts</span>
                            <button onClick={addLiPost} className="text-[10px] font-bold text-white bg-[#283b82] px-3 py-1.5 rounded-lg hover:bg-[#1a2b63]">+ Add Row</button>
                        </div>
                      </div>
                      <div className="overflow-x-auto border rounded-xl max-h-[400px]">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-gray-100 font-bold sticky top-0 z-10 text-gray-600 uppercase">
                              <tr>
                                  <th className="p-3 w-20">Date</th>
                                  <th className="p-3">Content Snippet</th>
                                  <th className="p-3 w-16 text-center">Imp.</th>
                                  <th className="p-3 w-16 text-center">Eng.</th>
                                  <th className="p-3 w-16 text-center">React.</th>
                                  <th className="p-3 w-16 text-center">Clicks</th>
                                  <th className="p-3 w-16 text-center">Reposts</th>
                                  {/* Added Views Column */}
                                  <th className="p-3 w-16 text-center">Views</th> 
                                  <th className="p-3 w-24">Link</th>
                                  <th className="p-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {liDataBuffer.postDetailTable.map((post: any, i: number) => (
                                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white" value={post.date} onChange={e => updateLiPost(i, 'date', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white font-bold text-[#283b82]" value={post.snippet} onChange={e => updateLiPost(i, 'snippet', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.impressions} onChange={e => updateLiPost(i, 'impressions', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.engagements} onChange={e => updateLiPost(i, 'engagements', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.reactions} onChange={e => updateLiPost(i, 'reactions', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.clicks} onChange={e => updateLiPost(i, 'clicks', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.reposts} onChange={e => updateLiPost(i, 'reposts', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.views} onChange={e => updateLiPost(i, 'views', e.target.value)} /></td>
                                    <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-blue-500 truncate" value={post.link} onChange={e => updateLiPost(i, 'link', e.target.value)} /></td>
                                    <td className="p-1 text-center"><button onClick={() => deleteLiPost(i)} className="text-red-400 font-bold hover:text-red-600">×</button></td>
                                  </tr>
                              ))}
                            </tbody>
                        </table>
                      </div>
                  </div>
                )}
             </div>
           )}

           {/* X Preview */}
           {xDataBuffer && xDataBuffer.topXPosts && (
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                   <h4 className="font-black text-[#e64d25] uppercase tracking-widest flex items-center gap-2">
                      <Icon type="TWITTER" className="w-5 h-5"/> X (Twitter) Generated Data
                   </h4>
                   <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{xDataBuffer.topXPosts.length} Top Posts</span>
                      <button onClick={addXPost} className="text-[10px] font-bold text-white bg-[#e64d25] px-3 py-1.5 rounded-lg hover:bg-orange-600">+ Add Post</button>
                   </div>
                </div>
                {/* Metrics Preview */}
                {xDataBuffer.xMetrics && (
                   <div className="grid grid-cols-5 gap-2 mb-4 bg-gray-50 p-4 rounded-xl">
                      {Object.entries(xDataBuffer.xMetrics).map(([k, v]) => (
                         <div key={k} className="text-center">
                            <div className="text-[8px] font-black uppercase text-gray-400">{k}</div>
                            <div className="text-xs font-black text-[#283b82]">{String(v)}</div>
                         </div>
                      ))}
                   </div>
                )}
                <div className="overflow-x-auto border rounded-xl max-h-[300px]">
                   <table className="w-full text-left text-[10px]">
                      <thead className="bg-gray-100 font-bold sticky top-0 z-10 text-gray-600 uppercase">
                         <tr>
                            <th className="p-3">Post Content / Title</th>
                            <th className="p-3 w-20 text-center">Imp.</th>
                            <th className="p-3 w-20 text-center">Reach</th>
                            <th className="p-3 w-24">Link</th>
                            <th className="p-3 w-10"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {xDataBuffer.topXPosts.map((post: any, i: number) => (
                            <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                               <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white font-bold text-[#283b82]" value={post.title} onChange={e => updateXPost(i, 'title', e.target.value)} /></td>
                               <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.impressions} onChange={e => updateXPost(i, 'impressions', e.target.value)} /></td>
                               <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-center" value={post.reach} onChange={e => updateXPost(i, 'reach', e.target.value)} /></td>
                               <td className="p-1"><input className="w-full bg-transparent p-2 outline-none focus:bg-white text-blue-500 truncate" value={post.link} onChange={e => updateXPost(i, 'link', e.target.value)} /></td>
                               <td className="p-1 text-center"><button onClick={() => deleteXPost(i)} className="text-red-400 font-bold hover:text-red-600">×</button></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default DataUploadStep;
