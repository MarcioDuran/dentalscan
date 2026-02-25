import React, { useState } from "react";
import {
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  ArrowRight,
} from "lucide-react";

export interface Patient {
  name: string;
  address: string;
  cpf: string;
  age: string;
  phone: string;
}

interface RegistrationProps {
  onRegister: (patient: Patient) => void;
  onViewHistory: () => void;
  onLogout: () => void;
}

export function Registration({
  onRegister,
  onViewHistory,
  onLogout,
}: RegistrationProps) {
  const [patient, setPatient] = useState<Patient>({
    name: "",
    address: "",
    cpf: "",
    age: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(patient);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            DentoScan AI
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={onViewHistory}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver Histórico
            </button>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Cadastro do Paciente
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Preencha os dados para iniciar o diagnóstico
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor="name"
              >
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="Ex: João da Silva"
                  value={patient.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor="cpf"
              >
                CPF
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="000.000.000-00"
                  value={patient.cpf}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="age"
                >
                  Idade
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    required
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                    placeholder="Ex: 35"
                    value={patient.age}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="phone"
                >
                  Telefone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                    placeholder="(11) 99999-9999"
                    value={patient.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor="address"
              >
                Endereço
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="Rua, Número, Bairro, Cidade"
                  value={patient.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors mt-6"
            >
              Continuar para Captura
              <ArrowRight className="absolute right-4 top-3.5 h-5 w-5 text-blue-300 group-hover:text-white transition-colors" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
