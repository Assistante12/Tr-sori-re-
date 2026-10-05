import React, { useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  Edit2,
  Trash2,
  Receipt,
  PenTool,
  CheckCircle2,
} from 'lucide-react';
import { PurchaseSheet, Settings } from '../types';
import { formatAriary, formatDateFR } from '../lib/utils';
import { generatePurchaseSheetPDF } from '../lib/pdfGenerator';
import { SignaturePadModal } from './SignaturePadModal';
import { api } from '../services/api';

interface SheetDetailModalProps {
  sheet: PurchaseSheet | null;
  settings: Settings | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sheet: PurchaseSheet) => void;
  onDelete: (sheet: PurchaseSheet) => void;
  onSheetUpdated?: (updated: PurchaseSheet) => void;
}

export const SheetDetailModal: React.FC<SheetDetailModalProps> = ({
  sheet,
  settings,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSheetUpdated,
}) => {
  const [activeSignModal, setActiveSignModal] = useState<'treasurer' | 'manager' | null>(null);
  const [currentSheet, setCurrentSheet] = useState<PurchaseSheet | null>(sheet);

  // Sync state when sheet prop changes
  React.useEffect(() => {
    setCurrentSheet(sheet);
  }, [sheet]);

  if (!isOpen || !currentSheet) return null;

  const handleDownloadPDF = () => {
    if (settings) {
      generatePurchaseSheetPDF(currentSheet, settings, 'save');
    }
  };

  const handlePrintPDF = () => {
    if (settings) {
      generatePurchaseSheetPDF(currentSheet, settings, 'print');
    }
  };

  const handleSaveSignature = async (role: 'treasurer' | 'manager', signatureDataUrl: string | null) => {
    try {
      const updated = await api.signSheet(currentSheet.id, role, signatureDataUrl);
      setCurrentSheet(updated);
      if (onSheetUpdated) {
        onSheetUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to save signature:', err);
    }
  };

  const isMatin = currentSheet.session === 'MATIN';
  const sessionTitle = isMatin ? 'MATINA MATIN' : 'HARIVA (APRÈS-MIDI)';
  const items = currentSheet.items || [];
  const totalRows = Math.max(20, items.length);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
          {/* Top Control Bar */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">
                Aperçu Fiche Papier — {currentSheet.sheet_number}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrintPDF}
                title="Imprimer"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadPDF}
                title="Télécharger PDF"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exporter PDF</span>
              </button>
              <button
                onClick={() => onEdit(currentSheet)}
                title="Modifier la fiche"
                className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(currentSheet)}
                title="Supprimer la fiche"
                className="p-2 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                title="Fermer"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Realistic Printable Paper Sheet Container */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-200/60">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg border border-slate-300 mx-auto max-w-3xl text-slate-900 font-sans print:shadow-none print:border-none">
              {/* Header: Title Centered */}
              <div className="text-center pb-2">
                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900">
                  FICHE D'ACHATS — {sessionTitle}
                </h2>
              </div>

              {/* Sub-header: N° Fiche and Daty with authentic dotted fills */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 pt-2 pb-3">
                <div className="flex items-baseline gap-1">
                  <span>N° Fiche :</span>
                  <span className="font-mono underline decoration-dotted font-semibold px-1">
                    {currentSheet.sheet_number}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span>Daty :</span>
                  <span className="underline decoration-dotted font-semibold px-1">
                    {formatDateFR(currentSheet.date)}
                  </span>
                </div>
              </div>

              {/* Authentic Table Grid Structure matching the photo */}
              <div className="border border-slate-900 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-50 font-bold text-slate-900">
                      <th className="py-2 px-2 text-center border-r border-slate-900 w-10">
                        N°
                      </th>
                      <th className="py-2 px-3 border-r border-slate-900">
                        Anaran'ny zavatra vidiana rehetra (Désignation)
                      </th>
                      <th className="py-2 px-2 text-center border-r border-slate-900 w-24">
                        Isany
                      </th>
                      <th className="py-2 px-3 text-right border-r border-slate-900 w-28">
                        Vidiny
                      </th>
                      <th className="py-2 px-3 text-right w-32">
                        Totaly
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: totalRows }).map((_, index) => {
                      const item = items[index];
                      const isanyText = item
                        ? item.unit && item.unit !== 'pièce' && item.unit !== '-'
                          ? `${item.quantity} ${item.unit}`
                          : `${item.quantity}`
                        : '';

                      return (
                        <tr
                          key={index}
                          className={`border-b border-slate-400/80 ${
                            item ? 'hover:bg-slate-50/80' : 'h-6'
                          }`}
                        >
                          <td className="py-1.5 px-2 text-center border-r border-slate-900 font-bold text-slate-700">
                            {index + 1}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-900 font-medium text-slate-900">
                            {item ? item.designation : ''}
                          </td>
                          <td className="py-1.5 px-2 text-center border-r border-slate-900 font-semibold text-slate-800 tabular-nums">
                            {isanyText}
                          </td>
                          <td className="py-1.5 px-3 text-right border-r border-slate-900 font-medium text-slate-800 tabular-nums">
                            {item ? formatAriary(item.unit_price, true) : ''}
                          </td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                            {item ? formatAriary(item.total, true) : ''}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Summary Rows (Exact match with the bottom of the photo) */}
                    <tr className="border-t-2 border-slate-900 bg-slate-50 font-bold">
                      <td
                        colSpan={3}
                        className="py-2 px-3 text-right border-r border-slate-900 uppercase text-slate-800 text-[11px] sm:text-xs tracking-wider"
                      >
                        VOLA TEO AM-PELATANANA :
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right text-slate-900 text-sm font-extrabold tabular-nums">
                        {formatAriary(currentSheet.cash_received)}
                      </td>
                    </tr>

                    <tr className="border-t border-slate-900 bg-red-50/40 font-bold">
                      <td
                        colSpan={3}
                        className="py-2 px-3 text-right border-r border-slate-900 uppercase text-red-800 text-[11px] sm:text-xs tracking-wider"
                      >
                        TOTAL VOLA MIVOAKA :
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right text-red-600 text-sm font-extrabold tabular-nums">
                        {formatAriary(currentSheet.total_expenses)}
                      </td>
                    </tr>

                    <tr className="border-t border-slate-900 bg-emerald-50/50 font-bold">
                      <td
                        colSpan={3}
                        className="py-2 px-3 text-right border-r border-slate-900 uppercase text-emerald-900 text-[11px] sm:text-xs tracking-wider font-extrabold"
                      >
                        RESTE :
                      </td>
                      <td
                        colSpan={2}
                        className={`py-2 px-3 text-right text-sm font-black tabular-nums ${
                          currentSheet.balance >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {formatAriary(currentSheet.balance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {currentSheet.notes && (
                <div className="mt-4 p-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 italic">
                  <span className="font-bold not-italic">Fanamarihana / Observations : </span>
                  {currentSheet.notes}
                </div>
              )}

              {/* Interactive Signatures Section */}
              <div className="mt-8 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-900">
                {/* 1. Trésorière Signature Box */}
                <div className="p-3 bg-slate-50/80 border border-slate-300 rounded-xl flex flex-col justify-between min-h-[140px] hover:border-slate-400 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">Signature Trésorière :</p>
                      {currentSheet.signature_treasurer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Voasonia</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      ({settings?.treasurer_name || 'La Trésorière'})
                    </p>
                  </div>

                  {/* Signature Visual / Trigger */}
                  <div className="my-2 flex flex-col items-center justify-center">
                    {currentSheet.signature_treasurer ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={currentSheet.signature_treasurer}
                          alt="Sonia Trésorière"
                          className="h-16 max-w-[200px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveSignModal('treasurer')}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-medium underline mt-1 cursor-pointer"
                        >
                          Hanova ny sonia
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSignModal('treasurer')}
                        className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 border border-dashed border-blue-300 rounded-lg text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
                      >
                        <PenTool className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                        <span>+ Hametraka sonia (Trésorière)</span>
                      </button>
                    )}
                  </div>

                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>

                {/* 2. Responsable Signature Box */}
                <div className="p-3 bg-slate-50/80 border border-slate-300 rounded-xl flex flex-col justify-between min-h-[140px] hover:border-slate-400 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">Signature Responsable :</p>
                      {currentSheet.signature_manager && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Voasonia</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      ({settings?.manager_name || 'Le Responsable'})
                    </p>
                  </div>

                  {/* Signature Visual / Trigger */}
                  <div className="my-2 flex flex-col items-center justify-center">
                    {currentSheet.signature_manager ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={currentSheet.signature_manager}
                          alt="Sonia Responsable"
                          className="h-16 max-w-[200px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveSignModal('manager')}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-medium underline mt-1 cursor-pointer"
                        >
                          Hanova ny sonia
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSignModal('manager')}
                        className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 border border-dashed border-blue-300 rounded-lg text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
                      >
                        <PenTool className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                        <span>+ Hametraka sonia (Responsable)</span>
                      </button>
                    )}
                  </div>

                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Action Controls */}
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              Fiche nampidirin'i <strong className="text-slate-700">{currentSheet.created_by_name || 'Trésorière'}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Télécharger le PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal for Trésorière */}
      <SignaturePadModal
        isOpen={activeSignModal === 'treasurer'}
        title="Sonia Trésorière"
        signeeName={settings?.treasurer_name || 'Trésorière'}
        signeeRole="treasurer"
        existingSignature={currentSheet.signature_treasurer}
        onSaveSignature={(dataUrl) => handleSaveSignature('treasurer', dataUrl)}
        onClearSignature={() => handleSaveSignature('treasurer', null)}
        onClose={() => setActiveSignModal(null)}
      />

      {/* Signature Modal for Responsable */}
      <SignaturePadModal
        isOpen={activeSignModal === 'manager'}
        title="Sonia Responsable"
        signeeName={settings?.manager_name || 'Responsable'}
        signeeRole="manager"
        existingSignature={currentSheet.signature_manager}
        onSaveSignature={(dataUrl) => handleSaveSignature('manager', dataUrl)}
        onClearSignature={() => handleSaveSignature('manager', null)}
        onClose={() => setActiveSignModal(null)}
      />
    </>
  );
};
