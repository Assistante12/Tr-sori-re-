import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Eye,
  Edit2,
  FileDown,
  Trash2,
  RefreshCw,
  SunMedium,
  MoonStar,
  FileSpreadsheet,
} from 'lucide-react';
import { PurchaseSheet, FilterParams, Settings } from '../types';
import { formatAriary, formatDateFR } from '../lib/utils';
import { generatePurchaseSheetPDF } from '../lib/pdfGenerator';

interface HistoryViewProps {
  sheets: PurchaseSheet[];
  loading: boolean;
  onFilter: (filters: FilterParams) => void;
  onViewSheet: (sheet: PurchaseSheet) => void;
  onEditSheet: (sheet: PurchaseSheet) => void;
  onDeleteSheet: (sheet: PurchaseSheet) => void;
  settings: Settings | null;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sheets,
  loading,
  onFilter,
  onViewSheet,
  onEditSheet,
  onDeleteSheet,
  settings,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [session, setSession] = useState<'ALL' | 'MATIN' | 'APRÈS-MIDI'>('ALL');
  const [search, setSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      session,
      search: search.trim() || undefined,
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSession('ALL');
    setSearch('');
    onFilter({});
  };

  const handleDownloadPDF = (sheet: PurchaseSheet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (settings) {
      generatePurchaseSheetPDF(sheet, settings, 'save');
    }
  };

  // Calculated totals of filtered result set
  const filteredCashReceived = sheets.reduce((sum, s) => sum + s.cash_received, 0);
  const filteredExpenses = sheets.reduce((sum, s) => sum + s.total_expenses, 0);
  const filteredBalance = filteredCashReceived - filteredExpenses;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Historique des Achats & Fiches Antérieures
            </h2>
            <p className="text-xs text-slate-500">
              Recherchez et filtrez par date, session ou nom d'article
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {sheets.length} fiche(s) trouvée(s)
          </span>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Date Début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Date Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Session */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toutes les sessions</option>
              <option value="MATIN">☀️ MATIN</option>
              <option value="APRÈS-MIDI">🌙 APRÈS-MIDI</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Recherche (Désignation, N°)
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ex: Vary, Sosoa, 001..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrer</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Réinitialiser les filtres"
              className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Aggregated totals banner for current view */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Cumul Vola Nomena :
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {formatAriary(filteredCashReceived)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Cumul Dépenses :
            </span>
            <span className="text-sm font-bold text-red-600 tabular-nums">
              {formatAriary(filteredExpenses)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Reste Net :
            </span>
            <span className={`text-sm font-black tabular-nums ${filteredBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatAriary(filteredBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
            Chargement de l'historique...
          </div>
        ) : sheets.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aucune fiche trouvée</p>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez vos critères de recherche ou ajoutez une nouvelle fiche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-4">N° Fiche</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Nb Articles</th>
                  <th className="py-3 px-4 text-right">Vola Nomena</th>
                  <th className="py-3 px-4 text-right">Total Dépenses</th>
                  <th className="py-3 px-4 text-right">Reste</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sheets.map((sheet) => {
                  const isMatin = sheet.session === 'MATIN';
                  const itemsCount = sheet.items?.length || 0;
                  return (
                    <tr
                      key={sheet.id}
                      onClick={() => onViewSheet(sheet)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {sheet.sheet_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {formatDateFR(sheet.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          isMatin ? 'text-sky-700' : 'text-amber-700'
                        }`}>
                          {isMatin ? <SunMedium className="w-3.5 h-3.5" /> : <MoonStar className="w-3.5 h-3.5" />}
                          {isMatin ? 'MATINA MATIN' : 'HARIVA (APRÈS-MIDI)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {itemsCount} article(s)
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-900 tabular-nums">
                        {formatAriary(sheet.cash_received)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-red-600 tabular-nums">
                        {formatAriary(sheet.total_expenses)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-black tabular-nums ${
                        sheet.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatAriary(sheet.balance)}
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewSheet(sheet)}
                            title="Voir le document"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditSheet(sheet)}
                            title="Modifier"
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDownloadPDF(sheet, e)}
                            title="Télécharger PDF"
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSheet(sheet)}
                            title="Supprimer"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
