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
  const [situacao, setSituacao] = useState('Ativo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setCodigo(item.codigo || '');
      setNome(item.nome || '');
      setTelefone(item.telefone || '');
      setSituacao(item.situacao || 'Ativo');
    } else {
      setCodigo('');
      setNome('');
      setTelefone('');
      setSituacao('Ativo');
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      alert('Informe o nome completo e o WhatsApp do morador.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        linha: item?.linha,
        codigo: codigo.trim(),
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        situacao
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
        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Código do morador
          </label>
          <input
            id="mCode"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: 101 (deixe vazio para gerar automático)"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          />
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
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            WhatsApp (com DDD)
          </label>
          <input
            id="mPhone"
            type="tel"
            required
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Ex: 11987654321"
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
