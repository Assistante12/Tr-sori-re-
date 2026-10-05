import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SheetForm } from './components/SheetForm';
import { SheetDetailModal } from './components/SheetDetailModal';
import { HistoryView } from './components/HistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ConfirmModal } from './components/ConfirmModal';
import { PurchaseSheet, Settings, DashboardStats, FilterParams } from './types';
import { api } from './services/api';

function MainApp() {
  const { user, loading: authLoading } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [sheets, setSheets] = useState<PurchaseSheet[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Modal / Editing State
  const [selectedSheetForView, setSelectedSheetForView] = useState<PurchaseSheet | null>(null);
  const [editingSheet, setEditingSheet] = useState<PurchaseSheet | null>(null);
  const [sheetToDelete, setSheetToDelete] = useState<PurchaseSheet | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load all initial data
  const loadData = useCallback(async (filters?: FilterParams) => {
    setDataLoading(true);
    try {
      const [sheetsData, statsData, settingsData] = await Promise.all([
        api.getSheets(filters),
        api.getStats(),
        api.getSettings(),
      ]);
      setSheets(sheetsData);
      setStats(statsData);
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      showToast(err.message || 'Erreur lors du chargement des données', 'error');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Handle Sheet Creation / Update
  const handleSaveSheet = async (sheetData: Partial<PurchaseSheet>) => {
    setFormLoading(true);
    try {
      if (editingSheet) {
        const updated = await api.updateSheet(editingSheet.id, sheetData);
        showToast(`Fiche N° ${updated.sheet_number} mise à jour avec succès.`);
        setEditingSheet(null);
      } else {
        const created = await api.createSheet(sheetData);
        showToast(`Fiche N° ${created.sheet_number} créée et enregistrée dans la base de données.`);
      }
      await loadData();
      setCurrentTab('dashboard');
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Sheet Deletion
  const handleConfirmDelete = async () => {
    if (!sheetToDelete) return;
    try {
      await api.deleteSheet(sheetToDelete.id);
      showToast(`Fiche ${sheetToDelete.sheet_number} supprimée.`);
      setSheetToDelete(null);
      if (selectedSheetForView?.id === sheetToDelete.id) {
        setSelectedSheetForView(null);
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error');
    }
  };

  // Reset Demo Data
  const handleDemoReset = async () => {
    await api.resetDemoData();
    await loadData();
    showToast('Données de démonstration restaurées.');
  };

  // Switch to Edit Mode
  const startEditSheet = (sheet: PurchaseSheet) => {
    setEditingSheet(sheet);
    setSelectedSheetForView(null);
    setCurrentTab('new-sheet');
  };

  // New Sheet Click
  const handleStartNewSheet = () => {
    setEditingSheet(null);
    setCurrentTab('new-sheet');
  };

  // Filter History
  const handleFilterHistory = (filters: FilterParams) => {
    loadData(filters);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Chargement de l'application...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 border-emerald-700 text-emerald-100'
              : 'bg-red-900/95 border-red-700 text-red-100'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'new-sheet') {
            setEditingSheet(null);
          }
          setCurrentTab(tab);
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        settings={settings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNewSheet={handleStartNewSheet}
        />

        {/* View Routing */}
        <main className="flex-1 pb-12">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              loading={dataLoading}
              onNewSheet={handleStartNewSheet}
              onViewSheet={(sheet) => setSelectedSheetForView(sheet)}
              onEditSheet={startEditSheet}
              onDeleteSheet={(sheet) => setSheetToDelete(sheet)}
              settings={settings}
            />
          )}

          {currentTab === 'new-sheet' && (
            <SheetForm
              initialSheet={editingSheet}
              settings={settings}
              onSave={handleSaveSheet}
              onCancel={() => {
                setEditingSheet(null);
                setCurrentTab('dashboard');
              }}
              loading={formLoading}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              sheets={sheets}
              loading={dataLoading}
              onFilter={handleFilterHistory}
              onViewSheet={(sheet) => setSelectedSheetForView(sheet)}
              onEditSheet={startEditSheet}
              onDeleteSheet={(sheet) => setSheetToDelete(sheet)}
              settings={settings}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              settings={settings}
              onViewSheet={(sheet) => setSelectedSheetForView(sheet)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
              onDemoReset={handleDemoReset}
            />
          )}
        </main>
      </div>

      {/* Detailed Sheet View & PDF Modal */}
      <SheetDetailModal
        sheet={selectedSheetForView}
        settings={settings}
        isOpen={!!selectedSheetForView}
        onClose={() => setSelectedSheetForView(null)}
        onEdit={(sheet) => startEditSheet(sheet)}
        onDelete={(sheet) => setSheetToDelete(sheet)}
        onSheetUpdated={(updated) => {
          setSelectedSheetForView(updated);
          loadData();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sheetToDelete}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la fiche d'achats N° ${sheetToDelete?.sheet_number} du ${sheetToDelete?.date} (${sheetToDelete?.session}) ? Cette action est irréversible.`}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSheetToDelete(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
