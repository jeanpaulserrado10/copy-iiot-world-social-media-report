
import React from 'react';

interface AssetsStepProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, section: string) => void;
  deleteFile: (id: string) => void;
  uploadedFiles: any[];
  runAnalysis: () => void;
  isAnalyzing: boolean;
  handleFileNameUpdate: (id: string, name: string) => void;
}

const AssetsStep: React.FC<AssetsStepProps> = ({ handleFileUpload, deleteFile, uploadedFiles, runAnalysis, isAnalyzing, handleFileNameUpdate }) => {
  const renderFileList = (section: string) => {
    const sectionFiles = uploadedFiles.filter(f => f.section === section);
    if (sectionFiles.length === 0) return null;
    return (
      <div className="mt-4 space-y-2 border-t pt-4">
        <h5 className="text-[9px] font-black uppercase text-gray-400 mb-2">Assets (Rename if needed):</h5>
        {sectionFiles.map(file => (
          <div key={file.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:border-iiot-orange/30 gap-2">
            <div className="flex flex-col flex-grow">
              <input 
                value={file.name} 
                onChange={(e) => handleFileNameUpdate(file.id, e.target.value)}
                className="text-[10px] font-bold text-iiot-blue bg-transparent border-b border-transparent focus:border-blue-300 focus:bg-white outline-none p-1 truncate"
                placeholder="Enter Title..."
              />
              <span className="text-[8px] text-gray-400 font-bold uppercase pl-1">{file.mimeType}</span>
            </div>
            <button onClick={() => deleteFile(file.id)} className="w-6 h-6 shrink-0 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">×</button>
          </div>
        ))}
      </div>
    );
  };

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
         {/* Added Newsletter Inserts Section */}
         <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-4 md:col-span-2">
            <h4 className="font-black text-[#283b82]">Newsletter Inserts (Optional)</h4>
            <input type="file" multiple onChange={e => handleFileUpload(e, 'newsletter_inserts')} className="text-xs" />
            {renderFileList('newsletter_inserts')}
         </div>
      </div>
      <button onClick={runAnalysis} className="w-full py-6 rounded-3xl text-white font-black text-2xl bg-[#e64d25] shadow-2xl transition-transform hover:scale-[1.01]">
        {isAnalyzing ? "Assembling Report..." : "Complete Final Assembly"}
      </button>
    </div>
  );
};

export default AssetsStep;
