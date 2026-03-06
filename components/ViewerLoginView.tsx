
import React, { useState } from 'react';
import { Icon } from './Icon';

interface ViewerLoginViewProps {
  viewerId: string;
  viewerPassword: string;
  onAuthenticated: () => void;
  clientName: string;
}

const ViewerLoginView: React.FC<ViewerLoginViewProps> = ({ viewerId, viewerPassword, onAuthenticated, clientName }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === viewerId && password === viewerPassword) {
      onAuthenticated();
    } else {
      setError('Invalid ID or Password. Please check with your account manager.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12 space-y-8 animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#e64d25] rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-xl shadow-orange-100">II</div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#283b82] uppercase tracking-tighter">Protected Report</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Access restricted for {clientName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Viewer ID</label>
            <div className="relative">
              <Icon type="USER" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                autoFocus
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#e64d25] font-bold text-sm transition-all"
                placeholder="Enter your ID"
                value={id}
                onChange={e => setId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Icon type="LOCK" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                type="password"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#e64d25] font-bold text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100">
              {error}
            </div>
          )}

          <button type="submit" className="w-full py-5 bg-[#283b82] text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-[#1a2b63] hover:-translate-y-0.5 transition-all uppercase tracking-widest text-xs">
            Unlock Report
          </button>
        </form>

        <div className="pt-8 border-t border-gray-50 text-center">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Powered by IIOT Impact Report System</p>
        </div>
      </div>
    </div>
  );
};

export default ViewerLoginView;
