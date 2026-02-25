import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  ChevronRight,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import {
  Consultation,
  getConsultations,
  deleteConsultation,
  updateConsultation,
  clearConsultations,
} from "../lib/storage";
import { Patient } from "./Registration";

interface HistoryProps {
  onBack: () => void;
  onSelect: (consultation: Consultation) => void;
  onLogout: () => void;
}

export function History({ onBack, onSelect, onLogout }: HistoryProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const [editForm, setEditForm] = useState<Patient | null>(null);
  const [consultationToDelete, setConsultationToDelete] = useState<
    string | null
  >(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setConsultations(getConsultations());
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConsultationToDelete(id);
  };

  const confirmDelete = () => {
    if (consultationToDelete) {
      deleteConsultation(consultationToDelete);
      setConsultations(getConsultations());
      setConsultationToDelete(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, consultation: Consultation) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingConsultation(consultation);
    setEditForm(consultation.patient);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConsultation && editForm) {
      const updated = { ...editingConsultation, patient: editForm };
      updateConsultation(updated.id, updated);
      setConsultations(getConsultations());
      setEditingConsultation(null);
      setEditForm(null);
    }
  };

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    clearConsultations();
    setConsultations([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <h1 className="ml-6 text-xl font-bold text-slate-900">
              Histórico de Consultas
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {consultations.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Limpar Histórico
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        {consultations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-slate-900">
              Nenhuma consulta encontrada
            </h2>
            <p className="text-slate-500 mt-2">
              Os diagnósticos salvos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {consultations.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={c.image}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      {c.patient.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(c.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span>•</span>
                      <span>{c.diagnosis.treatments.length} tratamentos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleEdit(e, c)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, c.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-slate-400 ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingConsultation && editForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Editar Dados do Paciente
              </h3>
              <button
                onClick={() => setEditingConsultation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.cpf}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cpf: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Idade
                  </label>
                  <input
                    required
                    type="number"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm({ ...editForm, age: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <input
                    required
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Endereço
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingConsultation(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {consultationToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Excluir Consulta
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja excluir esta consulta? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConsultationToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Limpar Histórico
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja limpar todo o histórico? Todas as consultas
              serão apagadas permanentemente.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
