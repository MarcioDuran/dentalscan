import { Patient } from "../components/Registration";
import { DentalDiagnosis } from "../services/gemini";
import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";

export interface Consultation {
  id: string;
  date: string;
  patient: Patient;
  image: string;
  mimeType: string;
  diagnosis: DentalDiagnosis;
}

const COLLECTION_NAME = "consultations";

export const saveConsultation = async (consultation: Consultation) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, consultation.id);
    await setDoc(docRef, consultation);
  } catch (error) {
    console.error("Error saving consultation:", error);
  }
};

export const getConsultations = async (): Promise<Consultation[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const consultations: Consultation[] = [];
    querySnapshot.forEach((doc) => {
      consultations.push(doc.data() as Consultation);
    });
    return consultations;
  } catch (error) {
    console.error("Error getting consultations:", error);
    return [];
  }
};

export const updateConsultation = async (
  id: string,
  updatedConsultation: Consultation,
) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, updatedConsultation, { merge: true });
  } catch (error) {
    console.error("Error updating consultation:", error);
  }
};

export const deleteConsultation = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting consultation:", error);
  }
};

export const clearConsultations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error clearing consultations:", error);
  }
};
