export type SessionType = 'MATIN' | 'APRÈS-MIDI';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'treasurer' | 'manager' | 'admin';
  created_at: string;
}

export interface PurchaseItem {
  id?: string;
  purchase_sheet_id?: string;
  designation: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at?: string;
}

export interface PurchaseSheet {
  id: string;
  sheet_number: string;
  date: string; // YYYY-MM-DD
  session: SessionType;
  cash_received: number; // Vola teo am-pelatanana / Vola nomena
  total_expenses: number; // Total vola nivoaka
  balance: number; // Reste = cash_received - total_expenses
  notes?: string;
  signature_treasurer?: string; // Base64 PNG signature of Treasurer
  signature_manager?: string; // Base64 PNG signature of Manager
  signed_treasurer_at?: string;
  signed_manager_at?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseItem[];
}

export interface Settings {
  id: string;
  organization_name: string;
  organization_subname?: string;
  logo_url?: string;
  treasurer_name: string;
  manager_name: string;
  default_signature_treasurer?: string;
  default_signature_manager?: string;
  email: string;
  phone?: string;
  address?: string;
  currency_symbol: string;
  default_session?: SessionType;
  updated_at: string;
}

export interface DashboardStats {
  cashOnHand: number;
  todayExpenses: number;
  todayCashReceived: number;
  todayBalance: number;
  totalSheetsCount: number;
  sheetsTodayCount: number;
  recentSheets: PurchaseSheet[];
}

export interface ReportSummary {
  periodLabel: string;
  totalCashReceived: number;
  totalExpenses: number;
  totalBalance: number;
  sheetCount: number;
  breakdown: {
    date: string;
    matinExpense: number;
    matinCash: number;
    apresMidiExpense: number;
    apresMidiCash: number;
    totalExpense: number;
    totalCash: number;
    balance: number;
    sheets: PurchaseSheet[];
  }[];
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  session?: 'ALL' | SessionType;
  search?: string;
}
