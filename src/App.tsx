/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Login } from "./components/Login";
import { Registration, Patient } from "./components/Registration";
import { Dashboard } from "./components/Dashboard";
import { Analysis } from "./components/Analysis";
import { History } from "./components/History";
import { Consultation } from "./lib/storage";

type View = "login" | "register" | "dashboard" | "analysis" | "history";

export default function App() {
  const [view, setView] = useState<View>("login");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [image, setImage] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [initialDiagnosis, setInitialDiagnosis] = useState<any>(null);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setView("register");
  };

  const handleRegister = (newPatient: Patient) => {
    setPatient(newPatient);
    setView("dashboard");
  };

  const handleImageCaptured = (base64: string, mimeType: string) => {
    setImage({ base64, mimeType });
    setInitialDiagnosis(null);
    setView("analysis");
  };

  const handleReset = () => {
    setImage(null);
    setInitialDiagnosis(null);
    setView("dashboard");
  };

  const handleViewHistory = () => {
    setView("history");
  };

  const handleSelectConsultation = (consultation: Consultation) => {
    setPatient(consultation.patient);
    setImage({ base64: consultation.image, mimeType: consultation.mimeType });
    setInitialDiagnosis(consultation.diagnosis);
    setView("analysis");
  };

  const handleLogout = () => {
    setUserEmail(null);
    setPatient(null);
    setImage(null);
    setInitialDiagnosis(null);
    setView("login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {view === "login" && <Login onLogin={handleLogin} />}
      {view === "register" && (
        <Registration
          onRegister={handleRegister}
          onViewHistory={handleViewHistory}
          onLogout={handleLogout}
        />
      )}
      {view === "dashboard" && patient && (
        <Dashboard
          onImageCaptured={handleImageCaptured}
          patientName={patient.name}
          onBack={() => setView("register")}
          onLogout={handleLogout}
        />
      )}
      {view === "analysis" && image && patient && (
        <Analysis
          image={image.base64}
          mimeType={image.mimeType}
          patient={patient}
          initialDiagnosis={initialDiagnosis}
          onReset={handleReset}
          onLogout={handleLogout}
        />
      )}
      {view === "history" && (
        <History
          onBack={() => setView("register")}
          onSelect={handleSelectConsultation}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
