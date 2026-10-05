import React from 'react';
import {
  Wallet,
  TrendingDown,
  Coins,
  ArrowUpRight,
  Eye,
  Edit2,
  FileDown,
  Trash2,
  Plus,
  SunMedium,
  MoonStar,
  ReceiptText,
} from 'lucide-react';
import { PurchaseSheet, DashboardStats, Settings } from '../types';
import { formatAriary, formatDateFR } from '../lib/utils';
import { generatePurchaseSheetPDF } from '../lib/pdfGenerator';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNewSheet: () => void;
  onViewSheet: (sheet: PurchaseSheet) => void;
  onEditSheet: (sheet: PurchaseSheet) => void;
  onDeleteSheet: (sheet: PurchaseSheet) => void;
  settings: Settings | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onNewSheet,
  onViewSheet,
  onEditSheet,
  onDeleteSheet,
  settings,
}) => {
  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const handleDownloadPDF = (sheet: PurchaseSheet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (settings) {
      generatePurchaseSheetPDF(sheet, settings, 'save');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {settings?.organization_name || 'ONG F4'} · Point de Caisse Quotidien
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            Tableau de bord — Trésorière ONG F4
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Suivi en temps réel des approvisionnements, sorties de caisse et soldes restants.
          </p>
        </div>

        <button
          onClick={onNewSheet}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvelle fiche d'achats</span>
        </button>
      </div>

      {/* Main Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vola teo am-pelatanana / Cash received today */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vola nomena (Aujourd'hui)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatAriary(stats.todayCashReceived)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Fonds total alloué pour la journée
            </p>
          </div>
        </div>

        {/* Card 2: Total achats androany */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total achats androany
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatAriary(stats.todayExpenses)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.sheetsTodayCount} fiche(s) enregistrée(s) aujourd'hui
            </p>
          </div>
        </div>

        {/* Card 3: Reste androany / Today Balance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reste en caisse (Aujourd'hui)
            </span>
            <div className={`p-2 rounded-lg ${stats.todayBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-bold tabular-nums ${stats.todayBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatAriary(stats.todayBalance)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Vola nomena − Achats
            </p>
          </div>
        </div>

        {/* Card 4: Total Fiches Historique */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Fiches Enregistrées
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.totalSheetsCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Dans la base de données
            </p>
          </div>
        </div>
      </div>

      {/* Dernières Fiches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Dernières Fiches d'Achats
            </h3>
            <p className="text-xs text-slate-500">
              Consultez, modifiez ou exportez les fiches de caisse les plus récentes
            </p>
          </div>

          <button
            onClick={onNewSheet}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>+ Ajouter un achat</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentSheets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <ReceiptText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Aucune fiche enregistrée</h4>
            <p className="text-xs text-slate-500 mt-1">
              Commencez par créer la première fiche d'achats du jour.
            </p>
            <button
              onClick={onNewSheet}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Créer une fiche
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">N° Fiche</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Session</th>
                  <th className="py-3.5 px-4 text-right">Vola Nomena</th>
                  <th className="py-3.5 px-4 text-right">Total Dépenses</th>
                  <th className="py-3.5 px-4 text-right">Reste</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentSheets.map((sheet) => {
                  const isMatin = sheet.session === 'MATIN';
                  return (
                    <tr
                      key={sheet.id}
                      onClick={() => onViewSheet(sheet)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {sheet.sheet_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateFR(sheet.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          isMatin ? 'text-sky-700' : 'text-amber-700'
                        }`}>
                          {isMatin ? <SunMedium className="w-3.5 h-3.5" /> : <MoonStar className="w-3.5 h-3.5" />}
                          {isMatin ? 'MATINA MATIN' : 'HARIVA (APRÈS-MIDI)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800 tabular-nums">
                        {formatAriary(sheet.cash_received)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-red-600 tabular-nums">
                        {formatAriary(sheet.total_expenses)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold tabular-nums ${
                        sheet.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatAriary(sheet.balance)}
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewSheet(sheet)}
                            title="Voir la fiche"
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
