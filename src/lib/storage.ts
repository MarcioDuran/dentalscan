import { Patient } from "../components/Registration";
import { DentalDiagnosis } from "../services/gemini";

export interface Consultation {
  id: string;
  date: string;
  patient: Patient;
  image: string;
  mimeType: string;
  diagnosis: DentalDiagnosis;
}

export const saveConsultation = (consultation: Consultation) => {
  const existing = getConsultations();
  if (!existing.find((c) => c.id === consultation.id)) {
    existing.unshift(consultation);
    localStorage.setItem("dentoscan_consultations", JSON.stringify(existing));
  }
};

export const getConsultations = (): Consultation[] => {
  const data = localStorage.getItem("dentoscan_consultations");
  return data ? JSON.parse(data) : [];
};

export const updateConsultation = (
  id: string,
  updatedConsultation: Consultation,
) => {
  const existing = getConsultations();
  const index = existing.findIndex((c) => c.id === id);
  if (index !== -1) {
    existing[index] = updatedConsultation;
    localStorage.setItem("dentoscan_consultations", JSON.stringify(existing));
  }
};

export const deleteConsultation = (id: string) => {
  const existing = getConsultations();
  const filtered = existing.filter((c) => c.id !== id);
  localStorage.setItem("dentoscan_consultations", JSON.stringify(filtered));
};

export const clearConsultations = () => {
  localStorage.removeItem("dentoscan_consultations");
};
