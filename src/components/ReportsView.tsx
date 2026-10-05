import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  FileDown,
  Printer,
  TrendingDown,
  Wallet,
  Coins,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { ReportSummary, Settings, PurchaseSheet } from '../types';
import { api } from '../services/api';
import { formatAriary, formatDateFR } from '../lib/utils';
import { generateReportPDF } from '../lib/pdfGenerator';

interface ReportsViewProps {
  settings: Settings | null;
  onViewSheet: (sheet: PurchaseSheet) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ settings, onViewSheet }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(
        period,
        period === 'custom' ? startDate : undefined,
        period === 'custom' ? endDate : undefined
      );
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'custom' || (startDate && endDate)) {
      fetchReport();
    }
  }, [period, startDate, endDate]);

  const handleExportPDF = () => {
    if (report && settings) {
      generateReportPDF(report, settings, 'save');
    }
  };

  const handlePrintPDF = () => {
    if (report && settings) {
      generateReportPDF(report, settings, 'print');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Control Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Rapports Financiers & Bilan de Trésorerie
            </h2>
            <p className="text-xs text-slate-500">
              Analyse détaillée des entrées de caisse, dépenses et soldes par session
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrintPDF}
              disabled={!report || report.breakdown.length === 0}
              className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              title="Imprimer le rapport"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!report || report.breakdown.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Exporter PDF</span>
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              period === 'today'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              period === 'week'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cette semaine
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              period === 'month'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ce mois
          </button>
          <button
            type="button"
            onClick={() => setPeriod('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              period === 'custom'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Période personnalisée
          </button>
        </div>

        {/* Custom Range Picker */}
        {period === 'custom' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Du :
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Au :
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
            <button
              onClick={fetchReport}
              disabled={!startDate || !endDate}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              Générer le rapport
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Vola Nomena
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {formatAriary(report.totalCashReceived)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Sur {report.sheetCount} fiche(s)
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Dépenses / Achats
              </span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2 tabular-nums">
              {formatAriary(report.totalExpenses)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Achats Matin & Après-midi
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Reste
              </span>
              <div className={`p-2 rounded-lg ${report.totalBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-2xl font-black mt-2 tabular-nums ${report.totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatAriary(report.totalBalance)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Solde net de caisse
            </p>
          </div>
        </div>
      )}

      {/* Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Détail par Jour & par Session ({report?.periodLabel || 'Période'})
          </h3>
          <span className="text-xs text-slate-500">
            {report?.breakdown.length || 0} date(s)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Chargement des données du rapport...
          </div>
        ) : !report || report.breakdown.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aucune donnée pour cette période</p>
            <p className="text-xs text-slate-400 mt-1">
              Sélectionnez une autre période ou enregistrez de nouvelles fiches d'achats.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Achats Matin</th>
                  <th className="py-3 px-4 text-right">Achats Après-midi</th>
                  <th className="py-3 px-4 text-right">Total Dépenses</th>
                  <th className="py-3 px-4 text-right">Vola Nomena</th>
                  <th className="py-3 px-4 text-right">Reste</th>
                  <th className="py-3 px-4 text-center">Fiches associées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.breakdown.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatDateFR(row.date)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 font-medium">
                      {row.matinExpense > 0 ? formatAriary(row.matinExpense) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 font-medium">
                      {row.apresMidiExpense > 0 ? formatAriary(row.apresMidiExpense) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-red-600">
                      {formatAriary(row.totalExpense)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-slate-900">
                      {formatAriary(row.totalCash)}
                    </td>
                    <td className={`py-3.5 px-4 text-right tabular-nums font-black ${
                      row.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatAriary(row.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {row.sheets.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => onViewSheet(s)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[11px] font-mono font-medium transition-colors"
                          >
                            {s.sheet_number} ({s.session === 'MATIN' ? 'M' : 'AM'})
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
