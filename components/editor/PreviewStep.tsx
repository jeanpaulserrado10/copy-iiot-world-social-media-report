import React from 'react';
import { ReportData, ReportStep } from '../../types';
import ToolsPanel from './ToolsPanel';
import StructureTab from './tabs/StructureTab';
import ExecutiveTab from './tabs/ExecutiveTab';
import MetricsTab from './tabs/MetricsTab';
import ContentTab from './tabs/ContentTab';

interface PreviewStepProps {
  reportData: ReportData;
  setReportData: (data: ReportData) => void;
  setCurrentStep: (step: ReportStep) => void;
  handleCloudSave: () => void;
  isSaving: boolean;
  saveStatus: string;
  previousReports: any[];
  selectedReportIds: string[];
  setSelectedReportIds: (ids: string[]) => void;
  handleGenerateCumulative: () => void;
  isGeneratingTool: boolean;
  handleImportReportSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  importSlidesList: any[];
  handleImportSlide: (slide: any) => void;
  setEditorTab: (tab: 'structure' | 'executive' | 'metrics' | 'content' | 'tools') => void;
  editorTab: 'structure' | 'executive' | 'metrics' | 'content' | 'tools';
}

const PreviewStep: React.FC<PreviewStepProps> = ({ 
  reportData, setReportData, setCurrentStep, handleCloudSave, isSaving, saveStatus,
  previousReports, selectedReportIds, setSelectedReportIds, handleGenerateCumulative, isGeneratingTool,
  handleImportReportSelect, importSlidesList, handleImportSlide,
  setEditorTab, editorTab
}) => {

  const updateField = (path: string[], value: any) => {
    const next = JSON.parse(JSON.stringify(reportData));
    let current = next;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setReportData(next);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;
    const newSequence = [...reportData.slideSequence];
    const [removed] = newSequence.splice(sourceIndex, 1);
    newSequence.splice(targetIndex, 0, removed);
    setReportData({ ...reportData, slideSequence: newSequence });
  };

  const toggleSlide = (id: string) => {
    const newSequence = reportData.slideSequence.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setReportData({ ...reportData, slideSequence: newSequence });
  };

  const updateSlideLabel = (id: string, label: string) => {
    const newSequence = reportData.slideSequence.map(s => s.id === id ? { ...s, label } : s);
    setReportData({ ...reportData, slideSequence: newSequence });
  };

  const assignProofImage = (file: File, type: 'X' | 'LI', id: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const next = JSON.parse(JSON.stringify(reportData));
      if (type === 'X') {
        const p = next.topXPosts.find((x: any) => x.id === id); if (p) p.proofImage = base64;
      } else if (type === 'LI') {
        let p = next.topLinkedinPosts.find((x: any) => x.id === id);
        if (!p) p = next.linkedinNewsletters.find((x: any) => x.id === id); // Check newsletters too
        if (p) p.proofImage = base64;
      }
      setReportData(next);
    };
    reader.readAsDataURL(file);
  };

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
      
      <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto">
         {[
           { id: 'structure', label: '1. Structure & Slides' },
           { id: 'executive', label: '2. Executive Data' },
           { id: 'metrics', label: '3. Platform Metrics' },
           { id: 'content', label: '4. Content Assets' },
           { id: 'tools', label: '5. Tools & History' }
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
         <div className="lg:col-span-3">
           {editorTab === 'structure' && (
              <StructureTab 
                reportData={reportData} 
                setReportData={setReportData}
                updateSlideLabel={updateSlideLabel}
                toggleSlide={toggleSlide}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
              />
           )}

           {editorTab === 'executive' && (
              <ExecutiveTab 
                reportData={reportData} 
                setReportData={setReportData} 
                updateField={updateField}
              />
           )}

           {editorTab === 'metrics' && (
              <MetricsTab 
                reportData={reportData} 
                updateField={updateField}
              />
           )}

           {editorTab === 'content' && (
              <ContentTab 
                reportData={reportData} 
                setReportData={setReportData} 
                assignProofImage={assignProofImage}
              />
           )}

           {editorTab === 'tools' && (
              <ToolsPanel 
                metadata={reportData.metadata}
                previousReports={previousReports}
                selectedReportIds={selectedReportIds}
                setSelectedReportIds={setSelectedReportIds}
                handleGenerateCumulative={handleGenerateCumulative}
                isGeneratingTool={isGeneratingTool}
                handleImportReportSelect={handleImportReportSelect}
                importSlidesList={importSlidesList}
                handleImportSlide={handleImportSlide}
              />
           )}
         </div>
      </div>
    </div>
  );
};

export default PreviewStep;