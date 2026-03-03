
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { CampaignMetadata, ResourceLinks, ReportData, ReportStep, CustomSlide, SlideConfig } from './types';
import { GeminiService } from './services/geminiService';
import { PersistenceService } from './services/persistenceService';
import { FirebaseService, ReportMetadata } from './services/firebaseService';
import StepProgressBar from './components/StepProgressBar';
import PresentationView from './components/PresentationView';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import BasicsStep from './components/editor/BasicsStep';
import ResourcesStep from './components/editor/ResourcesStep';
import DataUploadStep from './components/editor/DataUploadStep';
import AssetsStep from './components/editor/AssetsStep';
import PreviewStep from './components/editor/PreviewStep';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useReportGeneration } from './hooks/useReportGeneration';

interface UploadedFile {
  id: string;
  name: string;
  data: string;
  mimeType: string;
  section: string;
  isText: boolean;
}

const initialMetadata: CampaignMetadata = {
  clientName: '', campaignName: '', hashtag: [''], linkedinMention: [''], startDate: '', endDate: ''
};

const initialResources: ResourceLinks = {
  mainDriveFolder: '', top20XDriveLink: '', visualsDriveLink: '', shortsDriveLink: '',
  brandwatchDriveLink: '', youtubeLinks: [{ id: '1', url: '', title: '' }],
  articleLinks: [{ id: '1', url: '', title: '', caption: '' }], additionalMedia: ''
};

const MainApp = () => {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'loading' | 'login' | 'dashboard' | 'editor' | 'viewer' | 'error'>('loading');
  const [currentStep, setCurrentStep] = useState<ReportStep>(ReportStep.BASICS);
  const [metadata, setMetadata] = useState<CampaignMetadata>(initialMetadata);
  const [resources, setResources] = useState<ResourceLinks>(initialResources);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [editorTab, setEditorTab] = useState<'structure' | 'executive' | 'metrics' | 'content' | 'tools'>('structure');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [previousReports, setPreviousReports] = useState<ReportMetadata[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [isGeneratingTool, setIsGeneratingTool] = useState(false);
  const [importReportId, setImportReportId] = useState<string>('');
  const [importSlidesList, setImportSlidesList] = useState<any[]>([]);

  const gemini = new GeminiService();
  
  // Use new hook
  const { 
    isAnalyzing, isLIAnalyzing, isXAnalyzing,
    liDataBuffer, xDataBuffer, setLiDataBuffer, setXDataBuffer,
    generateLIMetrics, generateXMetrics, runAnalysis
  } = useReportGeneration({ 
    gemini, setReportData, setCurrentStep, uploadedFiles, metadata, resources 
  });

  useEffect(() => {
    const init = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('reportId');
        if (reportId) {
          setViewMode('loading');
          const data = await FirebaseService.getReport(reportId);
          if (data) {
            setReportData(data);
            setCurrentReportId(reportId);
            setViewMode('viewer');
          } else {
            alert("Report not found.");
            setViewMode('login');
          }
        } else if (!authLoading) {
          setViewMode(user ? 'dashboard' : 'login');
        }
      } catch (error: any) {
        console.error("Initialization error:", error);
        if (error.code === 'permission-denied') {
            setErrorMessage("Access Denied: You do not have permission to view this report. Please ensure Firebase Security Rules allow public read access.");
        } else {
            setErrorMessage(`Error loading report: ${error.message}`);
        }
        setViewMode('error');
      }
    };
    init();
  }, [user, authLoading]);

  useEffect(() => {
    if (editorTab === 'tools' && user && reportData) {
        // Fetch ALL reports for tools (Accumulator) so we can aggregate across all users/test accounts
        FirebaseService.getUserReports().then(reports => {
            // Filter by the current report's category for the Accumulator
            const relevant = reports.filter(r => 
                r.categoryId === reportData.categoryId && r.id !== currentReportId
            );
            setPreviousReports(relevant);
        }).catch(err => {
            console.error("Failed to fetch previous reports for tools:", err);
            if (err.code === 'permission-denied') {
                alert("Permission denied fetching reports. Your Firebase rules may have expired. Check Dashboard for fix instructions.");
            }
        });
    }
  }, [editorTab, user, reportData?.categoryId, currentReportId]);

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
      const url = `${window.location.origin}${window.location.pathname}?reportId=${id}`;
      try {
        await navigator.clipboard.writeText(url);
        setSaveStatus('Link Copied!');
      } catch (e) {
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

  const parseMetric = (val: string | number | undefined, isRate = false) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      
      let str = val.toString().trim();
      
      // Handle K/M/B suffixes common in social reports
      let mult = 1;
      const upper = str.toUpperCase();
      if (upper.endsWith('K')) { mult = 1000; str = str.slice(0, -1); }
      else if (upper.endsWith('M')) { mult = 1000000; str = str.slice(0, -1); }
      else if (upper.endsWith('B')) { mult = 1000000000; str = str.slice(0, -1); }
      
      // Clean up common chars
      str = str.replace(/%/g, '').replace(/\s/g, '');

      if (!isRate) {
          // INTEGER METRICS (Impressions, Reach, etc.)
          // Remove ALL dots and commas to handle "2.600.000" or "2,600,000" safely as "2600000"
          str = str.replace(/[.,]/g, '');
      } else {
          // RATE METRICS (Percentage) - Preserves decimals
          // Remove commas (thousand separators in standard JS)
          str = str.replace(/,/g, '');
          // If multiple dots exist (unlikely for rate but possible if mislabeled), remove them
          if ((str.match(/\./g) || []).length > 1) {
             str = str.replace(/\./g, '');
          }
      }
      
      return (parseFloat(str) || 0) * mult;
  };
  
  const formatMetric = (val: number) => val.toLocaleString(undefined, { maximumFractionDigits: 1 });

  const handleGenerateCumulative = async () => {
    if (!selectedReportIds.length || !reportData) return;
    setIsGeneratingTool(true);
    try {
        // 1. Fetch full data for all selected past reports
        const pastReportsData = await Promise.all(selectedReportIds.map(id => FirebaseService.getReport(id)));
        const validPastReports = pastReportsData.filter(r => r !== null) as ReportData[];
        
        // Combine current report into the list for processing
        const allReports = [...validPastReports, reportData];

        // 2. Define Groups
        const liMetrics = [
            { id: 'liImp', label: 'LI Impressions', path: ['linkedinMetrics', 'impressions'], isRate: false },
            { id: 'liEng', label: 'LI Engagement', path: ['linkedinMetrics', 'engagement'], isRate: false },
            { id: 'liClicks', label: 'LI Clicks', path: ['linkedinMetrics', 'totalClicks'], isRate: false },
            { id: 'liReact', label: 'LI Reactions', path: ['linkedinMetrics', 'totalReactions'], isRate: false },
            { id: 'liViews', label: 'LI Views', path: ['linkedinMetrics', 'views'], isRate: false },
            { id: 'liReposts', label: 'LI Reposts', path: ['linkedinMetrics', 'totalReposts'], isRate: false },
            { id: 'liComments', label: 'LI Comments', path: ['linkedinMetrics', 'totalComments'], isRate: false },
            { id: 'liPosts', label: 'LI Total Posts', path: ['linkedinMetrics', 'totalPosts'], isRate: false },
        ];

        const xMetrics = [
            { id: 'xReach', label: 'X Total Reach', path: ['xMetrics', 'reach'], isRate: false },
            { id: 'xMentions', label: 'X Mentions', path: ['xMetrics', 'mentions'], isRate: false },
            { id: 'xImp', label: 'X Impressions', path: ['xMetrics', 'impressions'], isRate: false },
            { id: 'xEng', label: 'X Engagement', path: ['xMetrics', 'engagement'], isRate: false },
            { id: 'xRate', label: 'X Engagement Rate', path: ['xMetrics', 'rate'], isRate: true },
        ];

        // 3. Find Unique Custom Metrics
        const customMetricLabels = new Set<string>();
        allReports.forEach(r => {
            r.customExecutiveMetrics?.forEach(cm => {
                if (cm.label) customMetricLabels.add(cm.label.trim());
            });
        });

        // 4. Build Table Headers
        const reportHeaders = validPastReports.map(r => r.metadata.campaignName || 'Past Report');
        const headers = ['Metric', ...reportHeaders, reportData.metadata.campaignName || 'Current', 'TOTAL'];

        // Helper
        const getVal = (r: ReportData, pathOrLabel: string[], isCustom: boolean, isRate: boolean) => {
            if (isCustom) {
                const found = r.customExecutiveMetrics?.find(cm => cm.label.trim().toLowerCase() === pathOrLabel[0].toLowerCase());
                return parseMetric(found?.value, isRate);
            } else {
                // @ts-ignore
                const val = r[pathOrLabel[0]]?.[pathOrLabel[1]];
                return parseMetric(val, isRate);
            }
        };

        const getRawVal = (r: ReportData, path: string[]) => {
            // @ts-ignore
            return r[path[0]]?.[path[1]] || '0%';
        };

        const buildRow = (m: any, isCustom = false) => {
             const values: (string|number)[] = [];
             const label = isCustom ? m : m.label;
             const path = isCustom ? [m] : m.path;
             const isRate = isCustom ? false : m.isRate;

             // Past Reports
             validPastReports.forEach(r => {
                if (isRate) values.push(getRawVal(r, path));
                else values.push(getVal(r, path, isCustom, isRate));
             });

             // Current
             if (isRate) values.push(getRawVal(reportData, path));
             else values.push(getVal(reportData, path, isCustom, isRate));

             // Total
             let totalStr = '';
             if (isRate) {
                totalStr = '';
             } else {
                const sum = (values as number[]).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
                totalStr = formatMetric(sum);
             }

             const displayValues = values.map(v => typeof v === 'number' ? formatMetric(v) : v);
             return { label, values: [...displayValues, totalStr], isHeader: false };
        };

        const rows: { label: string; values: string[]; isHeader?: boolean }[] = [];
        const emptyVals = new Array(headers.length - 1).fill('');

        // LinkedIn Section
        rows.push({ label: 'LINKEDIN METRICS', values: emptyVals, isHeader: true });
        liMetrics.forEach(m => rows.push(buildRow(m)));

        // X Section
        rows.push({ label: 'X (TWITTER) METRICS', values: emptyVals, isHeader: true });
        xMetrics.forEach(m => rows.push(buildRow(m)));

        // Custom Section
        if (customMetricLabels.size > 0) {
           rows.push({ label: 'ADDITIONAL METRICS', values: emptyVals, isHeader: true });
           Array.from(customMetricLabels).forEach(label => rows.push(buildRow(label, true)));
        }

        // 6. Create Slide
        const newSlide: CustomSlide = {
            id: `cumulative_${Date.now()}`,
            title: 'Campaign Cumulative Data',
            subtitle: 'Performance To Date & Comparison',
            content: `Aggregated performance across ${validPastReports.length} previous campaign(s) and the current active campaign.`,
            type: 'text',
            template: 'comparison',
            comparisonData: {
                headers: headers,
                rows: rows
            }
        };

        const newConfig: SlideConfig = { id: newSlide.id, label: 'Comparison: Cumulative Data', enabled: true };
        const newSequence = [...reportData.slideSequence];
        const insertIdx = newSequence.findIndex(s => s.id === 'thank_you');
        if (insertIdx >= 0) newSequence.splice(insertIdx, 0, newConfig);
        else newSequence.push(newConfig);
        
        setReportData({ ...reportData, customSlides: [...reportData.customSlides, newSlide], slideSequence: newSequence });
        // Switch to structure tab so user can see/edit the table immediately
        setEditorTab('structure');
        alert("Cumulative Slide Added! Switched to 'Structure' tab to edit.");

    } catch (e) {
        console.error(e);
        alert("Error generating cumulative data.");
    } finally {
        setIsGeneratingTool(false);
    }
  };

  const handleImportReportSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setImportReportId(id);
      if (id) {
          const r = await FirebaseService.getReport(id);
          if (r) {
             const slides = r.slideSequence.map(seq => {
                 const custom = r.customSlides?.find(c => c.id === seq.id);
                 return { id: seq.id, label: seq.label, originalData: custom, isStandard: !custom };
             });
             setImportSlidesList(slides);
          }
      }
  };

  const handleImportSlide = (slideItem: any) => {
      if (!reportData) return;
      const addToReport = (newSlide: CustomSlide, label: string) => {
          const newConfig = { id: newSlide.id, label: label, enabled: true };
          const newSequence = [...reportData.slideSequence];
          const insertIdx = newSequence.findIndex(s => s.id === 'thank_you');
          if (insertIdx >= 0) newSequence.splice(insertIdx, 0, newConfig);
          else newSequence.push(newConfig);
          setReportData({ ...reportData, customSlides: [...reportData.customSlides, newSlide], slideSequence: newSequence });
      };
      if (!slideItem.isStandard && slideItem.originalData) {
          const newId = `${slideItem.originalData.id}_imported_${Date.now()}`;
          const newSlide = { ...slideItem.originalData, id: newId, title: `${slideItem.originalData.title} (Imported)` };
          addToReport(newSlide, `${slideItem.label} (Imported)`);
          alert("Slide Imported!");
      } else if (slideItem.id === 'executive') {
         FirebaseService.getReport(importReportId).then(r => {
             if (!r) return;
             
             const getKpiData = (id: string) => {
                 switch(id) {
                    case 'xReach': return { label: 'X Total Reach', value: r.xMetrics.reach, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
                    case 'xMentions': return { label: 'X Mentions', value: r.xMetrics.mentions, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
                    case 'xEngagement': return { label: 'X Engagement', value: r.xMetrics.engagement, color: 'bg-[#e64d25]', icon: 'TWITTER', group: 'X' };
                    case 'liImpressions': return { label: 'LI Impressions', value: r.linkedinMetrics.impressions, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
                    case 'liEngagement': return { label: 'LI Engagement', value: r.linkedinMetrics.engagement, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
                    case 'liReactions': return { label: 'LI Reactions', value: r.linkedinMetrics.totalReactions, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
                    case 'liPosts': return { label: 'LI Total Posts', value: r.linkedinMetrics.totalPosts, color: 'bg-[#283b82]', icon: 'LINKEDIN', group: 'LI' };
                    default: return null;
                 }
             };

             const metricsData = r.executiveKpiSelection
                .map(id => getKpiData(id))
                .filter(k => k !== null);

             const buttons = [];
             if (r.resources.mainDriveFolder) {
                 buttons.push({ text: 'Full Social Media Report Folder', link: r.resources.mainDriveFolder });
             }

             const newSlide: CustomSlide = {
                 id: `imported_exec_${Date.now()}`,
                 title: `Exec Summary: ${r.metadata.campaignName}`,
                 subtitle: 'Campaign Activities',
                 content: r.summaryOfActivities,
                 type: 'text',
                 template: 'executive-snapshot',
                 bullets: r.activitiesList.map(a => ({ text: a.text, icon: a.icon, link: a.link })),
                 metricsData: metricsData as any,
                 buttons: buttons
             };
             addToReport(newSlide, `Imp: ${r.metadata.campaignName} Exec`);
             alert("Executive Slide Imported (with Metrics)!");
         });
      } else {
          alert("Dynamic standard slides cannot be imported directly. Only Custom slides or Text Summaries.");
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLSelectElement>, section: string) => {
    // Note: handleFileUpload now takes HTMLInputElement in DataUploadStep and AssetsStep
    // but the actual input element is passed. This type change in signature is just for reference.
  };

  const handleFileUploadActual = async (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const files = e.target.files;
    if (!files) return;
    const fileList = Array.from(files);
    const newFiles = await Promise.all(fileList.map(async (file: File) => {
      const isSpreadsheet = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.csv');
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (isSpreadsheet) {
             const data = event.target?.result;
             const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
             const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
             resolve({ id: Math.random().toString(36).substr(2, 9), name: file.name, data: csvData, mimeType: 'text/csv', section, isText: true });
          } else {
             const base64 = (event.target?.result as string).split(',')[1];
             resolve({ id: Math.random().toString(36).substr(2, 9), name: file.name, data: base64, mimeType: file.type, section, isText: false });
          }
        };
        isSpreadsheet ? reader.readAsArrayBuffer(file) : reader.readAsDataURL(file);
      });
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileNameUpdate = (id: string, newName: string) => {
    setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const deleteFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const renderStepContent = () => {
    switch (currentStep) {
      case ReportStep.BASICS: return <BasicsStep metadata={metadata} setMetadata={setMetadata} />;
      case ReportStep.RESOURCES: return <ResourcesStep resources={resources} setResources={setResources} />;
      case ReportStep.DATA_UPLOAD: return <DataUploadStep uploadedFiles={uploadedFiles} handleFileUpload={handleFileUploadActual} deleteFile={deleteFile} generateLIMetrics={generateLIMetrics} generateXMetrics={generateXMetrics} isLIAnalyzing={isLIAnalyzing} isXAnalyzing={isXAnalyzing} liDataBuffer={liDataBuffer} xDataBuffer={xDataBuffer} setLiDataBuffer={setLiDataBuffer} setXDataBuffer={setXDataBuffer} />;
      case ReportStep.ASSETS: return <AssetsStep handleFileUpload={handleFileUploadActual} deleteFile={deleteFile} uploadedFiles={uploadedFiles} runAnalysis={() => runAnalysis(ReportStep.PREVIEW, reportData)} isAnalyzing={isAnalyzing} handleFileNameUpdate={handleFileNameUpdate} />;
      case ReportStep.PREVIEW: if (!reportData) return null; return <PreviewStep reportData={reportData} setReportData={setReportData} setCurrentStep={setCurrentStep} handleCloudSave={handleCloudSave} isSaving={isSaving} saveStatus={saveStatus} previousReports={previousReports} selectedReportIds={selectedReportIds} setSelectedReportIds={setSelectedReportIds} handleGenerateCumulative={handleGenerateCumulative} isGeneratingTool={isGeneratingTool} handleImportReportSelect={handleImportReportSelect} importSlidesList={importSlidesList} handleImportSlide={handleImportSlide} setEditorTab={setEditorTab} editorTab={editorTab} />;
      case ReportStep.FINAL: return reportData ? <PresentationView data={reportData} onBackToEdit={() => setCurrentStep(ReportStep.PREVIEW)} reportId={currentReportId || undefined} /> : null;
      default: return null;
    }
  };

  if (viewMode === 'loading') return <div className="min-h-screen flex items-center justify-center bg-white"><div className="text-xl font-black text-[#e64d25] animate-pulse">LOADING REPORT SYSTEM...</div></div>;
  if (viewMode === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-2xl w-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl font-black">!</div>
        <h2 className="text-2xl font-black text-red-800">Unable to Load Report</h2>
        <p className="text-red-600 font-medium">{errorMessage}</p>
        
        {errorMessage.includes("Access Denied") && (
            <div className="text-left bg-white p-6 rounded-xl border border-red-100 text-sm space-y-4">
                <p className="font-bold text-gray-700">How to fix this:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">Firebase Console</a>.</li>
                    <li>Navigate to <strong>Firestore Database</strong> &gt; <strong>Rules</strong>.</li>
                    <li>Paste the following rules to allow public read access:</li>
                </ol>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}</pre>
                </div>
                <p className="text-gray-600">Also check <strong>Storage</strong> &gt; <strong>Rules</strong>:</p>
                 <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}</pre>
                </div>
            </div>
        )}

        <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors uppercase tracking-widest text-xs">Go to Dashboard</button>
      </div>
    </div>
  );
  if (viewMode === 'viewer' && reportData) return <PresentationView data={reportData} reportId={currentReportId || undefined} />;
  if (viewMode === 'login') return <LoginView />;
  if (viewMode === 'dashboard' && user) return <DashboardView user={user} onNewReport={handleNewReport} onLoadReport={handleLoadReport} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      <header className="bg-white border-b border-gray-100 px-10 py-8 flex justify-between items-center sticky top-0 z-[60] shadow-sm print:hidden">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewMode('dashboard')}>
          <div className="w-12 h-12 bg-[#e64d25] rounded-2xl flex items-center justify-center text-white font-black text-xl">II</div>
          <h1 className="text-2xl font-black text-[#283b82] tracking-tighter">REPORT <span className="text-[#e64d25]">SYSTEM</span></h1>
        </div>
        {currentStep !== ReportStep.FINAL && <StepProgressBar currentStep={currentStep} />}
      </header>
      <main className={`flex-grow container mx-auto px-6 py-16 ${currentStep === ReportStep.FINAL ? 'max-w-7xl' : 'max-w-4xl'}`}>{renderStepContent()}</main>
      {currentStep !== ReportStep.FINAL && (
        <footer className="bg-white border-t p-8 sticky bottom-0 z-50 flex justify-between items-center print:hidden">
          <button onClick={() => { const steps = Object.values(ReportStep); const idx = steps.indexOf(currentStep); if (idx > 0) setCurrentStep(steps[idx - 1]); }} disabled={currentStep === ReportStep.BASICS} className="px-10 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors">Back</button>
          <button onClick={() => { const steps = Object.values(ReportStep); const idx = steps.indexOf(currentStep); if (idx < steps.length - 1) setCurrentStep(steps[idx + 1]); }} disabled={currentStep === ReportStep.ASSETS || currentStep === ReportStep.PREVIEW} className="px-12 py-4 bg-[#283b82] text-white font-black rounded-2xl shadow-xl hover:bg-[#1a2b63] transition-all">Continue</button>
        </footer>
      )}
    </div>
  );
};

const App = () => (<AuthProvider><MainApp /></AuthProvider>);
export default App;
