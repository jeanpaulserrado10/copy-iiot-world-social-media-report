
import React, { useState, useEffect } from 'react';
import { ReportData, CustomSlide } from '../../../types';
import { Icon } from '../../Icon';

interface StructureTabProps {
  reportData: ReportData;
  setReportData: (data: ReportData) => void;
  updateSlideLabel: (id: string, label: string) => void;
  toggleSlide: (id: string) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

const StructureTab: React.FC<StructureTabProps> = ({ 
  reportData, setReportData, updateSlideLabel, toggleSlide,
  handleDragStart, handleDragOver, handleDrop
}) => {
  const [newSlide, setNewSlide] = useState<Partial<CustomSlide>>({
    title: '', subtitle: '', content: '', template: 'default', bullets: [], buttons: [], images: [], videos: [], metricsData: []
  });
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  
  const [tempBullet, setTempBullet] = useState({ text: '', link: '' });
  const [tempButton, setTempButton] = useState({ text: '', link: '' });
  const [tempMetric, setTempMetric] = useState({ label: '', value: '', icon: 'STAR', color: 'bg-[#283b82]' });

  useEffect(() => {
    if (!editingSlideId && reportData.customSlides.length > 0) {
        const lastSlide = reportData.customSlides[reportData.customSlides.length - 1];
        if (lastSlide.id.startsWith('cumulative_')) {
             setEditingSlideId(lastSlide.id);
             setNewSlide({
                ...lastSlide,
                comparisonData: lastSlide.comparisonData
             });
        }
    }
  }, [reportData.customSlides]); 
  
  const editCustomSlide = (slideId: string) => {
    const slide = reportData.customSlides.find(s => s.id === slideId);
    if (slide) {
      setNewSlide({
        ...slide,
        bullets: slide.bullets?.map(b => (typeof b === 'string' ? { text: b, link: '' } : b)) || [],
        buttons: slide.buttons || [],
        images: slide.images || (slide.fileData ? [{ url: slide.fileData }] : []),
        videos: slide.videos || [],
        metricsData: slide.metricsData || [],
        comparisonData: slide.comparisonData
      });
      setEditingSlideId(slideId);
    }
  };

  const cancelEdit = () => {
    setNewSlide({ title: '', subtitle: '', content: '', template: 'default', bullets: [], buttons: [], images: [], videos: [], metricsData: [] });
    setEditingSlideId(null);
  };

  const addOrUpdateCustomSlide = () => {
    if (!newSlide.title) return;
    if (editingSlideId) {
      const updatedSlides = reportData.customSlides.map(s => s.id === editingSlideId ? { ...s, ...newSlide } as CustomSlide : s);
      const updatedSequence = reportData.slideSequence.map(s => s.id === editingSlideId ? { ...s, label: newSlide.title! } : s);
      setReportData({ ...reportData, customSlides: updatedSlides, slideSequence: updatedSequence });
      cancelEdit();
    } else {
      const id = `custom_${Math.random().toString(36).substr(2, 9)}`;
      const slide: CustomSlide = {
        id,
        title: newSlide.title!,
        subtitle: newSlide.subtitle,
        content: newSlide.content || '',
        type: 'text',
        template: newSlide.template || 'default',
        bullets: newSlide.bullets || [],
        buttons: newSlide.buttons || [],
        images: newSlide.images || [],
        videos: newSlide.videos || [],
        metricsData: newSlide.metricsData || [],
        fileData: newSlide.images?.[0]?.url, 
        link: newSlide.buttons?.[0]?.link,
        linkText: newSlide.buttons?.[0]?.text,
        comparisonData: newSlide.comparisonData
      };
      
      const newSlides = [...(reportData.customSlides || []), slide];
      const newSequence = [...reportData.slideSequence];
      const insertIdx = newSequence.findIndex(s => s.id === 'thank_you');
      const seqItem = { id, label: slide.title, enabled: true };
      if (insertIdx >= 0) newSequence.splice(insertIdx, 0, seqItem);
      else newSequence.push(seqItem);

      setReportData({ ...reportData, customSlides: newSlides, slideSequence: newSequence });
      setNewSlide({ title: '', subtitle: '', content: '', template: 'default', bullets: [], buttons: [], images: [], videos: [], metricsData: [] });
    }
  };

  const deleteSlide = (e: React.MouseEvent, slideId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    const newSequence = reportData.slideSequence.filter(s => s.id !== slideId);
    const newCustomSlides = reportData.customSlides.filter(s => s.id !== slideId);
    setReportData({ ...reportData, slideSequence: newSequence, customSlides: newCustomSlides });
  };

  const duplicateSlide = (e: React.MouseEvent, slideId: string) => {
    e.stopPropagation();
    const customSlide = reportData.customSlides.find(s => s.id === slideId);
    let newSlideData: CustomSlide;
    let newId = `custom_dup_${Math.random().toString(36).substr(2, 9)}`;

    if (customSlide) {
      newSlideData = { ...customSlide, id: newId, title: `${customSlide.title} (Copy)` };
    } else {
      if (slideId === 'x_top') {
         newSlideData = {
           id: newId,
           title: 'Top X Posts (Copy)',
           type: 'text',
           template: 'top-posts',
           content: '',
           posts: JSON.parse(JSON.stringify(reportData.topXPosts)) 
         };
      } else if (slideId === 'linkedin_top') {
         newSlideData = {
           id: newId,
           title: 'Top LinkedIn Posts (Copy)',
           type: 'text',
           template: 'top-posts',
           content: '',
           posts: JSON.parse(JSON.stringify(reportData.topLinkedinPosts))
         };
      } else {
         newSlideData = {
           id: newId,
           title: 'Duplicated Slide',
           subtitle: 'Custom Content',
           type: 'text',
           template: 'default',
           content: 'This slide was duplicated from a standard slide layout. Please customize it.'
         };
      }
    }

    const newSlides = [...reportData.customSlides, newSlideData];
    const newSequence = [...reportData.slideSequence];
    const idx = newSequence.findIndex(s => s.id === slideId);
    const newSeqItem = { id: newId, label: newSlideData.title, enabled: true };
    newSequence.splice(idx + 1, 0, newSeqItem); 

    setReportData({ ...reportData, customSlides: newSlides, slideSequence: newSequence });
  };

  const handleCustomImages = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
        Array.from(e.target.files).forEach((file: File) => {
           const reader = new FileReader();
           reader.onload = (ev) => {
               const url = ev.target?.result as string;
               setNewSlide(prev => ({ ...prev, images: [...(prev.images || []), { url }] }));
           };
           reader.readAsDataURL(file);
        });
     }
  };

  const handleCustomVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         const reader = new FileReader();
         reader.onload = (ev) => {
             const url = ev.target?.result as string;
             setNewSlide(prev => ({ ...prev, videos: [...(prev.videos || []), { url, title: file.name, extraLinks: [] }] }));
         };
         reader.readAsDataURL(file);
      }
  };

  // Custom Video Link Management
  const addVideoLink = (vIdx: number) => {
      setNewSlide(prev => {
          const videos = [...(prev.videos || [])];
          videos[vIdx] = { ...videos[vIdx], extraLinks: [...(videos[vIdx].extraLinks || []), { type: 'linkedin', url: '' }] };
          return { ...prev, videos };
      });
  };

  const updateVideoLink = (vIdx: number, lIdx: number, field: 'type' | 'url', value: string) => {
      setNewSlide(prev => {
          const videos = [...(prev.videos || [])];
          const links = [...(videos[vIdx].extraLinks || [])];
          links[lIdx] = { ...links[lIdx], [field]: value };
          videos[vIdx].extraLinks = links;
          return { ...prev, videos };
      });
  };

  const removeVideoLink = (vIdx: number, lIdx: number) => {
      setNewSlide(prev => {
          const videos = [...(prev.videos || [])];
          videos[vIdx].extraLinks = videos[vIdx].extraLinks?.filter((_, i) => i !== lIdx);
          return { ...prev, videos };
      });
  };

  const updateComparisonHeader = (idx: number, val: string) => {
     if (!newSlide.comparisonData) return;
     const newHeaders = [...newSlide.comparisonData.headers];
     newHeaders[idx] = val;
     setNewSlide({ ...newSlide, comparisonData: { ...newSlide.comparisonData, headers: newHeaders } });
  };

  const parseVal = (val: string | number) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    let str = val.toString().toUpperCase().replace(/,/g, ''); 
    let mult = 1;
    if (str.endsWith('K')) { mult = 1000; str = str.slice(0, -1); }
    if (str.endsWith('M')) { mult = 1000000; str = str.slice(0, -1); }
    if (str.endsWith('B')) { mult = 1000000000; str = str.slice(0, -1); }
    if (str.endsWith('%')) { str = str.slice(0, -1); }
    if ((str.match(/\./g) || []).length > 1) str = str.replace(/\./g, '');
    return parseFloat(str) * mult || 0;
  };

  const formatVal = (val: number) => val.toLocaleString(undefined, { maximumFractionDigits: 1 });

  const updateComparisonCell = (rowIdx: number, colIdx: number, val: string) => {
     if (!newSlide.comparisonData) return;
     const newRows = [...newSlide.comparisonData.rows];
     newRows[rowIdx].values[colIdx] = val;

     const values = newRows[rowIdx].values;
     const totalIdx = values.length - 1;
     
     if (colIdx !== totalIdx) {
         const label = newRows[rowIdx].label.toLowerCase();
         const isRate = label.includes('rate') || label.includes('%');
         
         if (!isRate) {
             let sum = 0;
             for (let i = 0; i < totalIdx; i++) {
                 sum += parseVal(values[i] as string);
             }
             newRows[rowIdx].values[totalIdx] = formatVal(sum);
         }
     }

     setNewSlide({ ...newSlide, comparisonData: { ...newSlide.comparisonData, rows: newRows } });
  };

  const updateComparisonRowLabel = (rowIdx: number, val: string) => {
     if (!newSlide.comparisonData) return;
     const newRows = [...newSlide.comparisonData.rows];
     newRows[rowIdx].label = val;
     setNewSlide({ ...newSlide, comparisonData: { ...newSlide.comparisonData, rows: newRows } });
  };

  const toggleComparisonRowHeader = (rowIdx: number) => {
     if (!newSlide.comparisonData) return;
     const newRows = [...newSlide.comparisonData.rows];
     newRows[rowIdx].isHeader = !newRows[rowIdx].isHeader;
     setNewSlide({ ...newSlide, comparisonData: { ...newSlide.comparisonData, rows: newRows } });
  };

  const toggleComparisonRowVisibility = (rowIdx: number) => {
     if (!newSlide.comparisonData) return;
     const newRows = [...newSlide.comparisonData.rows];
     newRows[rowIdx].hidden = !newRows[rowIdx].hidden;
     setNewSlide({ ...newSlide, comparisonData: { ...newSlide.comparisonData, rows: newRows } });
  };

  const deleteComparisonRow = (rowIdx: number) => {
     if (!newSlide.comparisonData) return;
     const newRows = newSlide.comparisonData.rows.filter((_, i) => i !== rowIdx);
     setNewSlide({ ...newSlide, comparisonData: { ...newSlide.comparisonData, rows: newRows } });
  };

  const addComparisonRow = () => {
     if (!newSlide.comparisonData) return;
     const emptyVals = new Array(newSlide.comparisonData.headers.length - 1).fill('');
     setNewSlide({ 
         ...newSlide, 
         comparisonData: { 
             ...newSlide.comparisonData, 
             rows: [...newSlide.comparisonData.rows, { label: 'New Metric', values: emptyVals, isHeader: false }] 
         } 
     });
  };

  // --- ITEM DRAG AND DROP HANDLERS ---
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, type: 'metrics' | 'bullets' | 'buttons') => {
    e.stopPropagation();
    e.dataTransfer.setData('item_index', index.toString());
    e.dataTransfer.setData('item_type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number, type: 'metrics' | 'bullets' | 'buttons') => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndexStr = e.dataTransfer.getData('item_index');
    const sourceType = e.dataTransfer.getData('item_type');
    
    if (!sourceIndexStr || sourceType !== type) return;
    
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    if (type === 'metrics') {
        const list = [...(newSlide.metricsData || [])];
        const [moved] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, moved);
        setNewSlide({ ...newSlide, metricsData: list });
    } else if (type === 'bullets') {
        const list = [...(newSlide.bullets || [])];
        const [moved] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, moved as any);
        setNewSlide({ ...newSlide, bullets: list });
    } else if (type === 'buttons') {
        const list = [...(newSlide.buttons || [])];
        const [moved] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, moved);
        setNewSlide({ ...newSlide, buttons: list });
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-8 animate-fadeIn">
       
       {/* COVER SLIDE CONFIGURATION SECTION */}
       <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner">
           <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
               <Icon type="DOCS" className="w-4 h-4" /> Cover Slide Configuration
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">Client Name</label>
                   <input 
                       className="w-full p-2 bg-white rounded-lg border font-bold text-xs"
                       value={reportData.metadata.clientName}
                       onChange={(e) => setReportData({ ...reportData, metadata: { ...reportData.metadata, clientName: e.target.value } })}
                   />
               </div>
               <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">Campaign Name</label>
                   <input 
                       className="w-full p-2 bg-white rounded-lg border font-bold text-xs"
                       value={reportData.metadata.campaignName}
                       onChange={(e) => setReportData({ ...reportData, metadata: { ...reportData.metadata, campaignName: e.target.value } })}
                   />
               </div>
               <div className="col-span-1 md:col-span-2 space-y-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase">Extra Cover Note/Paragraph (Optional)</label>
                   <textarea 
                       className="w-full p-2 bg-white rounded-lg border text-xs h-16"
                       placeholder="Add an extra note to appear on the cover slide..."
                       value={reportData.metadata.coverNote || ''}
                       onChange={(e) => setReportData({ ...reportData, metadata: { ...reportData.metadata, coverNote: e.target.value } })}
                   />
               </div>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest border-b pb-2">Presentation Flow (Drag / Delete / Duplicate)</h3>
             <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {reportData.slideSequence.map((slide, idx) => {
                   const isCustom = slide.id.startsWith('custom_') || slide.id.startsWith('cumulative_') || reportData.customSlides.some(s => s.id === slide.id);
                   
                   return (
                   <div 
                      key={slide.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-move group ${slide.enabled ? 'bg-white border-gray-100 hover:border-[#e64d25]' : 'bg-gray-50 border-transparent opacity-60'}`}
                   >
                      <div className="text-gray-300 font-bold px-1">☰</div>
                      <input type="checkbox" checked={slide.enabled} onChange={() => toggleSlide(slide.id)} className="accent-[#e64d25] w-4 h-4 flex-shrink-0" />
                      <input 
                        value={slide.label} 
                        onChange={(e) => updateSlideLabel(slide.id, e.target.value)}
                        className="flex-grow text-[10px] font-black uppercase text-gray-600 bg-transparent border-b border-transparent focus:border-[#e64d25] outline-none min-w-0"
                      />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isCustom && (
                           <button onClick={() => editCustomSlide(slide.id)} title="Edit" className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"><Icon type="EDIT" className="w-3 h-3" /></button>
                         )}
                         <button onClick={(e) => duplicateSlide(e, slide.id)} title="Duplicate" className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-200"><Icon type="DOCS" className="w-3 h-3" /></button>
                         <button onClick={(e) => deleteSlide(e, slide.id)} title="Delete" className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><span className="text-xs font-bold leading-none">×</span></button>
                      </div>
                   </div>
                   );
                })}
             </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
               <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">
                 {editingSlideId ? 'Edit Custom Slide' : 'Add New Custom Slide'}
               </h3>
               {editingSlideId && <button onClick={cancelEdit} className="text-xs text-red-500 font-bold">Cancel</button>}
             </div>
             
             <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Slide Template Type</label>
                <select 
                  className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-xs"
                  value={newSlide.template}
                  onChange={e => setNewSlide({...newSlide, template: e.target.value as any})}
                  disabled={newSlide.template === 'comparison' && !newSlide.comparisonData} 
                >
                  <option value="default">Standard (Text + Image/Video)</option>
                  <option value="executive">Executive Style (Bullets + Text)</option>
                  <option value="executive-snapshot">Exec Snapshot (Bullets + Metrics)</option>
                  <option value="grid">Asset Grid (Images & Videos Only)</option>
                  {newSlide.template === 'comparison' && <option value="comparison">Comparison Table (Cumulative)</option>}
                </select>
             </div>

             <div className="space-y-2">
                <input placeholder="Main Slide Title" className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border border-transparent focus:border-[#e64d25] outline-none" value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} />
                <input placeholder="Subtitle (Optional)" className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border border-transparent focus:border-[#e64d25] outline-none" value={newSlide.subtitle} onChange={e => setNewSlide({...newSlide, subtitle: e.target.value})} />
             </div>

             {/* COMPARISON TABLE EDITOR SPECIFIC UI */}
             {newSlide.template === 'comparison' && newSlide.comparisonData ? (
                 <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                     <div className="flex justify-between items-center">
                         <h4 className="text-[10px] font-black text-gray-500 uppercase">Comparison Table Data</h4>
                         <button onClick={addComparisonRow} className="text-[9px] font-bold bg-[#283b82] text-white px-3 py-1 rounded">+ Add Row</button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px]">
                            <thead>
                                <tr>
                                    <th className="p-1 w-10 text-[8px] uppercase text-center" title="Show/Hide">Visible?</th>
                                    <th className="p-1 w-10 text-[8px] uppercase text-center" title="Is Header?">Header?</th>
                                    {newSlide.comparisonData.headers.map((h, i) => (
                                        <th key={i} className="p-1">
                                            <input 
                                              value={h} 
                                              onChange={(e) => updateComparisonHeader(i, e.target.value)}
                                              className="w-full bg-gray-200 rounded p-1 font-bold text-[#283b82]"
                                            />
                                        </th>
                                    ))}
                                    <th className="w-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {newSlide.comparisonData.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className={`${row.isHeader ? 'bg-orange-50' : ''} ${row.hidden ? 'opacity-50 bg-gray-100' : ''}`}>
                                        <td className="p-1 text-center">
                                            <input type="checkbox" checked={!row.hidden} onChange={() => toggleComparisonRowVisibility(rIdx)} className="accent-[#283b82]" title={row.hidden ? "Hidden" : "Visible"} />
                                        </td>
                                        <td className="p-1 text-center">
                                            <input type="checkbox" checked={!!row.isHeader} onChange={() => toggleComparisonRowHeader(rIdx)} className="accent-[#e64d25]" />
                                        </td>
                                        <td className="p-1">
                                            <input 
                                              value={row.label} 
                                              onChange={(e) => updateComparisonRowLabel(rIdx, e.target.value)}
                                              className={`w-full bg-white border rounded p-1 ${row.isHeader ? 'font-black text-[#e64d25] uppercase' : 'font-bold'}`}
                                            />
                                        </td>
                                        {row.values.map((val, cIdx) => (
                                            <td key={cIdx} className="p-1">
                                                {!row.isHeader && (
                                                    <input 
                                                    value={val} 
                                                    onChange={(e) => updateComparisonCell(rIdx, cIdx, e.target.value as string)}
                                                    className="w-full bg-white border rounded p-1"
                                                    />
                                                )}
                                            </td>
                                        ))}
                                        <td>
                                            <button onClick={() => deleteComparisonRow(rIdx)} className="text-red-500 font-bold px-2">×</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                     <textarea placeholder="Slide Main Content / Context" className="w-full p-3 bg-white rounded-xl text-xs font-medium h-20 border border-transparent focus:border-[#e64d25] outline-none" value={newSlide.content} onChange={e => setNewSlide({...newSlide, content: e.target.value})} />
                 </div>
             ) : (
                 // STANDARD EDITORS FOR OTHER TEMPLATES
                 <>
                    <textarea placeholder="Slide Main Content / Body Text" className="w-full p-3 bg-gray-50 rounded-xl text-xs font-medium h-24 border border-transparent focus:border-[#e64d25] outline-none" value={newSlide.content} onChange={e => setNewSlide({...newSlide, content: e.target.value})} />

                    {/* METRICS DATA EDITOR */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Metrics (Drag to Reorder)</label>
                        <div className="flex gap-2 items-center">
                        <input className="w-1/3 p-2 bg-white rounded-lg text-xs" placeholder="Label (e.g. Leads)" value={tempMetric.label} onChange={e => setTempMetric({...tempMetric, label: e.target.value})} />
                        <input className="w-1/4 p-2 bg-white rounded-lg text-xs" placeholder="Value (50)" value={tempMetric.value} onChange={e => setTempMetric({...tempMetric, value: e.target.value})} />
                        <select className="p-2 bg-white rounded-lg text-xs" value={tempMetric.color} onChange={e => setTempMetric({...tempMetric, color: e.target.value})}>
                            <option value="bg-[#283b82]">Blue</option>
                            <option value="bg-[#e64d25]">Orange</option>
                            <option value="bg-gray-800">Dark</option>
                        </select>
                        <button onClick={() => { if(tempMetric.label) { setNewSlide(prev => ({...prev, metricsData: [...(prev.metricsData||[]), tempMetric]})); setTempMetric({...tempMetric, label: '', value: ''}); }}} className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-bold">+</button>
                        </div>
                        <div className="space-y-2 mt-2">
                        {newSlide.metricsData?.map((m, i) => (
                            <div 
                                key={i} 
                                draggable
                                onDragStart={(e) => handleItemDragStart(e, i, 'metrics')}
                                onDragOver={handleItemDragOver}
                                onDrop={(e) => handleItemDrop(e, i, 'metrics')}
                                className="flex gap-2 items-center text-[10px] bg-white p-2 rounded border cursor-move hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-gray-300 font-bold px-1">☰</span>
                                <input 
                                    className="w-1/3 p-1 bg-gray-50 rounded border-transparent focus:bg-white outline-none" 
                                    value={m.label} 
                                    onChange={e => {
                                        const next = [...(newSlide.metricsData || [])];
                                        next[i] = { ...next[i], label: e.target.value };
                                        setNewSlide({...newSlide, metricsData: next});
                                    }}
                                />
                                <input 
                                    className="w-1/4 p-1 bg-gray-50 rounded border-transparent focus:bg-white outline-none" 
                                    value={m.value} 
                                    onChange={e => {
                                        const next = [...(newSlide.metricsData || [])];
                                        next[i] = { ...next[i], value: e.target.value };
                                        setNewSlide({...newSlide, metricsData: next});
                                    }}
                                />
                                <select 
                                    className="p-1 bg-gray-50 rounded outline-none" 
                                    value={m.color} 
                                    onChange={e => {
                                        const next = [...(newSlide.metricsData || [])];
                                        next[i] = { ...next[i], color: e.target.value };
                                        setNewSlide({...newSlide, metricsData: next});
                                    }}
                                >
                                    <option value="bg-[#283b82]">Blue</option>
                                    <option value="bg-[#e64d25]">Orange</option>
                                    <option value="bg-gray-800">Dark</option>
                                </select>
                                <button onClick={() => setNewSlide(prev => ({...prev, metricsData: prev.metricsData?.filter((_, idx) => idx !== i)}))} className="text-red-400 font-bold px-1">×</button>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* BULLETS EDITOR */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Bullet Points (Drag to Reorder)</label>
                        <div className="flex gap-2">
                        <input className="w-2/3 p-2 bg-white rounded-lg text-xs" placeholder="Bullet Text" value={tempBullet.text} onChange={e => setTempBullet({...tempBullet, text: e.target.value})} />
                        <input className="w-1/3 p-2 bg-white rounded-lg text-xs" placeholder="Optional Link" value={tempBullet.link} onChange={e => setTempBullet({...tempBullet, link: e.target.value})} />
                        <button onClick={() => { if(tempBullet.text) { setNewSlide(prev => ({...prev, bullets: [...(prev.bullets||[]), tempBullet]})); setTempBullet({text: '', link: ''}); }}} className="bg-blue-100 text-blue-600 px-3 rounded-lg font-bold">+</button>
                        </div>
                        <div className="space-y-2 mt-2">
                        {newSlide.bullets?.map((b, i) => {
                            const txt = typeof b === 'string' ? b : b.text;
                            const lnk = typeof b === 'string' ? '' : b.link;
                            return (
                            <div 
                                key={i} 
                                draggable
                                onDragStart={(e) => handleItemDragStart(e, i, 'bullets')}
                                onDragOver={handleItemDragOver}
                                onDrop={(e) => handleItemDrop(e, i, 'bullets')}
                                className="flex gap-2 items-center text-[10px] bg-white p-2 rounded border cursor-move hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-gray-300 font-bold px-1">☰</span>
                                <input 
                                    className="flex-grow p-1 bg-gray-50 rounded border-transparent focus:bg-white outline-none" 
                                    value={txt} 
                                    onChange={e => {
                                        const next = [...(newSlide.bullets || [])];
                                        const item = typeof next[i] === 'string' ? { text: next[i] as string, link: '' } : next[i];
                                        // @ts-ignore
                                        next[i] = { ...item, text: e.target.value };
                                        setNewSlide({...newSlide, bullets: next as any});
                                    }}
                                    placeholder="Text"
                                />
                                <input 
                                    className="w-1/3 p-1 bg-gray-50 rounded border-transparent focus:bg-white outline-none text-blue-500" 
                                    value={lnk || ''} 
                                    onChange={e => {
                                        const next = [...(newSlide.bullets || [])];
                                         const item = typeof next[i] === 'string' ? { text: next[i] as string, link: '' } : next[i];
                                        // @ts-ignore
                                        next[i] = { ...item, link: e.target.value };
                                        setNewSlide({...newSlide, bullets: next as any});
                                    }}
                                    placeholder="Link"
                                />
                                <button onClick={() => setNewSlide(prev => ({...prev, bullets: prev.bullets?.filter((_, idx) => idx !== i)}))} className="text-red-400 font-bold px-1">×</button>
                            </div>
                            );
                        })}
                        </div>
                    </div>

                    {/* BUTTONS EDITOR */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Action Buttons (Drag to Reorder)</label>
                        <div className="flex gap-2">
                        <input className="w-1/3 p-2 bg-white rounded-lg text-xs" placeholder="Btn Text" value={tempButton.text} onChange={e => setTempButton({...tempButton, text: e.target.value})} />
                        <input className="flex-grow p-2 bg-white rounded-lg text-xs" placeholder="URL Link" value={tempButton.link} onChange={e => setTempButton({...tempButton, link: e.target.value})} />
                        <button onClick={() => { if(tempButton.text) { setNewSlide(prev => ({...prev, buttons: [...(prev.buttons||[]), tempButton]})); setTempButton({text:'', link:''}); }}} className="bg-blue-100 text-blue-600 px-3 rounded-lg font-bold">+</button>
                        </div>
                        <div className="space-y-2 mt-2">
                        {newSlide.buttons?.map((b, i) => (
                            <div 
                                key={i} 
                                draggable
                                onDragStart={(e) => handleItemDragStart(e, i, 'buttons')}
                                onDragOver={handleItemDragOver}
                                onDrop={(e) => handleItemDrop(e, i, 'buttons')}
                                className="flex gap-2 items-center text-[10px] bg-white p-2 rounded border cursor-move hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-gray-300 font-bold px-1">☰</span>
                                <input 
                                    className="w-1/3 p-1 bg-gray-50 rounded border-transparent focus:bg-white outline-none font-bold" 
                                    value={b.text} 
                                    onChange={e => {
                                        const next = [...(newSlide.buttons || [])];
                                        next[i] = { ...next[i], text: e.target.value };
                                        setNewSlide({...newSlide, buttons: next});
                                    }}
                                    placeholder="Label"
                                />
                                <input 
                                    className="flex-grow p-1 bg-gray-50 rounded border-transparent focus:bg-white outline-none text-blue-500" 
                                    value={b.link} 
                                    onChange={e => {
                                        const next = [...(newSlide.buttons || [])];
                                        next[i] = { ...next[i], link: e.target.value };
                                        setNewSlide({...newSlide, buttons: next});
                                    }}
                                    placeholder="URL"
                                />
                                <button onClick={() => setNewSlide(prev => ({...prev, buttons: prev.buttons?.filter((_, idx) => idx !== i)}))} className="text-red-400 font-bold px-1">×</button>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* IMAGES & VIDEOS UPLOAD */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group h-20">
                            <input type="file" multiple onChange={handleCustomImages} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="w-full h-full p-2 bg-gray-50 rounded-xl text-xs text-center border-2 border-dashed border-gray-200 text-gray-400 font-bold group-hover:border-[#e64d25] group-hover:text-[#e64d25] transition-colors flex items-center justify-center">
                            + Images
                            </div>
                        </div>
                        <div className="relative group h-20">
                            <input type="file" onChange={handleCustomVideo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="w-full h-full p-2 bg-gray-50 rounded-xl text-xs text-center border-2 border-dashed border-gray-200 text-gray-400 font-bold group-hover:border-[#283b82] group-hover:text-[#283b82] transition-colors flex items-center justify-center">
                            + Video File
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview Uploads */}
                    {(newSlide.images?.length ?? 0) > 0 || (newSlide.videos?.length ?? 0) > 0 ? (
                        <div className="space-y-4 pt-2">
                            {/* Images List */}
                            {newSlide.images && newSlide.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                {newSlide.images.map((img, i) => (
                                    <div key={`img-${i}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                        <img src={img.url} className="w-full h-full object-cover" />
                                        <button onClick={() => setNewSlide(prev => ({...prev, images: prev.images?.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">×</button>
                                    </div>
                                ))}
                                </div>
                            )}
                            {/* Videos List with Link Manager */}
                            {newSlide.videos && newSlide.videos.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-[9px] font-bold text-gray-400 uppercase">Videos & Links</h5>
                                    {newSlide.videos.map((vid, i) => (
                                        <div key={`vid-${i}`} className="bg-gray-50 p-2 rounded-lg border">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-[6px] text-white font-bold">VID</div>
                                                    <span className="text-[9px] font-bold truncate max-w-[100px]">{vid.title}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => addVideoLink(i)} className="text-[8px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">+ Link</button>
                                                    <button onClick={() => setNewSlide(prev => ({...prev, videos: prev.videos?.filter((_, idx) => idx !== i)}))} className="text-[8px] bg-red-100 text-red-500 px-2 py-1 rounded font-bold">×</button>
                                                </div>
                                            </div>
                                            {(vid.extraLinks || []).map((link, lIdx) => (
                                                <div key={lIdx} className="flex gap-1 mt-1">
                                                    <select 
                                                        className="text-[8px] p-1 rounded border"
                                                        value={link.type}
                                                        onChange={(e) => updateVideoLink(i, lIdx, 'type', e.target.value)}
                                                    >
                                                        <option value="linkedin">LI</option>
                                                        <option value="x">X</option>
                                                        <option value="drive">Dr</option>
                                                    </select>
                                                    <input 
                                                        className="flex-grow text-[8px] p-1 rounded border"
                                                        placeholder="URL"
                                                        value={link.url}
                                                        onChange={(e) => updateVideoLink(i, lIdx, 'url', e.target.value)}
                                                    />
                                                    <button onClick={() => removeVideoLink(i, lIdx)} className="text-red-400 text-[8px] px-1 font-bold">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                 </>
             )}

             <button onClick={addOrUpdateCustomSlide} disabled={!newSlide.title} className="w-full py-3 bg-[#283b82] text-white rounded-xl font-black text-xs uppercase disabled:opacity-50 mt-4 shadow-lg hover:scale-105 transition-transform">
               {editingSlideId ? 'Update Slide' : 'Create Slide'}
             </button>
          </div>
       </div>
    </div>
  );
};

export default StructureTab;
