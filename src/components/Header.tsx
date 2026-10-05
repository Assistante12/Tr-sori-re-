import React from 'react';
import { Menu, Plus, Calendar, Shield } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onNewSheet: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tableau de bord',
    subtitle: 'Aperçu de la caisse et des achats récents',
  },
  'new-sheet': {
    title: "Création d'une fiche d'achats",
    subtitle: 'Saisie quotidienne et calcul automatique de la caisse',
  },
  history: {
    title: 'Historique des achats',
    subtitle: 'Consultez, filtrez et exportez toutes vos fiches antérieures',
  },
  reports: {
    title: 'Rapports & Statistiques',
    subtitle: 'Bilan périodique et répartition des dépenses Matin / Après-midi',
  },
  settings: {
    title: 'Paramètres',
    subtitle: "Configuration de l'organisation, signatures et informations PDF",
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onNewSheet,
}) => {
  const currentInfo = TAB_TITLES[currentTab];
  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg -ml-1 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date chip */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="capitalize">{todayFormatted}</span>
        </div>

        {currentTab !== 'new-sheet' && (
          <button
            onClick={onNewSheet}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Nouvelle fiche</span>
          </button>
        )}
      </div>
    </header>
  );
};
