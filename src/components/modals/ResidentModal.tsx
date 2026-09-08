import React, { useState, useEffect } from 'react';
import { MoradorItem } from '../../types';
import { ModalWrapper } from './ModalWrapper';

interface ResidentModalProps {
  isOpen: boolean;
  item: MoradorItem | null;
  onClose: () => void;
  onSave: (data: {
    linha?: number;
    codigo: string;
    nome: string;
    telefone: string;
    situacao: string;
    unidade?: string;
  }) => Promise<void>;
}

export const ResidentModal: React.FC<ResidentModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave
}) => {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [unidade, setUnidade] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setCodigo(item.codigo || '');
      setNome(item.nome || '');
      setTelefone(item.telefone || '');
      setUnidade(item.unidade || '');
      setSituacao(item.situacao || 'Ativo');
    } else {
      setCodigo('');
      setNome('');
      setTelefone('');
      setUnidade('');
      setSituacao('Ativo');
    }
  }, [item, isOpen]);

  const cleanDigits = telefone.replace(/\D/g, '');
  const isValidPhone = cleanDigits.length >= 10 && cleanDigits.length <= 13;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      alert('Informe o nome completo e o WhatsApp do morador.');
      return;
    }
    if (!isValidPhone) {
      if (!confirm('O número informado não parece ter DDD ou formato celular padrão. Deseja salvar mesmo assim?')) {
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await onSave({
        linha: item?.linha,
        codigo: codigo.trim(),
        nome: nome.trim(),
        telefone: cleanDigits,
        situacao,
        unidade: unidade.trim()
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar morador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Editar morador' : 'Novo morador'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
              Código do morador
            </label>
            <input
              id="mCode"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: 101"
              className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
              Unidade / Casa / Lote
            </label>
            <input
              id="mUnit"
              type="text"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder="Ex: Casa 12, Lote 04"
              className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Nome completo
          </label>
          <input
            id="mName"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João da Silva"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider">
              WhatsApp (com DDD)
            </label>
            {telefone && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isValidPhone
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isValidPhone ? '✓ Número válido' : '⚠ Incompleto (use DDD)'}
              </span>
            )}
          </div>
          <input
            id="mPhone"
            type="tel"
            required
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Ex: DDD + número do celular"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Situação
          </label>
          <select
            id="mStatus"
            value={situacao}
            onChange={(e) => setSituacao(e.target.value)}
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3.5 px-4 rounded-xl font-bold tracking-wide uppercase shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Salvando...' : 'SALVAR'}
        </button>
      </form>
    </ModalWrapper>
  );
};
