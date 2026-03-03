import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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

export default LoginView;