
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  CampaignMetadata, ResourceLinks, ReportData, ReportStep, SocialPost, ArticleInfo, VideoInfo, CustomSlide 
} from './types';
import { GeminiService } from './services/geminiService';
import StepProgressBar from './components/StepProgressBar';
import PresentationView from './components/PresentationView';

const initialMetadata: CampaignMetadata = {
  clientName: '',
  campaignName: '',
  hashtag: [''],
  linkedinMention: [''],
  startDate: '',
  endDate: ''
};

const initialResources: ResourceLinks = {
  mainDriveFolder: '',
  top20XDriveLink: '',
  visualsDriveLink: '',
  shortsDriveLink: '',
  youtubeLinks: [{ id: '1', url: '', title: '' }],
  articleLinks: [{ id: '1', url: '', title: '', caption: '' }],
  additionalMedia: ''
};

const DEFAULT_TITLES = [
  "Campaign Launch",
  "Executive Overview",
  "X Channel Performance",
  "Top X Interactions",
  "LinkedIn Channel Performance",
  "Top LinkedIn Highlights",
  "LinkedIn Post Inventory",
  "Promoted Website Content",
  "Video Interview Content",
  "Video Collateral Assets",
  "Creative & Graphic Assets",
  "LINKEDIN NEWSLETTER PLACEMENTS",
  "IIoT World Newsletter Inserts"
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ReportStep>(ReportStep.BASICS);
  const [metadata, setMetadata] = useState<CampaignMetadata>(initialMetadata);
  const [resources, setResources] = useState<ResourceLinks>(initialResources);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; data: string; mimeType: string; section?: string; isText?: boolean }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const gemini = new GeminiService();

  const handleNext = () => {
    const steps = Object.values(ReportStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps = Object.values(ReportStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const newFiles = await Promise.all(fileList.map(async (file: File) => {
      const isSpreadsheet = file.name.toLowerCase().endsWith('.xlsx') || 
                          file.name.toLowerCase().endsWith('.xls') || 
                          file.name.toLowerCase().endsWith('.csv') || 
                          file.type.includes('spreadsheet') || 
                          file.type.includes('excel') || 
                          file.type === 'text/csv';

      if (isSpreadsheet) {
        return new Promise<{ name: string; data: string; mimeType: string; section: string; isText: boolean }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const bstr = event.target?.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            resolve({ 
              name: file.name, 
              data: csvData, 
              mimeType: 'text/csv', 
              section,
              isText: true 
            });
          };
          reader.readAsBinaryString(file);
        });
      } else {
        return new Promise<{ name: string; data: string; mimeType: string; section: string; isText: boolean }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            resolve({ name: file.name, data: base64, mimeType: file.type, section, isText: false });
          };
          reader.readAsDataURL(file);
        });
      }
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const results = await gemini.analyzeReportFiles(uploadedFiles, metadata, resources);
      
      const linkedinNewsletters = results?.linkedinNewsletters || [];
      const linkedinStandardPosts = results?.linkedinStandardPosts || [];
      const topXPostsRaw = results?.topXPosts || [];
      const topLinkedinPostsRaw = results?.topLinkedinPosts || [];

      const enhancedYoutube = resources.youtubeLinks.map(link => {
        const found = results?.resourcesEnhancement?.youtube?.find((r: any) => r.id === link.id);
        return { ...link, title: link.title || found?.title || 'Video Content' };
      });

      const enhancedArticles = resources.articleLinks.map(link => {
        const found = results?.resourcesEnhancement?.articles?.find((r: any) => r.id === link.id);
        return { 
          ...link, 
          title: link.title || found?.title || 'Published Article', 
          caption: link.caption || found?.caption || '' 
        };
      });

      const allDetectedLI = [...linkedinStandardPosts, ...linkedinNewsletters].map((p, idx) => ({ 
        ...p, 
        id: `ali-${idx}`,
        platform: 'LinkedIn' as const,
        impressions: String(p.impressions || '0'),
        reactions: String(p.reactions || '0'),
        clicks: String(p.clicks || '0'),
        comments: String(p.comments || '0'),
        reposts: String(p.reposts || '0'),
        reach: String(p.reach || '0')
      }));

      const newReportData: ReportData = {
        metadata,
        resources: { ...resources, youtubeLinks: enhancedYoutube, articleLinks: enhancedArticles },
        slideTitles: [...DEFAULT_TITLES],
        inventoryVisibleColumns: ['date', 'title', 'impressions', 'reactions', 'link'],
        executiveKpiSelection: ['xReach', 'liImpressions'],
        summaryOfActivities: results?.summaryOfActivities || `Campaign results for ${metadata.clientName}.`,
        activitiesList: (results?.activitiesList || [
          { id: '1', text: `Published ${linkedinNewsletters.length} Newsletter Articles`, icon: 'DOCS' },
          { id: '2', text: `Shared ${linkedinStandardPosts.length} LinkedIn Updates`, icon: 'SOCIAL' },
          { id: '3', text: `Generated visibility on X platform`, icon: 'GROWTH' }
        ]).map((act: any) => ({
           ...act,
           icon: act.icon === '📄' ? 'DOCS' : act.icon === '📱' ? 'SOCIAL' : act.icon === '📈' ? 'GROWTH' : (act.icon || 'STAR'),
           link: act.link || ''
        })),
        xMetrics: {
          reach: String(results?.xMetrics?.reach || '0'),
          mentions: String(results?.xMetrics?.mentions || '0'),
          engagement: String(results?.xMetrics?.engagement || '0'),
          rate: String(results?.xMetrics?.rate || '0%')
        },
        linkedinMetrics: {
          impressions: String(results?.linkedinMetrics?.impressions || '0'),
          engagement: String(results?.linkedinMetrics?.engagement || '0'),
          views: String(results?.linkedinMetrics?.views || '0'),
          totalPosts: String(allDetectedLI.length),
          totalReactions: String(results?.linkedinMetrics?.totalReactions || '0'),
          totalComments: String(results?.linkedinMetrics?.totalComments || '0'),
          totalClicks: String(results?.linkedinMetrics?.totalClicks || '0'),
          totalReposts: String(results?.linkedinMetrics?.totalReposts || '0'),
        },
        linkedinNewsletters: linkedinNewsletters.map((p: any, idx: number) => ({ 
          ...p, id: `ln-${idx}`, platform: 'LinkedIn', 
          impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'), link: p.link || '' 
        })),
        linkedinStandardPosts: linkedinStandardPosts.map((p: any, idx: number) => ({ 
          ...p, id: `ls-${idx}`, platform: 'LinkedIn', 
          impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'), link: p.link || '' 
        })),
        topXPosts: topXPostsRaw.map((p: any, idx: number) => ({ 
          ...p, id: `tx-${idx}`, platform: 'X', 
          author: p.author || 'IIoT World',
          reach: String(p.reach || '0'), impressions: String(p.impressions || '0'), link: p.link || '' 
        })),
        topLinkedinPosts: topLinkedinPostsRaw.map((p: any, idx: number) => ({ 
          ...p, id: `tl-${idx}`, platform: 'LinkedIn', 
          impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'), link: p.link || '' 
        })),
        allLinkedinPosts: allDetectedLI,
        articles: enhancedArticles
          .filter(l => l.url && l.url.trim() !== '')
          .map((l, idx) => ({ 
            id: `art-${idx}`,
            title: l.title, 
            link: l.url, 
            caption: l.caption 
          })),
        videoInterviews: enhancedYoutube
          .filter(l => l.url && l.url.trim() !== '')
          .map((l, idx) => ({ 
            id: `vi-${idx}`,
            type: 'interview', 
            title: l.title, 
            link: l.url 
          })),
        videoCollateral: uploadedFiles
          .filter(f => f.section === 'collateral' && f.mimeType.startsWith('video/'))
          .map((f, idx) => ({
            id: `vc-${idx}`,
            type: 'collateral',
            title: f.name,
            link: resources.visualsDriveLink,
            base64Video: `data:${f.mimeType};base64,${f.data}`,
            linkedinLink: '',
            xLink: ''
          })),
        graphics: uploadedFiles
          .filter(f => f.section === 'graphics' && f.mimeType.startsWith('image'))
          .map(f => ({ url: `data:${f.mimeType};base64,${f.data}`, label: f.name })),
        newsletterInserts: [],
        iiotNewsletterInserts: uploadedFiles
          .filter(f => f.section === 'newsletter_inserts')
          .map((f, idx) => ({ 
            id: `iiot-n-${idx}`, 
            image: `data:${f.mimeType};base64,${f.data}`, 
            title: f.name 
          })),
        customSlides: [],
        additionalContent: resources.additionalMedia || ''
      };

      setReportData(newReportData);
      setCurrentStep(ReportStep.PREVIEW);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your data feed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const assignProofImage = (file: File, type: 'X' | 'LI' | 'Article' | 'Newsletter' | 'Custom', id: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setReportData(prev => {
        if (!prev) return null;
        const next = JSON.parse(JSON.stringify(prev)) as ReportData;
        if (type === 'X') {
          const p = next.topXPosts.find(x => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'LI') {
          const p = next.topLinkedinPosts.find(x => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'Article') {
          const p = next.articles.find(x => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'Newsletter') {
          const p = next.linkedinNewsletters.find(x => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'Custom') {
          const p = next.customSlides.find(x => x.id === id); if (p) p.fileData = base64;
        }
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const updateField = (path: string[], value: any) => {
    setReportData(prev => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
  };

  const addCustomSlide = () => {
    const newSlide: CustomSlide = {
      id: Math.random().toString(),
      title: 'New Content Slide',
      subtitle: '',
      content: '',
      linkText: 'View More',
      type: 'text'
    };
    updateField(['customSlides'], [...(reportData?.customSlides || []), newSlide]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case ReportStep.BASICS:
        return (
          <div className="space-y-10 animate-fadeIn">
            <div>
              <h2 className="text-4xl font-black text-[#283b82]">Project Basics</h2>
              <p className="text-gray-400 font-medium mt-2 uppercase tracking-widest text-xs">Identity of the campaign</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Client Name</label>
                <input 
                  className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-bold text-gray-700"
                  placeholder="e.g. Rockwell Automation"
                  value={metadata.clientName}
                  onChange={e => setMetadata({...metadata, clientName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Campaign Name</label>
                <input 
                  className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-bold"
                  placeholder="2025 Smart Manufacturing Report"
                  value={metadata.campaignName}
                  onChange={e => setMetadata({...metadata, campaignName: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400">Campaign Hashtags</label>
                {metadata.hashtag.map((h, idx) => (
                   <div key={idx} className="flex gap-2">
                     <input 
                        className="flex-grow p-4 bg-white rounded-xl border-2 border-gray-50 font-bold text-[#e64d25]"
                        value={h}
                        onChange={e => {
                          const next = [...metadata.hashtag];
                          next[idx] = e.target.value;
                          setMetadata({...metadata, hashtag: next});
                        }}
                        placeholder="#Tag"
                     />
                     <button onClick={() => setMetadata({...metadata, hashtag: metadata.hashtag.filter((_, i) => i !== idx)})} className="text-red-400">×</button>
                   </div>
                ))}
                <button onClick={() => setMetadata({...metadata, hashtag: [...metadata.hashtag, '']})} className="text-xs font-bold text-[#e64d25]">+ Add Hashtag</button>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400">LinkedIn Mentions</label>
                {metadata.linkedinMention.map((m, idx) => (
                   <div key={idx} className="flex gap-2">
                     <input 
                        className="flex-grow p-4 bg-white rounded-xl border-2 border-gray-50 font-bold text-blue-600"
                        value={m}
                        onChange={e => {
                          const next = [...metadata.linkedinMention];
                          next[idx] = e.target.value;
                          setMetadata({...metadata, linkedinMention: next});
                        }}
                        placeholder="@Mention"
                     />
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

      case ReportStep.RESOURCES:
        return (
          <div className="space-y-10 animate-fadeIn">
            <h2 className="text-4xl font-black text-[#283b82]">External Ecosystem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { label: 'Main Google Drive Folder', key: 'mainDriveFolder' },
                 { label: 'Top 20 X Posts Drive Link', key: 'top20XDriveLink' },
                 { label: 'Visuals Drive Link', key: 'visualsDriveLink' },
                 { label: 'Shorts Drive Link', key: 'shortsDriveLink' },
               ].map(item => (
                 <div key={item.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">{item.label}</label>
                    <input 
                      className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-medium"
                      value={(resources as any)[item.key]}
                      onChange={e => setResources({...resources, [item.key]: e.target.value})}
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
                    <label className="text-[9px] uppercase font-bold text-gray-400">Title (Optional)</label>
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
              <h3 className="font-bold text-[#283b82]">Written Articles for IIoT World (Manual)</h3>
              <p className="text-[10px] text-gray-400 uppercase font-black">Links added here will appear on the "Promoted Website Content" slide.</p>
              {resources.articleLinks.map((link, idx) => (
                <div key={link.id} className="flex gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Article URL</label>
                    <input className="w-full p-3 bg-white border rounded-xl" value={link.url} onChange={e => {
                      const next = [...resources.articleLinks]; next[idx].url = e.target.value; setResources({...resources, articleLinks: next});
                    }} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Title (Optional)</label>
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

      case ReportStep.DATA_UPLOAD:
        return (
          <div className="space-y-10 animate-fadeIn">
            <h2 className="text-4xl font-black text-[#283b82]">Analytics Data Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'LinkedIn CSV', section: 'linkedin', desc: 'Article/Post analysis' },
                { label: 'X Metrics (CSV)', section: 'x_csv', desc: 'Campaign highlights' },
                { label: 'Top 20 X Posts (PDF/CSV)', section: 'x_top', desc: 'Best interactions' },
                { label: 'Brandwatch (PDF)', section: 'brandwatch', desc: 'General reach' },
              ].map(item => (
                <div key={item.section} className="p-8 bg-white rounded-3xl border-2 border-dashed border-gray-100 hover:border-[#e64d25] transition-all h-40 flex flex-col justify-center">
                   <div className="font-black text-[#283b82]">{item.label}</div>
                   <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 mb-4">{item.desc}</div>
                   <input type="file" onChange={e => handleFileUpload(e, item.section)} className="block w-full text-xs text-gray-500" />
                </div>
              ))}
            </div>
          </div>
        );

      case ReportStep.ASSETS:
        return (
          <div className="space-y-10 animate-fadeIn">
            <h2 className="text-4xl font-black text-[#283b82]">Visual & Creative Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4">
                  <h4 className="font-black text-[#283b82]">Graphics & Banners</h4>
                  <input type="file" multiple onChange={e => handleFileUpload(e, 'graphics')} className="text-xs w-full" />
               </div>
               <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4">
                  <h4 className="font-black text-[#283b82]">Video Collateral</h4>
                  <input type="file" multiple onChange={e => handleFileUpload(e, 'collateral')} className="text-xs w-full" />
               </div>
               <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4 col-span-1 md:col-span-2">
                  <h4 className="font-black text-[#283b82]">Newsletter Ad Proofs (Manual)</h4>
                  <input type="file" multiple onChange={e => handleFileUpload(e, 'newsletter_inserts')} className="text-xs w-full" />
               </div>
            </div>
            <button onClick={runAnalysis} className="w-full py-6 rounded-3xl text-white font-black text-2xl bg-[#e64d25] shadow-2xl">
              {isAnalyzing ? "Processing Campaign Data..." : "Analyze and Edit Report Content"}
            </button>
          </div>
        );

      case ReportStep.PREVIEW:
        return reportData ? (
          <div className="space-y-12 animate-fadeIn pb-40">
            <div className="flex justify-between items-end border-b pb-8">
              <div>
                <h2 className="text-4xl font-black text-[#283b82]">Report Configuration</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Personalize slide titles, metrics, and content cards</p>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setCurrentStep(ReportStep.ASSETS)} className="px-6 py-4 bg-gray-200 text-gray-600 font-black rounded-2xl">Assets</button>
                 <button onClick={() => setCurrentStep(ReportStep.FINAL)} className="px-12 py-4 bg-[#e64d25] text-white font-black rounded-2xl shadow-xl">Launch Live Report</button>
              </div>
            </div>

            {/* Slide Titles Editor */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-8">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">1. Slide Titles</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {reportData.slideTitles.map((title, i) => (
                     <div key={i} className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400">Slide {i + 1}</label>
                        <input className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-xs" value={title} onChange={e => {
                           const next = [...reportData.slideTitles]; next[i] = e.target.value; updateField(['slideTitles'], next);
                        }} />
                     </div>
                  ))}
               </div>
            </div>

            {/* Executive Summary Editor */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-8">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">2. Executive Overview Details</h3>
               <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-gray-400">Campaign Summary (The Story)</label>
                  <textarea 
                     className="w-full p-4 bg-gray-50 border rounded-2xl font-medium text-xs h-32"
                     value={reportData.summaryOfActivities}
                     onChange={e => updateField(['summaryOfActivities'], e.target.value)}
                  />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <label className="text-[9px] font-black uppercase text-gray-400">Campaign Activities (Icon List)</label>
                     <button 
                        onClick={() => updateField(['activitiesList'], [...reportData.activitiesList, { id: Math.random().toString(), text: 'New Activity', icon: 'STAR', link: '' }])}
                        className="text-[9px] font-black text-[#e64d25] uppercase underline"
                     >+ Add Activity</button>
                  </div>
                  <div className="space-y-4">
                     {reportData.activitiesList.map((act, i) => (
                        <div key={act.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-4 rounded-xl border">
                           <div className="flex items-center gap-2">
                              <select 
                                 className="text-[10px] font-bold p-2 bg-white border rounded"
                                 value={act.icon}
                                 onChange={e => {
                                    const next = [...reportData.activitiesList];
                                    next[i].icon = e.target.value;
                                    updateField(['activitiesList'], next);
                                 }}
                              >
                                 <option value="DOCS">Docs</option>
                                 <option value="SOCIAL">Social</option>
                                 <option value="GROWTH">Growth</option>
                                 <option value="STAR">Star</option>
                              </select>
                              <input 
                                 className="flex-grow p-2 text-xs font-bold bg-white border rounded"
                                 value={act.text}
                                 onChange={e => {
                                    const next = [...reportData.activitiesList];
                                    next[i].text = e.target.value;
                                    updateField(['activitiesList'], next);
                                 }}
                                 placeholder="Activity Title"
                              />
                           </div>
                           <input 
                              className="p-2 text-[10px] font-medium bg-white border rounded"
                              value={act.link || ''}
                              onChange={e => {
                                 const next = [...reportData.activitiesList];
                                 next[i].link = e.target.value;
                                 updateField(['activitiesList'], next);
                              }}
                              placeholder="Activity Link (Optional)"
                           />
                           <div className="flex justify-end">
                              <button 
                                 onClick={() => updateField(['activitiesList'], reportData.activitiesList.filter(a => a.id !== act.id))}
                                 className="text-red-500 font-bold px-2"
                              >Delete</button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Executive Overview KPI Picker */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-8">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">3. Executive Overview KPIs</h3>
               <div className="flex gap-4 flex-wrap">
                  {[
                    { id: 'xReach', label: 'X Reach' }, { id: 'xMentions', label: 'X Mentions' }, { id: 'xEngagement', label: 'X Engagement' },
                    { id: 'liImpressions', label: 'LI Impressions' }, { id: 'liEngagement', label: 'LI Engagement' }, { id: 'liReactions', label: 'LI Reactions' }, { id: 'liPosts', label: 'LI Posts' }
                  ].map(kpi => (
                    <label key={kpi.id} className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl border-2 cursor-pointer font-bold text-[10px] uppercase">
                       <input 
                          type="checkbox" 
                          checked={reportData.executiveKpiSelection.includes(kpi.id)}
                          onChange={() => {
                             const next = reportData.executiveKpiSelection.includes(kpi.id)
                               ? reportData.executiveKpiSelection.filter(id => id !== kpi.id)
                               : [...reportData.executiveKpiSelection, kpi.id];
                             updateField(['executiveKpiSelection'], next);
                          }}
                       />
                       {kpi.label}
                    </label>
                  ))}
               </div>
            </div>

            {/* Performance Metrics Editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">X Metrics</h3>
                  {Object.entries(reportData.xMetrics).map(([key, val]) => (
                     <div key={key} className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400">{key}</label>
                        <input className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-xs" value={val} onChange={e => updateField(['xMetrics', key], e.target.value)} />
                     </div>
                  ))}
               </div>
               <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">LinkedIn Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {Object.entries(reportData.linkedinMetrics).map(([key, val]) => (
                        <div key={key} className="space-y-1">
                           <label className="text-[9px] font-black uppercase text-gray-400">{key}</label>
                           <input className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-xs" value={val} onChange={e => updateField(['linkedinMetrics', key], e.target.value)} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Top Posts Sections */}
            <div className="space-y-8">
               <h3 className="text-2xl font-black text-[#283b82] uppercase tracking-tighter">Campaign Highlights (Post Cards)</h3>
               
               {/* Top X Posts */}
               <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
                  <h4 className="font-black text-[#e64d25] uppercase text-xs">Edit Top X Interactions (Slide 4)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {reportData.topXPosts.map((post, i) => (
                        <div key={post.id} className="p-6 bg-gray-50 border rounded-3xl space-y-4 shadow-sm relative">
                           <input className="w-full font-black p-2 border-b bg-transparent text-sm" value={post.title} onChange={e => {
                              const next = [...reportData.topXPosts]; next[i].title = e.target.value; updateField(['topXPosts'], next);
                           }} />
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Account Name</label>
                                 <input className="w-full p-2 bg-white rounded border text-[10px] font-bold" value={post.author} onChange={e => {
                                    const next = [...reportData.topXPosts]; next[i].author = e.target.value; updateField(['topXPosts'], next);
                                 }} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Reach Value</label>
                                 <input className="w-full p-2 bg-white rounded border text-[10px] font-bold" value={post.reach} onChange={e => {
                                    const next = [...reportData.topXPosts]; next[i].reach = e.target.value; updateField(['topXPosts'], next);
                                 }} />
                              </div>
                           </div>
                           <div className="flex items-center justify-between gap-4">
                              <input type="file" className="text-[10px] flex-grow" onChange={e => e.target.files?.[0] && assignProofImage(e.target.files[0], 'X', post.id)} />
                              {post.proofImage && <img src={post.proofImage} className="w-12 h-12 rounded object-cover border" />}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Top LinkedIn Posts */}
               <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
                  <h4 className="font-black text-[#283b82] uppercase text-xs">Edit Top LinkedIn Highlights (Slide 6)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {reportData.topLinkedinPosts.map((post, i) => (
                        <div key={post.id} className="p-6 bg-gray-50 border rounded-3xl space-y-4 shadow-sm">
                           <input className="w-full font-black p-2 border-b bg-transparent text-sm" value={post.title} onChange={e => {
                              const next = [...reportData.topLinkedinPosts]; next[i].title = e.target.value; updateField(['topLinkedinPosts'], next);
                           }} />
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Impressions</label>
                                 <input className="w-full p-2 bg-white rounded border text-[10px] font-bold" value={post.impressions} onChange={e => {
                                    const next = [...reportData.topLinkedinPosts]; next[i].impressions = e.target.value; updateField(['topLinkedinPosts'], next);
                                 }} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Reactions</label>
                                 <input className="w-full p-2 bg-white rounded border text-[10px] font-bold" value={post.reactions} onChange={e => {
                                    const next = [...reportData.topLinkedinPosts]; next[i].reactions = e.target.value; updateField(['topLinkedinPosts'], next);
                                 }} />
                              </div>
                           </div>
                           <div className="flex items-center justify-between gap-4">
                              <input type="file" className="text-[10px] flex-grow" onChange={e => e.target.files?.[0] && assignProofImage(e.target.files[0], 'LI', post.id)} />
                              {post.proofImage && <img src={post.proofImage} className="w-12 h-12 rounded object-cover border" />}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Newsletter Placements (Article Type Detected) */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">Newsletter Placements (Slide 12)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reportData.linkedinNewsletters.map((newsletter, i) => (
                     <div key={newsletter.id} className="p-6 bg-gray-50 border rounded-3xl space-y-4">
                        <input className="w-full font-black p-2 border-b bg-transparent text-sm" value={newsletter.title} onChange={e => {
                           const next = [...reportData.linkedinNewsletters]; next[i].title = e.target.value; updateField(['linkedinNewsletters'], next);
                        }} />
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase">Engagement Rate</label>
                              <input className="w-full p-2 bg-white rounded border text-[10px] font-bold" value={newsletter.engagementRate} onChange={e => {
                                 const next = [...reportData.linkedinNewsletters]; next[i].engagementRate = e.target.value; updateField(['linkedinNewsletters'], next);
                              }} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase">Date</label>
                              <input className="w-full p-2 bg-white rounded border text-[10px] font-bold" value={newsletter.date} onChange={e => {
                                 const next = [...reportData.linkedinNewsletters]; next[i].date = e.target.value; updateField(['linkedinNewsletters'], next);
                              }} />
                           </div>
                        </div>
                        <input type="file" className="text-[10px] w-full" onChange={e => e.target.files?.[0] && assignProofImage(e.target.files[0], 'Newsletter', newsletter.id)} />
                     </div>
                  ))}
               </div>
            </div>

            {/* Inventory Visibility Selector and Table Preview */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-8">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">4. Post Inventory Preview (Slide 7)</h3>
               <div className="flex gap-4 flex-wrap mb-6">
                  {['date', 'title', 'impressions', 'reactions', 'clicks', 'comments', 'reposts', 'link'].map(col => (
                    <label key={col} className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl border-2 cursor-pointer font-bold text-[10px] uppercase">
                       <input 
                          type="checkbox" 
                          checked={reportData.inventoryVisibleColumns.includes(col)}
                          onChange={() => {
                             const next = reportData.inventoryVisibleColumns.includes(col)
                               ? reportData.inventoryVisibleColumns.filter(c => c !== col)
                               : [...reportData.inventoryVisibleColumns, col];
                             updateField(['inventoryVisibleColumns'], next);
                          }}
                       />
                       {col}
                    </label>
                  ))}
               </div>
               
               {/* Full Inventory Table Preview */}
               <div className="overflow-x-auto rounded-2xl border bg-gray-50 max-h-[400px]">
                  <table className="w-full text-left text-[10px]">
                     <thead className="bg-[#283b82] text-white uppercase font-black sticky top-0">
                        <tr>
                           {reportData.inventoryVisibleColumns.map(col => <th key={col} className="p-3">{col}</th>)}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                        {reportData.allLinkedinPosts.map((post: any, i) => (
                           <tr key={i} className="bg-white">
                              {reportData.inventoryVisibleColumns.map(col => (
                                 <td key={col} className="p-3 font-bold text-[#283b82] truncate max-w-[200px]">
                                   {col === 'link' ? (
                                     <span className="text-blue-500 underline truncate block">{post[col]}</span>
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

            {/* Website Content Section */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">Website Content (Slide 8)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reportData.articles.map((art, i) => (
                     <div key={art.id} className="p-6 bg-gray-50 border rounded-3xl space-y-4">
                        <input className="w-full font-black p-2 border-b bg-transparent text-sm" value={art.title} onChange={e => {
                           const next = [...reportData.articles]; next[i].title = e.target.value; updateField(['articles'], next);
                        }} />
                        <textarea className="w-full p-3 bg-white border rounded-xl text-[10px] h-20" value={art.caption} onChange={e => {
                           const next = [...reportData.articles]; next[i].caption = e.target.value; updateField(['articles'], next);
                        }} />
                        <div className="flex items-center justify-between gap-4">
                           <input type="file" className="text-[10px]" onChange={e => e.target.files?.[0] && assignProofImage(e.target.files[0], 'Article', art.id)} />
                           {art.proofImage && <img src={art.proofImage} className="w-12 h-12 rounded object-cover border" />}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Video Collateral Social Links */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-6">
               <h3 className="text-xl font-black text-[#283b82] uppercase border-b pb-2">Video Collateral Social Links (Slide 10)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reportData.videoCollateral.map((vid, i) => (
                     <div key={vid.id} className="p-6 bg-gray-50 border rounded-3xl space-y-4 shadow-sm">
                        <h4 className="font-black text-xs text-[#283b82] truncate">{vid.title}</h4>
                        <div className="space-y-2">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-400">LinkedIn Post Link</label>
                              <input 
                                 className="w-full p-2 bg-white border rounded text-[10px]"
                                 value={vid.linkedinLink || ''}
                                 onChange={e => {
                                    const next = [...reportData.videoCollateral];
                                    next[i].linkedinLink = e.target.value;
                                    updateField(['videoCollateral'], next);
                                 }}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-400">X Post Link</label>
                              <input 
                                 className="w-full p-2 bg-white border rounded text-[10px]"
                                 value={vid.xLink || ''}
                                 onChange={e => {
                                    const next = [...reportData.videoCollateral];
                                    next[i].xLink = e.target.value;
                                    updateField(['videoCollateral'], next);
                                 }}
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Custom Slide Addition */}
            <div className="p-10 bg-white rounded-[3rem] border shadow-sm space-y-8">
               <div className="flex justify-between items-center border-b pb-4">
                 <h3 className="text-xl font-black text-[#283b82] uppercase">Custom Slides</h3>
                 <button onClick={addCustomSlide} className="px-6 py-2 bg-[#e64d25] text-white font-black rounded-xl text-[10px] uppercase shadow-lg shadow-orange-100">+ Add Slide</button>
               </div>
               <div className="space-y-6">
                  {reportData.customSlides.map((slide, i) => (
                    <div key={slide.id} className="p-8 bg-gray-50 rounded-[2.5rem] border space-y-6 relative group">
                       <button onClick={() => updateField(['customSlides'], reportData.customSlides.filter(s => s.id !== slide.id))} className="absolute top-6 right-6 p-2 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-400">Slide Title</label>
                                <input className="w-full p-4 bg-white border rounded-2xl font-black text-xs" value={slide.title} onChange={e => {
                                   const next = [...reportData.customSlides]; next[i].title = e.target.value; updateField(['customSlides'], next);
                                }} />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-400">Subtitle</label>
                                <input className="w-full p-4 bg-white border rounded-2xl font-bold text-xs" placeholder="Add a subtitle..." value={slide.subtitle || ''} onChange={e => {
                                   const next = [...reportData.customSlides]; next[i].subtitle = e.target.value; updateField(['customSlides'], next);
                                }} />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-400">Content Modality</label>
                                <select className="w-full p-4 bg-white border rounded-2xl font-bold text-xs" value={slide.type} onChange={e => {
                                   const next = [...reportData.customSlides]; next[i].type = e.target.value as any; updateField(['customSlides'], next);
                                }}>
                                   <option value="text">Text Context</option>
                                   <option value="link">Web Resource (Link)</option>
                                   <option value="file">Visual Asset (Image)</option>
                                </select>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-400">Description / Context Content</label>
                                <textarea className="w-full p-4 bg-white border rounded-2xl font-medium text-xs h-[110px]" value={slide.content} onChange={e => {
                                   const next = [...reportData.customSlides]; next[i].content = e.target.value; updateField(['customSlides'], next);
                                }} />
                             </div>
                             {(slide.type === 'link' || slide.type === 'file') && (
                                <div className="space-y-4">
                                   <div className="space-y-1">
                                      <label className="text-[9px] font-black uppercase text-gray-400">Link URL (Optional for File)</label>
                                      <input className="w-full p-4 bg-white border rounded-2xl font-bold text-xs" placeholder="https://..." value={slide.link || ''} onChange={e => {
                                         const next = [...reportData.customSlides]; next[i].link = e.target.value; updateField(['customSlides'], next);
                                      }} />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[9px] font-black uppercase text-gray-400">Link Button Text</label>
                                      <input className="w-full p-4 bg-white border rounded-2xl font-bold text-xs" placeholder="e.g. View this resource" value={slide.linkText || ''} onChange={e => {
                                         const next = [...reportData.customSlides]; next[i].linkText = e.target.value; updateField(['customSlides'], next);
                                      }} />
                                   </div>
                                </div>
                             )}
                             {slide.type === 'file' && (
                                <input type="file" className="text-[10px]" onChange={e => e.target.files?.[0] && assignProofImage(e.target.files[0], 'Custom', slide.id)} />
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        ) : null;

      case ReportStep.FINAL:
        return reportData ? <PresentationView data={reportData} /> : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      <header className="bg-white border-b border-gray-100 px-10 py-8 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#e64d25] rounded-2xl flex items-center justify-center text-white font-black text-xl">II</div>
          <h1 className="text-2xl font-black text-[#283b82] tracking-tighter">REPORT <span className="text-[#e64d25]">SYSTEM</span></h1>
        </div>
        {currentStep !== ReportStep.FINAL && <StepProgressBar currentStep={currentStep} />}
      </header>
      <main className={`flex-grow container mx-auto px-6 py-16 ${currentStep === ReportStep.FINAL ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {renderStepContent()}
      </main>
      {currentStep !== ReportStep.FINAL && (
        <footer className="bg-white border-t p-8 sticky bottom-0 z-50 flex justify-between items-center">
          <button onClick={handlePrev} disabled={currentStep === ReportStep.BASICS} className="px-10 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors">Back</button>
          <button onClick={handleNext} disabled={currentStep === ReportStep.ASSETS || currentStep === ReportStep.PREVIEW} className="px-12 py-4 bg-[#283b82] text-white font-black rounded-2xl shadow-xl hover:bg-[#1a2b63] transition-all">Continue</button>
        </footer>
      )}
    </div>
  );
};

export default App;
