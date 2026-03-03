
import React, { useState, useEffect } from 'react';
import { FirebaseService, ReportMetadata } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';
import { Icon } from './Icon';

interface DashboardViewProps { 
  onNewReport: () => void; 
  onLoadReport: (id: string) => void;
  user: any; 
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNewReport, onLoadReport, user }) => {
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { logout } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch ALL reports and categories (admin view requested by user)
      const [fetchedReports, fetchedCategories] = await Promise.all([
        FirebaseService.getUserReports(), 
        FirebaseService.getCategories()
      ]);
      console.log("Dashboard fetched reports:", fetchedReports);
      console.log("Dashboard fetched categories:", fetchedCategories);
      // Sorting is now handled in the query
      setReports(fetchedReports);
      setCategories(fetchedCategories);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      let msg = "Failed to load data.";
      if (error.code === 'permission-denied') {
          msg = "Permission denied. Your Firebase 'Test Mode' rules may have expired.\n\nGo to Firebase Console > Firestore Database > Rules and paste this:\n\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}";
      } else if (error.code === 'failed-precondition') {
          msg = "Database index missing. Please check console for link to create it.";
      }
      alert(`${msg}\n\nCheck console for details.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await FirebaseService.saveCategory(user.uid, newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
    fetchData();
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this category? Reports will become uncategorized.")) return;
    try {
      await FirebaseService.deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete category. Check permissions.");
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    await FirebaseService.deleteReport(id);
    fetchData();
  };
  
  const handleDuplicateReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Duplicate this report?")) return;
    setLoading(true);
    try {
        await FirebaseService.duplicateReport(id, user.uid);
        fetchData();
    } catch (error) {
        console.error(error);
        alert("Failed to duplicate report.");
        setLoading(false);
    }
  };

  const handleCreateCaseStudy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Create an anonymized Case Study from this report?\n\nThis will create a NEW report where Client Name is replaced with 'Confidential Client' and links are removed.")) return;
    setLoading(true);
    try {
        await FirebaseService.createCaseStudy(id, user.uid);
        fetchData();
    } catch (error) {
        console.error(error);
        alert("Failed to create case study.");
        setLoading(false);
    }
  };

  const handleMoveReport = async (e: React.ChangeEvent<HTMLSelectElement>, reportId: string) => {
    e.stopPropagation();
    const catId = e.target.value || null;
    await FirebaseService.updateReportCategory(reportId, catId);
    fetchData();
  };

  const renderReportCard = (report: ReportMetadata) => (
    <div key={report.id} onClick={() => onLoadReport(report.id)} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer min-h-[200px] group relative">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <select 
            className="text-[10px] bg-gray-100 p-1 rounded font-bold outline-none border-none"
            value={report.categoryId || ''}
            onClick={e => e.stopPropagation()}
            onChange={e => handleMoveReport(e, report.id)}
         >
            <option value="">Move to...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
         <button onClick={(e) => handleCreateCaseStudy(e, report.id)} className="text-orange-500 hover:text-orange-700 bg-orange-50 p-1 rounded" title="Create Case Study">
            <Icon type="CASE_STUDY" className="w-4 h-4" />
         </button>
         <button onClick={(e) => handleDuplicateReport(e, report.id)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded" title="Duplicate">
            <Icon type="COPY" className="w-4 h-4" />
         </button>
         <button onClick={(e) => handleDeleteReport(e, report.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded" title="Delete">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
         </button>
      </div>
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
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-8">
       <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#e64d25] rounded-xl flex items-center justify-center text-white font-black text-lg">II</div>
                <h1 className="text-2xl font-black text-[#283b82]">DASHBOARD</h1>
                <button onClick={() => { alert(`User ID: ${user.uid}\nReports: ${reports.length}\nCategories: ${categories.length}`); }} className="ml-4 px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-black uppercase rounded shadow-sm hover:bg-gray-300 transition-all">Debug</button>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase hidden md:inline">{user.email}</span>
                <button onClick={() => logout()} className="text-xs font-black text-[#e64d25] underline">Logout</button>
             </div>
          </div>

          <div className="flex justify-between items-center">
             <h2 className="text-lg font-black text-[#283b82] uppercase tracking-widest">Your Collections</h2>
             <button onClick={() => setIsAddingCategory(true)} className="px-4 py-2 bg-[#283b82] text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:bg-[#1a2b63] transition-all">+ New Collection</button>
          </div>

          {isAddingCategory && (
             <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 animate-fadeIn">
                <input 
                   autoFocus
                   className="flex-grow p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-iiot-orange font-bold text-sm"
                   placeholder="e.g. Client Name or Project Type"
                   value={newCategoryName}
                   onChange={e => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="px-6 py-3 bg-[#e64d25] text-white font-black text-xs uppercase rounded-xl">Create</button>
                <button type="button" onClick={() => setIsAddingCategory(false)} className="px-6 py-3 text-gray-400 font-black text-xs uppercase">Cancel</button>
             </form>
          )}

          <div className="space-y-16">
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <button onClick={onNewReport} className="bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-[#e64d25] hover:text-[#e64d25] transition-all group min-h-[200px]">
                   <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-orange-50 flex items-center justify-center text-2xl font-black">+</div>
                   <span className="font-black uppercase text-xs tracking-widest">Create New Report</span>
                </button>
             </div>

             {loading ? (
                <div className="flex items-center justify-center text-gray-300 font-bold uppercase text-xs py-20">Loading workspace...</div>
             ) : (
                <>
                   {/* Render Categories */}
                   {categories.map(cat => (
                      <div key={cat.id} className="space-y-6">
                         <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-black text-[#283b82] uppercase tracking-widest flex items-center gap-2">
                               <Icon type="DOCS" className="w-4 h-4 text-[#e64d25]" /> {cat.name}
                            </h3>
                            <button onClick={(e) => handleDeleteCategory(e, cat.id)} className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase">Delete Collection</button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {reports.filter(r => r.categoryId === cat.id).map(report => renderReportCard(report))}
                            {reports.filter(r => r.categoryId === cat.id).length === 0 && (
                               <div className="col-span-full py-10 border-2 border-dashed rounded-[2rem] text-center text-gray-300 text-[10px] font-bold uppercase">No reports in this collection</div>
                            )}
                         </div>
                      </div>
                   ))}

                   {/* Render Uncategorized */}
                   <div className="space-y-6">
                      <div className="border-b pb-2">
                         <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Uncategorized Reports</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                         {reports.filter(r => !r.categoryId).map(report => renderReportCard(report))}
                         {reports.filter(r => !r.categoryId).length === 0 && (
                             <div className="col-span-full py-10 text-center text-gray-300 text-[10px] font-bold uppercase italic">All reports are organized</div>
                         )}
                      </div>
                   </div>
                </>
             )}
          </div>
       </div>
    </div>
  );
};

export default DashboardView;
