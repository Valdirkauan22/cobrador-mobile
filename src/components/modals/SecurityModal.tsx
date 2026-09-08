import React, { useEffect, useState } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../../types';
import { deviceAuthAvailable, hashPin } from '../../utils/native';
import { ModalWrapper } from './ModalWrapper';

interface Props { isOpen: boolean; config: AppConfig; onClose: () => void; onSave: (cfg: AppConfig) => void; }
export const SecurityModal: React.FC<Props> = ({ isOpen, config, onClose, onSave }) => {
  const [pin, setPin] = useState(''); const [confirm, setConfirm] = useState('');
  const [bio, setBio] = useState(!!config.biometricsEnabled); const [available, setAvailable] = useState(false);
  const [timeout, setTimeoutValue] = useState(config.lockTimeoutMinutes || 5);
  useEffect(()=>{ if(isOpen){ setPin(''); setConfirm(''); setBio(!!config.biometricsEnabled); deviceAuthAvailable().then(setAvailable); }},[isOpen,config]);
  const save = async () => {
    if (pin && (!/^\d{4,6}$/.test(pin) || pin !== confirm)) return alert('Informe e confirme um PIN igual, com 4 a 6 números.');
    onSave({ ...config, pinHash: pin ? await hashPin(pin) : config.pinHash, biometricsEnabled: bio && available, lockTimeoutMinutes: timeout }); onClose();
  };
  const remove = () => { if(confirm('Desativar o bloqueio deste aparelho?')) { onSave({...config,pinHash:'',biometricsEnabled:false}); onClose(); } };
  return <ModalWrapper isOpen={isOpen} onClose={onClose} title="Segurança do aplicativo"><div className="space-y-4">
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex gap-2"><ShieldCheck className="w-5 h-5 shrink-0"/> Proteja valores, contatos e comprovantes com PIN e autenticação do aparelho.</div>
    <div className="grid grid-cols-2 gap-2"><input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder={config.pinHash?'Novo PIN (opcional)':'PIN (4 a 6 números)'} className="border rounded-xl p-3 text-sm"/><input type="password" inputMode="numeric" maxLength={6} value={confirm} onChange={e=>setConfirm(e.target.value.replace(/\D/g,''))} placeholder="Confirmar PIN" className="border rounded-xl p-3 text-sm"/></div>
    <label className={`flex items-center justify-between p-3 border rounded-xl ${available?'':'opacity-50'}`}><span className="flex items-center gap-2 text-sm font-semibold"><Fingerprint className="w-5 h-5"/>Biometria/PIN do aparelho</span><input type="checkbox" checked={bio} disabled={!available||(!config.pinHash&&!pin)} onChange={e=>setBio(e.target.checked)} /></label>
    <label className="block text-xs font-bold text-slate-600">Bloquear após <select value={timeout} onChange={e=>setTimeoutValue(Number(e.target.value))} className="ml-2 border rounded-lg p-2"><option value={1}>1 minuto</option><option value={5}>5 minutos</option><option value={15}>15 minutos</option><option value={30}>30 minutos</option></select></label>
    <button onClick={save} className="w-full bg-[#1769aa] text-white rounded-xl py-3 font-bold">Salvar proteção</button>{config.pinHash&&<button onClick={remove} className="w-full text-rose-700 text-xs font-bold py-2">Desativar bloqueio</button>}
  </div></ModalWrapper>;
};
