import React, { useState, useEffect } from 'react';
import {
  Save,
  Building,
  UserCheck,
  Coins,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Trash2,
} from 'lucide-react';
import { Settings } from '../types';
import { api } from '../services/api';
import { SignaturePadModal } from './SignaturePadModal';

interface SettingsViewProps {
  settings: Settings | null;
  onSettingsUpdated: (newSettings: Settings) => void;
  onDemoReset: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsUpdated,
  onDemoReset,
}) => {
  const [formData, setFormData] = useState<Partial<Settings>>({
    organization_name: '',
    organization_subname: '',
    treasurer_name: '',
    manager_name: '',
    default_signature_treasurer: '',
    default_signature_manager: '',
    email: '',
    phone: '',
    address: '',
    currency_symbol: 'Ar',
  });

  const [activeSignModal, setActiveSignModal] = useState<'treasurer' | 'manager' | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        organization_name: settings.organization_name || '',
        organization_subname: settings.organization_subname || '',
        treasurer_name: settings.treasurer_name || '',
        manager_name: settings.manager_name || '',
        default_signature_treasurer: settings.default_signature_treasurer || '',
        default_signature_manager: settings.default_signature_manager || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        currency_symbol: settings.currency_symbol || 'Ar',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await api.updateSettings(formData);
      onSettingsUpdated(updated);
      setSuccessMessage('Paramètres sy sonia voatahiry soa aman-tsara.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Voulez-vous restaurer les données de démonstration initiales (fiches du 02/10/2026) ?')) {
      return;
    }
    setResetting(true);
    try {
      await onDemoReset();
      setSuccessMessage('Données de démonstration restaurées avec succès.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Informations Organisation */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Informations de l'Organisation & En-tête des Fiches
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom de l'organisation / Entreprise
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  placeholder="Ex: GESTION DES ACHATS & TRÉSORERIE"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sous-titre / Activité
                </label>
                <input
                  type="text"
                  value={formData.organization_subname}
                  onChange={(e) => setFormData({ ...formData, organization_subname: e.target.value })}
                  placeholder="Ex: Caisse & Approvisionnement Quotidien"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tresoriere@fianarana.mg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+261 34 00 000 00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Signataires & Signatures par défaut */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Toerana fametrahana sonia (Signatures Officielles)
                </h3>
                <p className="text-xs text-slate-500">
                  Afaka manoratra na mametraka ny sonia maharitra ampiasaina amin'ny fiches sy PDF ianao eto
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 1. Trésorière Signature Box */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom de la Trésorière
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.treasurer_name}
                    onChange={(e) => setFormData({ ...formData, treasurer_name: e.target.value })}
                    placeholder="Rasoa Trésorière"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Sonia maharitry ny Trésorière :
                  </label>
                  {formData.default_signature_treasurer ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center">
                      <img
                        src={formData.default_signature_treasurer}
                        alt="Default Signature Trésorière"
                        className="h-16 max-w-[200px] object-contain"
                      />
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setActiveSignModal('treasurer')}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          Hanova ny sonia
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, default_signature_treasurer: '' })}
                          className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Fafana
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveSignModal('treasurer')}
                      className="w-full py-3 bg-white hover:bg-blue-50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-lg text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>+ Hametraka ny sonian'ny Trésorière</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Responsable Signature Box */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du Responsable
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    placeholder="Rakoto Responsable"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Sonia maharitry ny Responsable :
                  </label>
                  {formData.default_signature_manager ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center">
                      <img
                        src={formData.default_signature_manager}
                        alt="Default Signature Responsable"
                        className="h-16 max-w-[200px] object-contain"
                      />
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setActiveSignModal('manager')}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          Hanova ny sonia
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, default_signature_manager: '' })}
                          className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Fafana
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveSignModal('manager')}
                      className="w-full py-3 bg-white hover:bg-blue-50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-lg text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>+ Hametraka ny sonian'ny Responsable</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les paramètres & Signatures'}</span>
            </button>
          </div>
        </form>

        {/* Demo Reset Card */}
        <div className="bg-slate-50 rounded-xl p-5 sm:p-6 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Données de Démonstration (Seed)
            </h4>
          </div>
          <p className="text-xs text-slate-600">
            Raha te hamerina ireo fiches ohatra (02/10/2026 Matina matin & Hariva) ianao dia tsindrio eto.
          </p>
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {resetting ? 'Réinitialisation en cours...' : 'Restaurer les données démo initiales'}
          </button>
        </div>
      </div>

      {/* Signature Modal for Trésorière in Settings */}
      <SignaturePadModal
        isOpen={activeSignModal === 'treasurer'}
        title="Sonia Maharitry ny Trésorière"
        signeeName={formData.treasurer_name || 'Trésorière'}
        signeeRole="treasurer"
        existingSignature={formData.default_signature_treasurer}
        onSaveSignature={(dataUrl) => {
          setFormData({ ...formData, default_signature_treasurer: dataUrl });
          setActiveSignModal(null);
        }}
        onClearSignature={() => {
          setFormData({ ...formData, default_signature_treasurer: '' });
        }}
        onClose={() => setActiveSignModal(null)}
      />

      {/* Signature Modal for Responsable in Settings */}
      <SignaturePadModal
        isOpen={activeSignModal === 'manager'}
        title="Sonia Maharitry ny Responsable"
        signeeName={formData.manager_name || 'Responsable'}
        signeeRole="manager"
        existingSignature={formData.default_signature_manager}
        onSaveSignature={(dataUrl) => {
          setFormData({ ...formData, default_signature_manager: dataUrl });
          setActiveSignModal(null);
        }}
        onClearSignature={() => {
          setFormData({ ...formData, default_signature_manager: '' });
        }}
        onClose={() => setActiveSignModal(null)}
      />
    </>
  );
};
