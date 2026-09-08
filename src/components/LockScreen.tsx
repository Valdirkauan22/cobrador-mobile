import React, { useEffect, useState } from 'react';
import { Building2, Delete, Fingerprint, LockKeyhole } from 'lucide-react';
import { authenticateDevice, hashPin } from '../utils/native';

interface Props { pinHash: string; biometrics?: boolean; onUnlock: () => void; }

export const LockScreen: React.FC<Props> = ({ pinHash, biometrics, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const unlockBio = async () => { if (await authenticateDevice()) onUnlock(); };
  useEffect(() => { if (biometrics) unlockBio(); }, []);
  const add = async (n: string) => {
    const next = (pin + n).slice(0, 6); setPin(next); setError('');
    if (next.length >= 4 && await hashPin(next) === pinHash) onUnlock();
    else if (next.length === 6) { setError('PIN incorreto'); setTimeout(() => setPin(''), 400); }
  };
  return <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#081d31] to-[#1769aa] text-white flex items-center justify-center app-lock-safe">
    <div className="w-full max-w-xs px-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center"><Building2 className="w-8 h-8" /></div>
      <h1 className="font-black text-xl mt-4">Cobrador Mobile</h1><p className="text-blue-100 text-sm mt-1">Informe seu PIN para continuar</p>
      <div className="h-7 mt-4 flex items-center justify-center gap-2">{[0,1,2,3,4,5].map(i=><span key={i} className={`w-2.5 h-2.5 rounded-full ${i<pin.length?'bg-white':'bg-white/25'}`} />)}</div>
      <p className="text-rose-200 text-xs h-5">{error}</p>
      <div className="grid grid-cols-3 gap-3 mt-2">{['1','2','3','4','5','6','7','8','9'].map(n=><button key={n} onClick={()=>add(n)} className="h-14 rounded-2xl bg-white/10 border border-white/10 text-xl font-bold active:bg-white/25">{n}</button>)}
        <button onClick={unlockBio} disabled={!biometrics} className="h-14 rounded-2xl bg-white/10 flex items-center justify-center disabled:opacity-20"><Fingerprint /></button>
        <button onClick={()=>add('0')} className="h-14 rounded-2xl bg-white/10 text-xl font-bold">0</button>
        <button onClick={()=>setPin(pin.slice(0,-1))} className="h-14 rounded-2xl bg-white/10 flex items-center justify-center"><Delete /></button>
      </div>
      <div className="mt-5 text-blue-100 text-[11px] flex items-center justify-center gap-1.5"><LockKeyhole className="w-3.5 h-3.5"/> Seus dados permanecem protegidos</div>
    </div>
  </div>;
};
