import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  CampaignMetadata, ResourceLinks, ReportData, ReportStep, SocialPost, ArticleInfo, VideoInfo, CustomSlide, SlideConfig 
} from './types';
import { GeminiService } from './services/geminiService';
import { PersistenceService } from './services/persistenceService';
import { FirebaseService, ReportMetadata } from './services/firebaseService';
import StepProgressBar from './components/StepProgressBar';
import PresentationView, { Icon } from './components/PresentationView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

declare const LZString: any;

// --- Login Component ---
const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] p-4">
       <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-8 text-center">
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-[#e64d25] rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4">II</div>
             <h1 className="text-2xl font-black text-[#283b82]">REPORT SYSTEM</h1>
             <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Authorized Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
             <div>
               <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Email</label>
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none focus:border-[#283b82]" placeholder="admin@iiot-world.com" />
             </div>
             <div>
               <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Password</label>
               <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none focus:border-[#283b82]" placeholder="••••••••" />
             </div>
             {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
             <button type="submit" disabled={loading} className="w-full py-4 bg-[#283b82] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#1a2b63] transition-colors">
                {loading ? 'Verifying...' : 'Access Dashboard'}
             </button>
          </form>
       </div>
    </div>
  );
};

// --- Dashboard Component ---
const DashboardView = ({ 
  onNewReport, 
  onLoadReport, 
  user 
}: { 
  onNewReport: () => void, 
  onLoadReport: (id: string) => void,
  user: any 
}) => {
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    if (user) {
      FirebaseService.getUserReports(user.uid).then(data => {
        // Sort by updated descending
        data.sort((a, b) => b.updatedAt?.seconds - a.updatedAt?.seconds);
        setReports(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-8">
       <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#e64d25] rounded-xl flex items-center justify-center text-white font-black text-lg">II</div>
                <h1 className="text-2xl font-black text-[#283b82]">DASHBOARD</h1>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase hidden md:inline">{user.email}</span>
                <button onClick={() => logout()} className="text-xs font-black text-[#e64d25] underline">Logout</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {/* New Report Card */}
             <button onClick={onNewReport} className="bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-[#e64d25] hover:text-[#e64d25] transition-all group min-h-[200px]">
                <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-orange-50 flex items-center justify-center text-2xl font-black">+</div>
                <span className="font-black uppercase text-xs tracking-widest">Create New Report</span>
             </button>

             {loading ? (
                <div className="col-span-3 flex items-center justify-center text-gray-300 font-bold uppercase text-xs">Loading reports...</div>
             ) : (
                reports.map(report => (
                   <div key={report.id} onClick={() => onLoadReport(report.id)} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer min-h-[200px] group">
                      <div className="space-y-2">
                         <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Report</div>
                         <h3 className="text-lg font-black text-[#283b82] leading-tight line-clamp-2 group-hover:text-[#e64d25] transition-colors">{report.title}</h3>
                      </div>
                      <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                         <div className="text-[9px] font-bold text-gray-400 uppercase">
                            {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                         </div>
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#283b82]">→</div>
                      </div>
                   </div>
                ))
             )}
          </div>
       </div>
    </div>
  );
};

// --- Interfaces for App ---
interface UploadedFile {
  id: string;
  name: string;
  data: string;
  mimeType: string;
  section: string;
  isText: boolean;
}

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
  brandwatchDriveLink: '',
  youtubeLinks: [{ id: '1', url: '', title: '' }],
  articleLinks: [{ id: '1', url: '', title: '', caption: '' }],
  additionalMedia: ''
};

const DEFAULT_TITLES = [
  "IIoT World Report",
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
  "IIoT World Newsletter Inserts",
  "X (Twitter) Content Metrics"
];

const DEFAULT_SLIDE_IDS = [
  'cover', 'executive', 'x_performance', 'x_top', 'linkedin_performance', 
  'linkedin_top', 'linkedin_inventory', 'website_content', 'video_interviews', 
  'video_collateral', 'creative_assets', 'newsletter_placements', 
  'iiot_newsletter_inserts', 'x_metrics'
];

const MainApp = () => {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'loading' | 'login' | 'dashboard' | 'editor' | 'viewer'>('loading');
  
  // Editor State
  const [currentStep, setCurrentStep] = useState<ReportStep>(ReportStep.BASICS);
  const [metadata, setMetadata] = useState<CampaignMetadata>(initialMetadata);
  const [resources, setResources] = useState<ResourceLinks>(initialResources);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLIAnalyzing, setIsLIAnalyzing] = useState(false);
  const [isXAnalyzing, setIsXAnalyzing] = useState(false);
  const [liDataBuffer, setLiDataBuffer] = useState<any>(null);
  const [xDataBuffer, setXDataBuffer] = useState<any>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Custom Slide State
  const [newSlide, setNewSlide] = useState<Partial<CustomSlide>>({
    title: '', subtitle: '', content: '', linkText: '', link: '', type: 'text'
  });

  // Review Editor State
  const [editorTab, setEditorTab] = useState<'structure' | 'executive' | 'metrics' | 'content'>('structure');

  const gemini = new GeminiService();

  // Initialization Logic
  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get('reportId');

      if (reportId) {
        // Viewer Mode: Load report directly from cloud
        setViewMode('loading');
        const data = await FirebaseService.getReport(reportId);
        if (data) {
          setReportData(data);
          setCurrentReportId(reportId);
          setViewMode('viewer');
        } else {
          alert("Report not found.");
          setViewMode('login'); // Fallback
        }
      } else if (!authLoading) {
        if (user) {
          setViewMode('dashboard');
        } else {
          setViewMode('login');
        }
      }
    };
    init();
  }, [user, authLoading]);

  // Save to Persistence (Local Backup) - Only when editing
  useEffect(() => {
    if (viewMode === 'editor') {
      PersistenceService.saveState({ metadata, resources, currentStep });
    }
  }, [metadata, resources, currentStep, viewMode]);

  const handleNewReport = () => {
    setMetadata(initialMetadata);
    setResources(initialResources);
    setUploadedFiles([]);
    setReportData(null);
    setCurrentReportId(null);
    setCurrentStep(ReportStep.BASICS);
    setViewMode('editor');
  };

  const handleLoadReport = async (id: string) => {
    setViewMode('loading');
    const data = await FirebaseService.getReport(id);
    if (data) {
      setReportData(data);
      setMetadata(data.metadata);
      setResources(data.resources);
      setCurrentReportId(id);
      setCurrentStep(ReportStep.PREVIEW);
      setViewMode('editor');
    } else {
      alert("Could not load report.");
      setViewMode('dashboard');
    }
  };

  const handleCloudSave = async () => {
    if (!reportData || !user) return;
    setIsSaving(true);
    setSaveStatus('Uploading Assets...');
    try {
      const id = await FirebaseService.saveReport(user.uid, reportData, currentReportId || undefined);
      setCurrentReportId(id);
      
      // Generate Link
      const url = `${window.location.origin}${window.location.pathname}?reportId=${id}`;
      
      try {
        await navigator.clipboard.writeText(url);
        setSaveStatus('Link Copied!');
      } catch (clipboardError) {
        console.warn('Clipboard write failed - document likely not focused', clipboardError);
        // Fallback status - at least the user knows it saved
        setSaveStatus('Saved!');
      }
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('Error Saving');
    } finally {
      setIsSaving(false);
    }
  };

  // --- EXISTING LOGIC HELPERS ---

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

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (!reportData) return;
    const newSequence = [...reportData.slideSequence];
    if (direction === 'up' && index > 0) {
      [newSequence[index], newSequence[index - 1]] = [newSequence[index - 1], newSequence[index]];
    } else if (direction === 'down' && index < newSequence.length - 1) {
      [newSequence[index], newSequence[index + 1]] = [newSequence[index + 1], newSequence[index]];
    }
    setReportData({ ...reportData, slideSequence: newSequence });
  };

  const toggleSlide = (id: string) => {
    if (!reportData) return;
    const newSequence = reportData.slideSequence.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setReportData({ ...reportData, slideSequence: newSequence });
  };

  const updateSlideLabel = (id: string, label: string) => {
    if (!reportData) return;
    const newSequence = reportData.slideSequence.map(s => s.id === id ? { ...s, label } : s);
    setReportData({ ...reportData, slideSequence: newSequence });
  };

  const toggleKpi = (kpiId: string) => {
    if (!reportData) return;
    const current = reportData.executiveKpiSelection || [];
    const next = current.includes(kpiId) ? current.filter(k => k !== kpiId) : [...current, kpiId];
    setReportData({ ...reportData, executiveKpiSelection: next });
  };

  const toggleInventoryColumn = (col: string) => {
    if (!reportData) return;
    const masterOrder = ['date', 'title', 'impressions', 'engagements', 'reactions', 'clicks', 'reposts', 'link'];
    const current = reportData.inventoryVisibleColumns || [];
    let next;
    
    if (current.includes(col)) {
      next = current.filter(c => c !== col);
    } else {
      next = [...current, col];
    }
    
    const sortedNext = masterOrder.filter(c => next.includes(c));
    setReportData({ ...reportData, inventoryVisibleColumns: sortedNext });
  };

  const updateActivity = (index: number, field: string, value: string) => {
    if (!reportData) return;
    const newActivities = [...reportData.activitiesList];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setReportData({ ...reportData, activitiesList: newActivities });
  };

  const addActivity = () => {
    if (!reportData) return;
    setReportData({
      ...reportData,
      activitiesList: [...reportData.activitiesList, { id: Date.now().toString(), text: 'New Activity', icon: 'DOCS', link: '' }]
    });
  };

  const removeActivity = (index: number) => {
    if (!reportData) return;
    const newActivities = reportData.activitiesList.filter((_, i) => i !== index);
    setReportData({ ...reportData, activitiesList: newActivities });
  };

  const addCustomSlide = () => {
    if (!reportData || !newSlide.title) return;
    const id = `custom_${Math.random().toString(36).substr(2, 9)}`;
    const slide: CustomSlide = {
      id,
      title: newSlide.title,
      subtitle: newSlide.subtitle,
      content: newSlide.content || '',
      type: newSlide.type || 'text',
      link: newSlide.link,
      linkText: newSlide.linkText,
      fileData: newSlide.fileData
    };
    
    const newSlides = [...(reportData.customSlides || []), slide];
    const newSequence = [...reportData.slideSequence];
    const insertIdx = newSequence.findIndex(s => s.id === 'thank_you');
    const seqItem = { id, label: slide.title, enabled: true };
    if (insertIdx >= 0) {
      newSequence.splice(insertIdx, 0, seqItem);
    } else {
      newSequence.push(seqItem);
    }

    setReportData({ ...reportData, customSlides: newSlides, slideSequence: newSequence });
    setNewSlide({ title: '', subtitle: '', content: '', linkText: '', link: '', type: 'text' });
  };

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

  const deleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
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
        return new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const bstr = event.target?.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            resolve({ 
              id: Math.random().toString(36).substr(2, 9),
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
        return new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            resolve({ 
              id: Math.random().toString(36).substr(2, 9),
              name: file.name, 
              data: base64, 
              mimeType: file.type, 
              section, 
              isText: false 
            });
          };
          reader.readAsDataURL(file);
        });
      }
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const generateLIMetrics = async () => {
    setIsLIAnalyzing(true);
    try {
      const results = await gemini.analyzeLinkedInData(uploadedFiles, metadata);
      setLiDataBuffer(results);
    } catch (e) {
      console.error(e);
      alert("LinkedIn analysis failed. Check console for details.");
    } finally {
      setIsLIAnalyzing(false);
    }
  };

  const generateXMetrics = async () => {
    setIsXAnalyzing(true);
    try {
      const results = await gemini.analyzeXData(uploadedFiles, metadata);
      setXDataBuffer(results);
    } catch (e) {
      console.error(e);
      alert("X analysis failed. Check console for details.");
    } finally {
      setIsXAnalyzing(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const results = await gemini.analyzeReportFiles(uploadedFiles, metadata, resources);
      
      const linkedinNewsletters = liDataBuffer?.newsletterAnalysis?.articles || [];
      const linkedinStandardPosts = liDataBuffer?.postDetailTable?.filter((p: any) => !linkedinNewsletters.some((n: any) => n.link === p.link)) || [];
      const topXPostsRaw = xDataBuffer?.topXPosts || [];
      const topLinkedinPostsRaw = liDataBuffer?.top4Posts || [];

      const enhancedYoutube = resources.youtubeLinks.map(link => {
        const found = results?.resourcesEnhancement?.youtube?.find((r: any) => r.id === link.id);
        return { ...link, title: found?.title || link.title || 'Video Content' };
      });

      const enhancedArticles = resources.articleLinks.map(link => {
        const found = results?.resourcesEnhancement?.articles?.find((r: any) => r.id === link.id);
        return { 
          ...link, 
          title: found?.title || link.title || 'Published Article', 
          caption: found?.caption || link.caption || '' 
        };
      });

      const allDetectedLI = liDataBuffer?.postDetailTable?.map((p: any, idx: number) => ({ 
        ...p, 
        title: p.snippet, // Map snippet to title for Inventory Slide
        id: `ali-${idx}`,
        platform: 'LinkedIn' as const,
        impressions: String(p.impressions || '0'),
        reactions: String(p.reactions || '0'),
        clicks: String(p.clicks || '0'),
        comments: String(p.comments || '0'),
        reposts: String(p.reposts || '0'),
        reach: '0'
      })) || [];

      const initialSequence: SlideConfig[] = DEFAULT_SLIDE_IDS.map((id, idx) => ({
        id,
        label: DEFAULT_TITLES[idx],
        enabled: true
      }));
      initialSequence.push({ id: 'thank_you', label: 'THANK YOU', enabled: true });

      const newReportData: ReportData = {
        metadata,
        resources: { ...resources, youtubeLinks: enhancedYoutube, articleLinks: enhancedArticles },
        slideTitles: [...DEFAULT_TITLES],
        slideSequence: initialSequence,
        inventoryVisibleColumns: ['date', 'title', 'impressions', 'engagements', 'reactions', 'clicks', 'reposts', 'link'],
        executiveKpiSelection: ['xReach', 'liImpressions'],
        summaryOfActivities: results?.summaryOfActivities || `Campaign results for ${metadata.clientName}.`,
        activitiesList: (results?.activitiesList || [
          { id: '1', text: `Published Newsletter Articles`, icon: 'DOCS' },
          { id: '2', text: `Shared LinkedIn Updates`, icon: 'SOCIAL' },
          { id: '3', text: `Generated visibility on X platform`, icon: 'GROWTH' }
        ]).map((a: any) => ({ ...a, link: '' })),
        xMetrics: {
          reach: String(xDataBuffer?.xMetrics?.reach || '0'),
          mentions: String(xDataBuffer?.xMetrics?.mentions || '0'),
          impressions: String(xDataBuffer?.xMetrics?.impressions || '0'),
          engagement: String(xDataBuffer?.xMetrics?.engagement || '0'),
          rate: String(xDataBuffer?.xMetrics?.rate || '0%')
        },
        linkedinMetrics: {
          impressions: String(liDataBuffer?.executiveSummary?.totalImpressions || '0'),
          engagement: String(liDataBuffer?.executiveSummary?.totalEngagements || '0'),
          views: String(liDataBuffer?.executiveSummary?.totalViews || '0'),
          totalPosts: String(liDataBuffer?.executiveSummary?.totalPostCount || '0'),
          totalReactions: String(liDataBuffer?.executiveSummary?.reactions || '0'),
          totalComments: String(liDataBuffer?.executiveSummary?.comments || '0'),
          totalClicks: String(liDataBuffer?.executiveSummary?.clicks || '0'),
          totalReposts: String(liDataBuffer?.executiveSummary?.reposts || '0'),
        },
        linkedinNewsletters: linkedinNewsletters.map((p: any, idx: number) => ({ 
          ...p, id: `ln-${idx}`, platform: 'LinkedIn', 
          impressions: String(p.impressions || '0'), reactions: '0', link: p.link || '' 
        })),
        linkedinStandardPosts: linkedinStandardPosts.map((p: any, idx: number) => ({ 
          ...p, id: `ls-${idx}`, platform: 'LinkedIn', 
          impressions: String(p.impressions || '0'), reactions: '0', link: p.link || '' 
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
      alert("Assembly failed. Please ensure you have generated both LinkedIn and X metrics first.");
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
          const p = next.topXPosts.find((x: any) => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'LI') {
          const p = next.topLinkedinPosts.find((x: any) => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'Article') {
          const p = next.articles.find((x: any) => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'Newsletter') {
          const p = next.linkedinNewsletters.find((x: any) => x.id === id); if (p) p.proofImage = base64;
        } else if (type === 'Custom') {
          const p = next.customSlides.find((x: any) => x.id === id); if (p) p.fileData = base64;
        }
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCustomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewSlide({ ...newSlide, fileData: ev.target?.result as string, type: 'file' });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

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
                <input className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-bold text-gray-700" value={metadata.clientName} onChange={e => setMetadata({...metadata, clientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Campaign Name</label>
                <input className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-bold" value={metadata.campaignName} onChange={e => setMetadata({...metadata, campaignName: e.target.value})} />
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
      
      case ReportStep.RESOURCES: return (
          <div className="space-y-10 animate-fadeIn">
            <h2 className="text-4xl font-black text-[#283b82]">External Ecosystem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {['mainDriveFolder', 'top20XDriveLink', 'brandwatchDriveLink', 'visualsDriveLink', 'shortsDriveLink'].map(key => (
                 <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input className="w-full p-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#e64d25] outline-none shadow-sm font-medium" value={(resources as any)[key]} onChange={e => setResources({...resources, [key]: e.target.value})} />
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

      case ReportStep.DATA_UPLOAD:
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
               
               {/* Preview Table */}
               {liDataBuffer && (
                  <div className="mt-8 bg-white p-6 rounded-3xl border shadow-sm">
                     <h4 className="text-xs font-black text-[#283b82] mb-4 uppercase">Detected Data Preview</h4>
                     <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-left text-[10px]">
                           <thead className="bg-gray-50 text-gray-500 sticky top-0">
                              <tr><th>Date</th><th>Snippet</th><th>Imp.</th><th>Eng.</th><th>Link</th></tr>
                           </thead>
                           <tbody>
                              {liDataBuffer.postDetailTable?.map((p: any, i: number) => (
                                 <tr key={i} className="border-b">
                                    <td className="p-2">{p.date}</td>
                                    <td className="p-2 truncate max-w-[150px]">{p.snippet}</td>
                                    <td className="p-2">{p.impressions}</td>
                                    <td className="p-2">{p.engagements}</td>
                                    <td className="p-2 text-blue-500">{p.link ? 'Yes' : 'No'}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}
            </div>
          </div>
        );

      case ReportStep.ASSETS:
        return (
          <div className="space-y-10 animate-fadeIn">
            <h2 className="text-4xl font-black text-[#283b82]">Visual Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4">
                  <h4 className="font-black text-[#283b82]">Graphics & Campaign Assets</h4>
                  <input type="file" multiple onChange={e => handleFileUpload(e, 'graphics')} className="text-xs" />
                  {renderFileList('graphics')}
               </div>
               <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4">
                  <h4 className="font-black text-[#283b82]">Video Collateral Files</h4>
                  <input type="file" multiple onChange={e => handleFileUpload(e, 'collateral')} className="text-xs" />
                  {renderFileList('collateral')}
               </div>
               <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4 col-span-1 md:col-span-2">
                  <h4 className="font-black text-[#283b82]">Newsletter Insertion Proofs</h4>
                  <input type="file" multiple onChange={e => handleFileUpload(e, 'newsletter_inserts')} className="text-xs" />
                  {renderFileList('newsletter_inserts')}
               </div>
            </div>
            <button onClick={runAnalysis} className="w-full py-6 rounded-3xl text-white font-black text-2xl bg-[#e64d25] shadow-2xl transition-transform hover:scale-[1.01]">
              {isAnalyzing ? "Assembling Report..." : "Complete Final Assembly"}
            </button>
          </div>
        );

      case ReportStep.PREVIEW:
        if (!reportData) return null;
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-4xl font-black text-[#283b82]">Review & Customize</h2>
               <div className="flex gap-4">
                  <button onClick={handleCloudSave} disabled={isSaving} className={`px-8 py-3 rounded-xl font-black shadow-xl transition-all text-xs uppercase tracking-widest ${isSaving ? 'bg-gray-200 text-gray-500' : 'bg-white text-[#283b82] border border-[#283b82]'}`}>
                      {saveStatus || (isSaving ? 'Saving...' : 'Save to Cloud')}
                  </button>
                  <button onClick={() => setCurrentStep(ReportStep.FINAL)} className="px-8 py-3 bg-[#e64d25] text-white rounded-xl font-black shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
                      View Live Report →
                  </button>
               </div>
            </div>
            
            {/* Editor Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto">
               {[
                 { id: 'structure', label: '1. Structure & Titles' },
                 { id: 'executive', label: '2. Executive Data' },
                 { id: 'metrics', label: '3. Platform Metrics' },
                 { id: 'content', label: '4. Content Assets' }
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setEditorTab(tab.id as any)}
                   className={`px-6 py-3 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${editorTab === tab.id ? 'bg-[#283b82] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Main Editor Area */}
               <div className="lg:col-span-3">
                 {editorTab === 'structure' && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest border-b pb-2">Presentation Flow & Titles</h3>
                             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {reportData.slideSequence.map((slide, idx) => (
                                   <div key={slide.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${slide.enabled ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent opacity-60'}`}>
                                      <input type="checkbox" checked={slide.enabled} onChange={() => toggleSlide(slide.id)} className="accent-[#e64d25] w-4 h-4 flex-shrink-0" />
                                      <input 
                                        value={slide.label} 
                                        onChange={(e) => updateSlideLabel(slide.id, e.target.value)}
                                        className="flex-grow text-[10px] font-black uppercase text-gray-600 bg-transparent border-b border-transparent focus:border-[#e64d25] outline-none"
                                      />
                                      <div className="flex flex-col gap-1">
                                         <button onClick={() => moveSlide(idx, 'up')} className="text-gray-300 hover:text-[#283b82]">▲</button>
                                         <button onClick={() => moveSlide(idx, 'down')} className="text-gray-300 hover:text-[#283b82]">▼</button>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest border-b pb-2">Add Custom Slide</h3>
                             <input placeholder="Slide Title" className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold" value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} />
                             <textarea placeholder="Slide Content" className="w-full p-3 bg-gray-50 rounded-xl text-xs font-medium h-24" value={newSlide.content} onChange={e => setNewSlide({...newSlide, content: e.target.value})} />
                             <div className="flex gap-2">
                                <input placeholder="Link URL" className="w-1/2 p-3 bg-gray-50 rounded-xl text-xs" value={newSlide.link} onChange={e => setNewSlide({...newSlide, link: e.target.value})} />
                                <input placeholder="Link Text" className="w-1/2 p-3 bg-gray-50 rounded-xl text-xs" value={newSlide.linkText} onChange={e => setNewSlide({...newSlide, linkText: e.target.value})} />
                             </div>
                             <div className="relative">
                                <input type="file" onChange={handleCustomFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="w-full p-3 bg-gray-50 rounded-xl text-xs text-center border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-[#e64d25] hover:text-[#e64d25] transition-colors">
                                   {newSlide.fileData ? 'Image Attached ✓' : '+ Attach Image'}
                                </div>
                             </div>
                             <button onClick={addCustomSlide} disabled={!newSlide.title} className="w-full py-3 bg-[#283b82] text-white rounded-xl font-black text-xs uppercase disabled:opacity-50">Add Slide</button>
                          </div>
                       </div>
                    </div>
                 )}

                 {editorTab === 'executive' && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-8">
                       <div className="space-y-4">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Campaign Summary Narrative</h3>
                          <textarea 
                            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-medium border-2 border-gray-100 focus:border-[#e64d25] outline-none h-32"
                            value={reportData.summaryOfActivities}
                            onChange={(e) => updateField(['summaryOfActivities'], e.target.value)}
                          />
                       </div>
                       
                       <div className="space-y-4">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest flex justify-between items-center">
                            <span>Campaign Activities List</span>
                            <button onClick={addActivity} className="text-[#e64d25] text-[10px]">+ Add Item</button>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {reportData.activitiesList.map((activity, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                   <div className="flex gap-2">
                                      <select 
                                        value={activity.icon}
                                        onChange={(e) => updateActivity(idx, 'icon', e.target.value)}
                                        className="bg-white p-2 rounded-lg text-[10px] font-bold border"
                                      >
                                         <option value="DOCS">DOCS</option>
                                         <option value="SOCIAL">SOCIAL</option>
                                         <option value="GROWTH">GROWTH</option>
                                         <option value="STAR">STAR</option>
                                      </select>
                                      <input 
                                        value={activity.text}
                                        onChange={(e) => updateActivity(idx, 'text', e.target.value)}
                                        className="flex-grow p-2 bg-white rounded-lg text-[10px] font-medium border"
                                        placeholder="Activity description"
                                      />
                                      <button onClick={() => removeActivity(idx)} className="text-red-400 font-bold px-2">×</button>
                                   </div>
                                   <input 
                                     value={activity.link || ''}
                                     onChange={(e) => updateActivity(idx, 'link', e.target.value)}
                                     className="w-full p-2 bg-white rounded-lg text-[10px] text-blue-500 border placeholder:text-gray-300"
                                     placeholder="Optional Internal Link URL"
                                   />
                                </div>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Executive KPI Selection (Displayed on Slide 2)</h3>
                          <div className="flex flex-wrap gap-2">
                             {[
                               { id: 'xReach', label: 'X Reach' }, { id: 'xMentions', label: 'X Mentions' }, { id: 'xEngagement', label: 'X Eng.' },
                               { id: 'liImpressions', label: 'LI Imp.' }, { id: 'liEngagement', label: 'LI Eng.' }, { id: 'liReactions', label: 'LI React.' }, { id: 'liPosts', label: 'LI Posts' }
                             ].map(kpi => (
                                <button 
                                  key={kpi.id} 
                                  onClick={() => toggleKpi(kpi.id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${reportData.executiveKpiSelection.includes(kpi.id) ? 'bg-[#283b82] text-white border-[#283b82]' : 'bg-white text-gray-400 border-gray-200'}`}
                                >
                                   {kpi.label}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {editorTab === 'metrics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#e64d25] uppercase text-xs tracking-widest">X (Twitter) Metrics</h3>
                          <div className="grid grid-cols-2 gap-4">
                             {Object.entries(reportData.xMetrics).map(([key, val]) => (
                                <div key={key} className="space-y-1">
                                   <label className="text-[9px] font-bold text-gray-400 uppercase">{key}</label>
                                   <input 
                                     value={val}
                                     onChange={(e) => updateField(['xMetrics', key], e.target.value)}
                                     className="w-full p-2 bg-gray-50 rounded-lg text-sm font-black text-[#283b82] border-b-2 border-transparent focus:border-[#e64d25] outline-none"
                                   />
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">LinkedIn Metrics</h3>
                          <div className="grid grid-cols-2 gap-4">
                             {Object.entries(reportData.linkedinMetrics).map(([key, val]) => (
                                <div key={key} className="space-y-1">
                                   <label className="text-[9px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                                   <input 
                                     value={val}
                                     onChange={(e) => updateField(['linkedinMetrics', key], e.target.value)}
                                     className="w-full p-2 bg-gray-50 rounded-lg text-sm font-black text-[#283b82] border-b-2 border-transparent focus:border-[#283b82] outline-none"
                                   />
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {editorTab === 'content' && (
                    <div className="space-y-8">
                       {/* Top X Posts */}
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Top X Posts (Slide 4)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {reportData.topXPosts.map((post, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                   <div className="flex gap-2">
                                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden group">
                                         {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[8px] text-gray-400">IMG</div>}
                                         <input type="file" onChange={(e) => e.target.files && assignProofImage(e.target.files[0], 'X', post.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                      </div>
                                      <div className="flex-grow space-y-2">
                                         <input value={post.title} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].title = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] font-bold" placeholder="Title" />
                                         <input value={post.impressions} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].impressions = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px]" placeholder="Impressions" />
                                         <input value={post.link} onChange={(e) => { const n = [...reportData.topXPosts]; n[i].link = e.target.value; setReportData({...reportData, topXPosts: n}); }} className="w-full p-1 bg-white border rounded text-[10px] text-blue-500" placeholder="Link" />
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>

                       {/* Top LinkedIn Posts */}
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Top LinkedIn Posts (Slide 6)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {reportData.topLinkedinPosts.map((post, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                   <div className="flex gap-2">
                                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden group">
                                         {post.proofImage ? <img src={post.proofImage} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[8px] text-gray-400">IMG</div>}
                                         <input type="file" onChange={(e) => e.target.files && assignProofImage(e.target.files[0], 'LI', post.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                      </div>
                                      <div className="flex-grow space-y-2">
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

                       {/* Inventory Edit - Basic Row Editing */}
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">LinkedIn Inventory (Slide 7) - Quick Edit</h3>
                          
                          {/* Column Toggle Section */}
                          <div className="space-y-2 mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Visible Columns</label>
                            <div className="flex flex-wrap gap-2">
                                {['date', 'title', 'impressions', 'engagements', 'reactions', 'clicks', 'reposts', 'link'].map(col => (
                                    <button
                                        key={col}
                                        onClick={() => toggleInventoryColumn(col)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${
                                            reportData.inventoryVisibleColumns.includes(col)
                                            ? 'bg-[#283b82] text-white border-[#283b82]'
                                            : 'bg-white text-gray-400 border-gray-200'
                                        }`}
                                    >
                                        {col}
                                    </button>
                                ))}
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto custom-scrollbar">
                             <table className="w-full text-left text-[10px]">
                                <thead className="bg-gray-50 sticky top-0">
                                   <tr><th>Title</th><th>Imp</th><th>Link</th></tr>
                                </thead>
                                <tbody>
                                   {reportData.allLinkedinPosts.map((post, i) => (
                                      <tr key={i} className="border-b">
                                         <td className="p-1"><input value={post.title} onChange={(e) => { const n = [...reportData.allLinkedinPosts]; n[i].title = e.target.value; setReportData({...reportData, allLinkedinPosts: n}); }} className="w-full bg-transparent border-none focus:bg-gray-50" /></td>
                                         <td className="p-1 w-16"><input value={post.impressions} onChange={(e) => { const n = [...reportData.allLinkedinPosts]; n[i].impressions = e.target.value; setReportData({...reportData, allLinkedinPosts: n}); }} className="w-full bg-transparent border-none focus:bg-gray-50" /></td>
                                         <td className="p-1 w-32"><input value={post.link} onChange={(e) => { const n = [...reportData.allLinkedinPosts]; n[i].link = e.target.value; setReportData({...reportData, allLinkedinPosts: n}); }} className="w-full bg-transparent border-none text-blue-500 focus:bg-gray-50" /></td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>

                       {/* Articles & Newsletters */}
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Website Articles & Newsletters</h3>
                          <div className="space-y-4">
                             {reportData.articles.map((art, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                   <div className="w-10 h-10 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                                      {art.proofImage && <img src={art.proofImage} className="w-full h-full object-cover" />}
                                      <input type="file" onChange={(e) => e.target.files && assignProofImage(e.target.files[0], 'Article', art.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                   </div>
                                   <input value={art.title} onChange={(e) => { const n = [...reportData.articles]; n[i].title = e.target.value; setReportData({...reportData, articles: n}); }} className="flex-grow p-2 border rounded text-[10px]" placeholder="Title" />
                                   <input value={art.link} onChange={(e) => { const n = [...reportData.articles]; n[i].link = e.target.value; setReportData({...reportData, articles: n}); }} className="w-1/3 p-2 border rounded text-[10px] text-blue-500" placeholder="Link" />
                                </div>
                             ))}
                          </div>
                       </div>

                       {/* Videos */}
                       <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-6">
                          <h3 className="font-black text-[#283b82] uppercase text-xs tracking-widest">Videos & Collateral</h3>
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-bold text-gray-400 uppercase">Interviews</h4>
                             {reportData.videoInterviews.map((vid, i) => (
                                <div key={i} className="flex gap-2">
                                   <input value={vid.title} onChange={(e) => { const n = [...reportData.videoInterviews]; n[i].title = e.target.value; setReportData({...reportData, videoInterviews: n}); }} className="flex-grow p-2 border rounded text-[10px]" />
                                   <input value={vid.link} onChange={(e) => { const n = [...reportData.videoInterviews]; n[i].link = e.target.value; setReportData({...reportData, videoInterviews: n}); }} className="w-1/3 p-2 border rounded text-[10px] text-blue-500" />
                                </div>
                             ))}
                             <h4 className="text-[10px] font-bold text-gray-400 uppercase mt-4">Collateral (Add Social Links)</h4>
                             {reportData.videoCollateral.map((vid, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-xl border space-y-2">
                                   <input value={vid.title} onChange={(e) => { const n = [...reportData.videoCollateral]; n[i].title = e.target.value; setReportData({...reportData, videoCollateral: n}); }} className="w-full p-2 bg-white border rounded text-[10px] font-bold" />
                                   <div className="flex gap-2">
                                      <input value={vid.linkedinLink || ''} onChange={(e) => { const n = [...reportData.videoCollateral]; n[i].linkedinLink = e.target.value; setReportData({...reportData, videoCollateral: n}); }} className="w-1/2 p-2 bg-white border rounded text-[10px] text-blue-600" placeholder="LinkedIn Post URL" />
                                      <input value={vid.xLink || ''} onChange={(e) => { const n = [...reportData.videoCollateral]; n[i].xLink = e.target.value; setReportData({...reportData, videoCollateral: n}); }} className="w-1/2 p-2 bg-white border rounded text-[10px] text-orange-500" placeholder="X Post URL" />
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        );

      case ReportStep.FINAL:
        return reportData ? <PresentationView data={reportData} onBackToEdit={() => setCurrentStep(ReportStep.PREVIEW)} /> : null;
      
      default:
        return null;
    }
  };

  // --- RENDER CONDITIONALS ---

  if (viewMode === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="text-xl font-black text-[#e64d25] animate-pulse">LOADING REPORT SYSTEM...</div></div>;
  }

  if (viewMode === 'viewer' && reportData) {
    return <PresentationView data={reportData} />;
  }

  if (viewMode === 'login') {
    return <LoginView />;
  }

  if (viewMode === 'dashboard' && user) {
    return <DashboardView user={user} onNewReport={handleNewReport} onLoadReport={handleLoadReport} />;
  }

  // --- EDITOR VIEW (Original App Functionality) ---
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      <header className="bg-white border-b border-gray-100 px-10 py-8 flex justify-between items-center sticky top-0 z-[60] shadow-sm print:hidden">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewMode('dashboard')}>
          <div className="w-12 h-12 bg-[#e64d25] rounded-2xl flex items-center justify-center text-white font-black text-xl">II</div>
          <h1 className="text-2xl font-black text-[#283b82] tracking-tighter">REPORT <span className="text-[#e64d25]">SYSTEM</span></h1>
        </div>
        {currentStep === ReportStep.PREVIEW ? (
          <div className="flex items-center gap-4">
             {/* Saved for Cloud Button - now handled in renderStepContent */}
          </div>
        ) : (
          currentStep !== ReportStep.FINAL && <StepProgressBar currentStep={currentStep} />
        )}
      </header>
      
      <main className={`flex-grow container mx-auto px-6 py-16 ${currentStep === ReportStep.FINAL ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {renderStepContent()}
      </main>
      
      {currentStep !== ReportStep.FINAL && (
        <footer className="bg-white border-t p-8 sticky bottom-0 z-50 flex justify-between items-center print:hidden">
          <button onClick={handlePrev} disabled={currentStep === ReportStep.BASICS} className="px-10 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors">Back</button>
          <button onClick={handleNext} disabled={currentStep === ReportStep.ASSETS || currentStep === ReportStep.PREVIEW} className="px-12 py-4 bg-[#283b82] text-white font-black rounded-2xl shadow-xl hover:bg-[#1a2b63] transition-all">Continue</button>
        </footer>
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;