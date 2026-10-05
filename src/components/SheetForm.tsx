import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Coins,
  Calculator,
  AlertCircle,
  Sparkles,
  PenTool,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PurchaseSheet, SessionType, Settings } from '../types';
import {
  formatAriary,
  getTodayISODate,
  COMMON_UNITS,
  FREQUENT_PRODUCTS,
} from '../lib/utils';
import { SignaturePadModal } from './SignaturePadModal';

interface SheetFormProps {
  initialSheet?: PurchaseSheet | null;
  settings?: Settings | null;
  onSave: (sheetData: Partial<PurchaseSheet>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormItem {
  id?: string;
  designation: string;
  quantity: number | string;
  unit: string;
  unit_price: number | string;
  total: number;
}

export const SheetForm: React.FC<SheetFormProps> = ({
  initialSheet,
  settings,
  onSave,
  onCancel,
  loading = false,
}) => {
  const isEditMode = !!initialSheet;

  // Form State
  const [date, setDate] = useState<string>(initialSheet?.date || getTodayISODate());
  const [session, setSession] = useState<SessionType>(initialSheet?.session || 'MATIN');
  const [cashReceived, setCashReceived] = useState<number | string>(
    initialSheet?.cash_received !== undefined ? initialSheet.cash_received : ''
  );
  const [notes, setNotes] = useState<string>(initialSheet?.notes || '');

  // Signatures State (Prefills with existing or default setting signature)
  const [signatureTreasurer, setSignatureTreasurer] = useState<string>(
    initialSheet?.signature_treasurer || settings?.default_signature_treasurer || ''
  );
  const [signatureManager, setSignatureManager] = useState<string>(
    initialSheet?.signature_manager || settings?.default_signature_manager || ''
  );

  const [activeSignModal, setActiveSignModal] = useState<'treasurer' | 'manager' | null>(null);

  // Items State
  const [items, setItems] = useState<FormItem[]>(() => {
    if (initialSheet?.items && initialSheet.items.length > 0) {
      return initialSheet.items.map((it) => ({
        id: it.id,
        designation: it.designation,
        quantity: it.quantity,
        unit: it.unit || 'pièce',
        unit_price: it.unit_price,
        total: it.total,
      }));
    }
    // Default initial row
    return [
      {
        designation: '',
        quantity: 1,
        unit: 'pièce',
        unit_price: '',
        total: 0,
      },
    ];
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to calculate total for single item
  const calculateItemTotal = (qty: number | string, price: number | string): number => {
    const q = typeof qty === 'number' ? qty : parseFloat(qty) || 0;
    const p = typeof price === 'number' ? price : parseFloat(price) || 0;
    return Math.round(q * p);
  };

  // Update item field and recalculate total
  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: any
  ) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? value : item.quantity;
      const p = field === 'unit_price' ? value : item.unit_price;
      item.total = calculateItemTotal(q, p);
    }

    updated[index] = item;
    setItems(updated);
  };

  // Add Item Row
  const handleAddItem = (preset?: { designation: string; defaultUnit: string; defaultPrice: number }) => {
    if (preset) {
      setItems((prev) => [
        ...prev,
        {
          designation: preset.designation,
          quantity: 1,
          unit: preset.defaultUnit,
          unit_price: preset.defaultPrice,
          total: preset.defaultPrice,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          designation: '',
          quantity: 1,
          unit: 'pièce',
          unit_price: '',
          total: 0,
        },
      ]);
    }
  };

  // Remove Item Row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([
        {
          designation: '',
          quantity: 1,
          unit: 'pièce',
          unit_price: '',
          total: 0,
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals calculations
  const totalExpenses = items.reduce((sum, it) => sum + (it.total || 0), 0);
  const numCashReceived = typeof cashReceived === 'number' ? cashReceived : parseFloat(cashReceived) || 0;
  const balance = numCashReceived - totalExpenses;

  // Form Submission & Strict Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date) {
      setErrorMessage('Veuillez renseigner la date de la fiche.');
      return;
    }

    if (!session || (session !== 'MATIN' && session !== 'APRÈS-MIDI')) {
      setErrorMessage('Veuillez sélectionner la session (MATINA MATIN ou HARIVA).');
      return;
    }

    if (cashReceived === '' || numCashReceived < 0) {
      setErrorMessage('Veuillez saisir le montant du Vola teo am-pelatanana / Vola nomena.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Veuillez ajouter au moins un article dans la liste.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const des = it.designation.trim();
      const q = typeof it.quantity === 'number' ? it.quantity : parseFloat(it.quantity as string);
      const p = typeof it.unit_price === 'number' ? it.unit_price : parseFloat(it.unit_price as string);

      if (!des) {
        setErrorMessage(`Ligne N°${i + 1} : La désignation de l'article est obligatoire.`);
        return;
      }
      if (isNaN(q) || q <= 0) {
        setErrorMessage(`Ligne N°${i + 1} ("${des}") : La quantité doit être supérieure à 0.`);
        return;
      }
      if (isNaN(p) || p < 0) {
        setErrorMessage(`Ligne N°${i + 1} ("${des}") : Le prix unitaire doit être supérieur ou égal à 0.`);
        return;
      }
    }

    const payload: Partial<PurchaseSheet> = {
      date,
      session,
      cash_received: numCashReceived,
      notes: notes.trim() || undefined,
      signature_treasurer: signatureTreasurer || undefined,
      signature_manager: signatureManager || undefined,
      items: items.map((it) => ({
        id: it.id,
        purchase_sheet_id: initialSheet?.id || '',
        designation: it.designation.trim(),
        quantity: typeof it.quantity === 'number' ? it.quantity : parseFloat(it.quantity as string),
        unit: it.unit || 'pièce',
        unit_price: typeof it.unit_price === 'number' ? it.unit_price : parseFloat(it.unit_price as string),
        total: it.total,
      })),
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement de la fiche.");
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Top Bar with Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au tableau de bord</span>
          </button>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">
              {isEditMode ? `Modification Fiche ${initialSheet?.sheet_number}` : 'Nouvelle saisie de caisse'}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations Générales */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                1. En-tête de la Fiche (Daty, Session & Vola teo am-pelatanana)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Daty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daty (Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Session (MATINA MATIN / HARIVA) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Session <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSession('MATIN')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      session === 'MATIN'
                        ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ☀️ MATINA MATIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setSession('APRÈS-MIDI')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      session === 'APRÈS-MIDI'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌙 HARIVA (APRÈS-MIDI)
                  </button>
                </div>
              </div>

              {/* Vola teo am-pelatanana */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vola teo am-pelatanana (Vola nomena) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="ex: 100000"
                    className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                    Ar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Articles & Achats */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Anaran'ny zavatra vidiana rehetra (Désignation sy Vidiny)
                </h3>
                <p className="text-xs text-slate-500">
                  Ny totalin'ny tsirairay sy ny totalin'ny vola mivoaka rehetra dia mikajy automatique.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddItem()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Hanampy zavatra vidiana</span>
              </button>
            </div>

            {/* Quick Frequent Items Pickers */}
            <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Zavatra fividy matetika (Tsindrio mba hampidirana haingana) :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FREQUENT_PRODUCTS.map((preset) => (
                  <button
                    key={preset.designation}
                    type="button"
                    onClick={() => handleAddItem(preset)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-xs text-slate-700 transition-colors font-medium cursor-pointer shadow-2xs"
                  >
                    + {preset.designation} ({preset.defaultPrice} Ar)
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Items Table matching the physical sheet */}
            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b border-slate-300 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-2 text-center w-12 border-r border-slate-300">N°</th>
                    <th className="py-3 px-3 min-w-[220px] border-r border-slate-300">
                      Anaran'ny zavatra vidiana rehetra (Désignation) <span className="text-red-500">*</span>
                    </th>
                    <th className="py-3 px-2 w-28 border-r border-slate-300 text-center">
                      Isany (Qty) <span className="text-red-500">*</span>
                    </th>
                    <th className="py-3 px-2 w-28 border-r border-slate-300 text-center">
                      Unité
                    </th>
                    <th className="py-3 px-3 w-36 border-r border-slate-300 text-right">
                      Vidiny (Ar) <span className="text-red-500">*</span>
                    </th>
                    <th className="py-3 px-3 text-right w-36 border-r border-slate-300">
                      Totaly (Ar)
                    </th>
                    <th className="py-3 px-2 text-center w-12">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-2 text-center font-bold text-slate-600 text-xs border-r border-slate-200">
                        {index + 1}
                      </td>

                      {/* Designation */}
                      <td className="py-2 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          required
                          value={item.designation}
                          onChange={(e) => handleItemChange(index, 'designation', e.target.value)}
                          placeholder="ex: Gouter, Vary alvandro, Tomate, Kabaka..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-2 border-r border-slate-200">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-center text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-2 px-2 border-r border-slate-200">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        >
                          {COMMON_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.value}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Unit Price (Vidiny) */}
                      <td className="py-2 px-2 border-r border-slate-200">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            placeholder="500"
                            className="w-full pl-2 pr-7 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-right text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400 text-xs font-medium">
                            Ar
                          </span>
                        </div>
                      </td>

                      {/* Row Total (Totaly - Auto) */}
                      <td className="py-2 px-3 text-right border-r border-slate-200 bg-slate-50/50">
                        <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                          {formatAriary(item.total)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          title="Mamafa ity andalana ity"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>+ Hanampy andalana hafa</span>
              </button>
            </div>
          </div>

          {/* Section 3: Notes & Récapitulatif Financier Exact */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Notes */}
            <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Fanamarihana / Observations (Optionnel)
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Fanamarihana fanampiny mikasika ny fividianana..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>

            {/* Automatic Financial Summary Card */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Kajy Automatique an'ny Caisse
                </span>
                <Coins className="w-4 h-4 text-blue-400" />
              </div>

              <div className="space-y-3">
                {/* Cash Received */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">VOLA TEO AM-PELATANANA :</span>
                  <span className="text-base font-bold text-slate-100 tabular-nums">
                    {formatAriary(numCashReceived)}
                  </span>
                </div>

                {/* Total Expenses */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">TOTAL VOLA MIVOAKA :</span>
                  <span className="text-lg font-extrabold text-red-400 tabular-nums">
                    {formatAriary(totalExpenses)}
                  </span>
                </div>

                {/* Reste */}
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-white uppercase">
                    RESTE :
                  </span>
                  <span
                    className={`text-2xl font-black tabular-nums ${
                      balance >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatAriary(balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Toerana Fametrahana Sonia (Signatures Trésorière & Responsable) */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <PenTool className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  3. Toerana Fametrahana Sonia (Signatures)
                </h3>
                <p className="text-xs text-slate-500">
                  Azonao atao ny manasonia avy hatrany na mampiasa ny sonia maharitra efa voatahiry.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Trésorière Signature */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Signature Trésorière
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ({settings?.treasurer_name || 'La Trésorière'})
                    </p>
                  </div>
                  {signatureTreasurer && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Voasonia</span>
                    </span>
                  )}
                </div>

                {signatureTreasurer ? (
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center">
                    <img
                      src={signatureTreasurer}
                      alt="Sonia Trésorière"
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
                        onClick={() => setSignatureTreasurer('')}
                        className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                      >
                        Fafana
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveSignModal('treasurer')}
                      className="w-full py-2.5 bg-white hover:bg-blue-50 border border-dashed border-blue-400 rounded-lg text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>+ Manasonia eto (Trésorière)</span>
                    </button>
                    {settings?.default_signature_treasurer && (
                      <button
                        type="button"
                        onClick={() => setSignatureTreasurer(settings.default_signature_treasurer || '')}
                        className="w-full py-1 text-[11px] text-slate-600 hover:text-blue-600 underline cursor-pointer"
                      >
                        Mampiasa ny sonia maharitry ny Trésorière
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Responsable Signature */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Signature Responsable
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ({settings?.manager_name || 'Le Responsable'})
                    </p>
                  </div>
                  {signatureManager && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Voasonia</span>
                    </span>
                  )}
                </div>

                {signatureManager ? (
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center">
                    <img
                      src={signatureManager}
                      alt="Sonia Responsable"
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
                        onClick={() => setSignatureManager('')}
                        className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                      >
                        Fafana
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveSignModal('manager')}
                      className="w-full py-2.5 bg-white hover:bg-blue-50 border border-dashed border-blue-400 rounded-lg text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>+ Manasonia eto (Responsable)</span>
                    </button>
                    {settings?.default_signature_manager && (
                      <button
                        type="button"
                        onClick={() => setSignatureManager(settings.default_signature_manager || '')}
                        className="w-full py-1 text-[11px] text-slate-600 hover:text-blue-600 underline cursor-pointer"
                      >
                        Mampiasa ny sonia maharitry ny Responsable
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit & Cancel Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Aoka ihany (Annuler)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditMode ? 'Hitahiry ny fanovana' : 'Hitahiry ny Fiche d\'achats'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Signature Modal for Trésorière */}
      <SignaturePadModal
        isOpen={activeSignModal === 'treasurer'}
        title="Sonia Trésorière"
        signeeName={settings?.treasurer_name || 'Trésorière'}
        signeeRole="treasurer"
        existingSignature={signatureTreasurer}
        onSaveSignature={(dataUrl) => {
          setSignatureTreasurer(dataUrl);
          setActiveSignModal(null);
        }}
        onClearSignature={() => {
          setSignatureTreasurer('');
        }}
        onClose={() => setActiveSignModal(null)}
      />

      {/* Signature Modal for Responsable */}
      <SignaturePadModal
        isOpen={activeSignModal === 'manager'}
        title="Sonia Responsable"
        signeeName={settings?.manager_name || 'Responsable'}
        signeeRole="manager"
        existingSignature={signatureManager}
        onSaveSignature={(dataUrl) => {
          setSignatureManager(dataUrl);
          setActiveSignModal(null);
        }}
        onClearSignature={() => {
          setSignatureManager('');
        }}
        onClose={() => setActiveSignModal(null)}
      />
    </>
  );
};
