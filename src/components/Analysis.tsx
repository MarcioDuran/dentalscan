import { useEffect, useState, useRef } from "react";
import {
  FileText,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { analyzeDentalImage, DentalDiagnosis } from "../services/gemini";
import { Patient } from "./Registration";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { saveConsultation } from "../lib/storage";

interface AnalysisProps {
  image: string;
  mimeType: string;
  patient: Patient;
  initialDiagnosis?: DentalDiagnosis;
  onReset: () => void;
  onLogout: () => void;
}

export function Analysis({
  image,
  mimeType,
  patient,
  initialDiagnosis,
  onReset,
  onLogout,
}: AnalysisProps) {
  const [loading, setLoading] = useState(!initialDiagnosis);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DentalDiagnosis | null>(
    initialDiagnosis || null,
  );
  const analysisId = useRef(Date.now().toString());

  useEffect(() => {
    if (initialDiagnosis) return;

    let isMounted = true;
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyzeDentalImage(image, mimeType);
        if (isMounted) {
          setDiagnosis(result);
          await saveConsultation({
            id: analysisId.current,
            date: new Date().toISOString(),
            patient,
            image,
            mimeType,
            diagnosis: result,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Ocorreu um erro ao analisar a imagem.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    analyze();
    return () => {
      isMounted = false;
    };
  }, [image, mimeType, patient, initialDiagnosis]);

  const generatePDF = async () => {
    const reportElement = document.getElementById("pdf-report");
    if (!reportElement) return;

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        onclone: (documentClone) => {
          const container = documentClone.getElementById(
            "pdf-report-container",
          );
          if (container) {
            container.style.position = "static";
            container.style.left = "0";
          }
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Relatorio_Odontologico_${patient.name.replace(/\s+/g, "_")}.pdf`,
      );
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Não foi possível gerar o PDF.");
    }
  };

  const sendWhatsApp = () => {
    if (!diagnosis) return;

    const text = `*Relatório Odontológico - DentoScan AI*
Paciente: ${patient.name}
Idade: ${patient.age}

*Diagnóstico:*
${diagnosis.diagnosis}

*Dentes Afetados:*
${diagnosis.damagedTeeth.join(", ")}

*Tratamentos Sugeridos:*
${diagnosis.treatments.map((t) => `- ${t.name}: R$ ${t.estimatedCost.toFixed(2)}`).join("\n")}

*Custo Total Estimado:* R$ ${diagnosis.totalEstimatedCost.toFixed(2)}

*Prognóstico:*
${diagnosis.prognosis}
`;

    const encodedText = encodeURIComponent(text);
    // Assuming we send to the patient's phone
    const phone = patient.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodedText}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center space-y-6">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Analisando Imagem...
            </h3>
            <p className="text-slate-500 mt-2">
              Nossa IA está verificando sinais de erosão, cáries e outros danos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-red-100 p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Erro na Análise
            </h3>
            <p className="text-slate-500 mt-2">{error}</p>
          </div>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!diagnosis) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Nova Análise
          </button>
          <div className="flex gap-3 items-center">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>
            <button
              onClick={sendWhatsApp}
              className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20BD5A] transition-colors shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar WhatsApp</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image Preview */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                Imagem Analisada
              </h3>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={image}
                  alt="Dentes analisados"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                Dados do Paciente
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Nome</dt>
                  <dd className="font-medium text-slate-900">{patient.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Idade</dt>
                  <dd className="font-medium text-slate-900">
                    {patient.age} anos
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Telefone</dt>
                  <dd className="font-medium text-slate-900">
                    {patient.phone}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Diagnosis Results */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Diagnóstico
                  </h2>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {diagnosis.diagnosis}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Dentes Afetados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {diagnosis.damagedTeeth.map((tooth, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200"
                    >
                      {tooth}
                    </span>
                  ))}
                  {diagnosis.damagedTeeth.length === 0 && (
                    <span className="text-slate-500 text-sm">
                      Nenhum dente específico identificado.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Plano de Tratamento
              </h3>

              <div className="space-y-4">
                {diagnosis.treatments.map((treatment, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {treatment.name}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {treatment.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-slate-900">
                        R${" "}
                        {treatment.estimatedCost.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                <span className="text-lg font-medium text-slate-700">
                  Custo Total Estimado
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  R${" "}
                  {diagnosis.totalEstimatedCost.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl shadow-sm text-white">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Prognóstico
              </h3>
              <p className="text-lg leading-relaxed text-slate-100">
                {diagnosis.prognosis}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Off-screen PDF Report Template */}
      <div id="pdf-report-container" className="absolute -left-[9999px] top-0">
        <div
          id="pdf-report"
          className="w-[800px] bg-white p-12 font-sans text-[#0f172a]"
        >
          <div className="border-b-2 border-[#0f172a] pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a]">
                DentoScan AI
              </h1>
              <p className="text-[#64748b] mt-1">
                Relatório de Diagnóstico Odontológico
              </p>
            </div>
            <div className="text-right text-sm text-[#64748b]">
              Data: {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-4">
                Dados do Paciente
              </h2>
              <p>
                <strong>Nome:</strong> {patient.name}
              </p>
              <p>
                <strong>CPF:</strong> {patient.cpf}
              </p>
              <p>
                <strong>Idade:</strong> {patient.age} anos
              </p>
              <p>
                <strong>Telefone:</strong> {patient.phone}
              </p>
              <p>
                <strong>Endereço:</strong> {patient.address}
              </p>
            </div>
            <div className="flex items-center justify-center bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-2">
              <img
                src={image}
                alt="Dentes"
                className="max-h-48 rounded-lg object-contain"
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-3 border-b border-[#e2e8f0] pb-2">
              Diagnóstico
            </h2>
            <p className="text-[#334155] leading-relaxed">
              {diagnosis.diagnosis}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-3 border-b border-[#e2e8f0] pb-2">
              Dentes Afetados
            </h2>
            <p className="text-[#334155]">
              {diagnosis.damagedTeeth.join(", ") ||
                "Nenhum dente específico listado."}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 border-b border-[#e2e8f0] pb-2">
              Plano de Tratamento e Orçamento
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9]">
                  <th className="p-3 border border-[#e2e8f0] font-semibold">
                    Tratamento
                  </th>
                  <th className="p-3 border border-[#e2e8f0] font-semibold">
                    Descrição
                  </th>
                  <th className="p-3 border border-[#e2e8f0] font-semibold text-right">
                    Valor Estimado
                  </th>
                </tr>
              </thead>
              <tbody>
                {diagnosis.treatments.map((t, i) => (
                  <tr key={i}>
                    <td className="p-3 border border-[#e2e8f0] font-medium">
                      {t.name}
                    </td>
                    <td className="p-3 border border-[#e2e8f0] text-sm text-[#475569]">
                      {t.description}
                    </td>
                    <td className="p-3 border border-[#e2e8f0] text-right whitespace-nowrap">
                      R$ {t.estimatedCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f8fafc] font-bold">
                  <td
                    colSpan={2}
                    className="p-3 border border-[#e2e8f0] text-right"
                  >
                    Total Estimado
                  </td>
                  <td className="p-3 border border-[#e2e8f0] text-right text-[#2563eb]">
                    R$ {diagnosis.totalEstimatedCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3 border-b border-[#e2e8f0] pb-2">
              Prognóstico
            </h2>
            <p className="text-[#334155] leading-relaxed">
              {diagnosis.prognosis}
            </p>
          </div>

          <div className="mt-16 pt-8 border-t border-[#e2e8f0] text-center text-sm text-[#64748b]">
            <p>
              Este é um relatório gerado por Inteligência Artificial e não
              substitui a avaliação presencial de um cirurgião-dentista.
            </p>
            <p className="mt-1">
              DentoScan AI &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
