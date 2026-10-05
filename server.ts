import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Database storage file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Types for DB
interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/SHA representation for lightweight local auth
  role: 'treasurer' | 'manager' | 'admin';
  created_at: string;
}

interface DBItem {
  id: string;
  purchase_sheet_id: string;
  designation: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
}

interface DBSheet {
  id: string;
  sheet_number: string;
  date: string; // YYYY-MM-DD
  session: 'MATIN' | 'APRÈS-MIDI';
  cash_received: number;
  total_expenses: number;
  balance: number;
  notes?: string;
  signature_treasurer?: string;
  signature_manager?: string;
  signed_treasurer_at?: string;
  signed_manager_at?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

interface DBSettings {
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
  default_session?: 'MATIN' | 'APRÈS-MIDI';
  updated_at: string;
}

interface DatabaseSchema {
  users: DBUser[];
  sheets: DBSheet[];
  items: DBItem[];
  settings: DBSettings;
}

// Initial Seed Data (strictly matching the user's prompt specifications)
function getInitialSeedData(): DatabaseSchema {
  const defaultSettings: DBSettings = {
    id: 'settings-1',
    organization_name: 'ONG F4',
    organization_subname: 'Trésorière — Gestion des Achats & Caisse',
    treasurer_name: 'Rasoa Trésorière',
    manager_name: 'Rakoto Responsable',
    email: 'tresoriere@ongf4.mg',
    phone: '+261 34 00 000 00',
    address: 'Madagascar',
    currency_symbol: 'Ar',
    default_session: 'MATIN',
    updated_at: new Date().toISOString(),
  };

  const defaultUsers: DBUser[] = [
    {
      id: 'usr-1',
      name: 'Rasoa Trésorière',
      email: 'tresoriere@fianarana.mg',
      passwordHash: 'admin123',
      role: 'treasurer',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr-2',
      name: 'Rakoto Responsable',
      email: 'admin@tresorerie.mg',
      passwordHash: 'admin123',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  ];

  // Seed Sheet 1: Exact replicate of user handwritten sheet (02/10/2026 MATINA MATIN)
  const sheet1Id = 'sheet-02-10-2026-matin';
  const items1: DBItem[] = [
    { id: 'item-1-1', purchase_sheet_id: sheet1Id, designation: 'Gouter', quantity: 23, unit: 'pièce', unit_price: 500, total: 11500, created_at: '2026-10-02T07:30:00.000Z' },
    { id: 'item-1-2', purchase_sheet_id: sheet1Id, designation: 'Sosoa', quantity: 10, unit: 'Kp', unit_price: 600, total: 6000, created_at: '2026-10-02T07:31:00.000Z' },
    { id: 'item-1-3', purchase_sheet_id: sheet1Id, designation: 'Kabaka filao maina', quantity: 20, unit: 'TK', unit_price: 1000, total: 20000, created_at: '2026-10-02T07:32:00.000Z' },
    { id: 'item-1-4', purchase_sheet_id: sheet1Id, designation: 'Vary alvandro', quantity: 80, unit: 'Kp', unit_price: 600, total: 48000, created_at: '2026-10-02T07:33:00.000Z' },
    { id: 'item-1-5', purchase_sheet_id: sheet1Id, designation: 'Felimafana', quantity: 4, unit: 'TK', unit_price: 500, total: 2000, created_at: '2026-10-02T07:34:00.000Z' },
    { id: 'item-1-6', purchase_sheet_id: sheet1Id, designation: 'Tomate', quantity: 10, unit: 'pièce', unit_price: 100, total: 1000, created_at: '2026-10-02T07:35:00.000Z' },
    { id: 'item-1-7', purchase_sheet_id: sheet1Id, designation: 'Tongolo', quantity: 10, unit: 'pièce', unit_price: 100, total: 1000, created_at: '2026-10-02T07:36:00.000Z' },
    { id: 'item-1-8', purchase_sheet_id: sheet1Id, designation: 'Angivy', quantity: 3, unit: 'TK', unit_price: 500, total: 1500, created_at: '2026-10-02T07:37:00.000Z' },
  ];
  const totalExpenses1 = items1.reduce((acc, curr) => acc + curr.total, 0); // 91 000 Ar
  const cashReceived1 = 100000;
  const balance1 = cashReceived1 - totalExpenses1; // 9 000 Ar

  const sheet1: DBSheet = {
    id: sheet1Id,
    sheet_number: '02/10/2026',
    date: '2026-10-02',
    session: 'MATIN',
    cash_received: cashReceived1,
    total_expenses: totalExpenses1,
    balance: balance1,
    notes: 'Achats matina matin - Fiche N° 02/10/2026',
    created_by: 'usr-1',
    created_by_name: 'Rasoa Trésorière',
    created_at: '2026-10-02T08:00:00.000Z',
    updated_at: '2026-10-02T08:00:00.000Z',
  };

  // Seed Sheet 2: 05/10/2026 APRÈS-MIDI
  const sheet2Id = 'sheet-05-10-2026-apres-midi';
  const items2: DBItem[] = [
    { id: 'item-2-1', purchase_sheet_id: sheet2Id, designation: 'Batata', quantity: 20, unit: 'TK', unit_price: 2000, total: 40000, created_at: '2026-10-05T13:30:00.000Z' },
    { id: 'item-2-2', purchase_sheet_id: sheet2Id, designation: 'Vary atiana', quantity: 64, unit: 'kg', unit_price: 600, total: 38400, created_at: '2026-10-05T13:31:00.000Z' },
    { id: 'item-2-3', purchase_sheet_id: sheet2Id, designation: 'Flao filapia maina', quantity: 10, unit: 'TK', unit_price: 4000, total: 40000, created_at: '2026-10-05T13:32:00.000Z' },
    { id: 'item-2-4', purchase_sheet_id: sheet2Id, designation: 'Felifanafana', quantity: 4, unit: 'TK', unit_price: 500, total: 2000, created_at: '2026-10-05T13:33:00.000Z' },
    { id: 'item-2-5', purchase_sheet_id: sheet2Id, designation: 'Tomate', quantity: 10, unit: 'pièce', unit_price: 100, total: 1000, created_at: '2026-10-05T13:34:00.000Z' },
    { id: 'item-2-6', purchase_sheet_id: sheet2Id, designation: 'Tongolo', quantity: 10, unit: 'pièce', unit_price: 100, total: 1000, created_at: '2026-10-05T13:35:00.000Z' },
    { id: 'item-2-7', purchase_sheet_id: sheet2Id, designation: 'Mahango', quantity: 20, unit: 'TK', unit_price: 1000, total: 20000, created_at: '2026-10-05T13:36:00.000Z' },
    { id: 'item-2-8', purchase_sheet_id: sheet2Id, designation: 'Sira', quantity: 1, unit: 'kg', unit_price: 1300, total: 1300, created_at: '2026-10-05T13:37:00.000Z' },
  ];
  const totalExpenses2 = items2.reduce((acc, curr) => acc + curr.total, 0); // 143700
  const cashReceived2 = 150000;
  const balance2 = cashReceived2 - totalExpenses2; // 6300

  const sheet2: DBSheet = {
    id: sheet2Id,
    sheet_number: '002/10/2026',
    date: '2026-10-05',
    session: 'APRÈS-MIDI',
    cash_received: cashReceived2,
    total_expenses: totalExpenses2,
    balance: balance2,
    notes: 'Achats pour le dîner et condiments.',
    created_by: 'usr-1',
    created_by_name: 'Rasoa Trésorière',
    created_at: '2026-10-05T14:00:00.000Z',
    updated_at: '2026-10-05T14:00:00.000Z',
  };

  return {
    users: defaultUsers,
    sheets: [sheet2, sheet1],
    items: [...items1, ...items2],
    settings: defaultSettings,
  };
}

// Database helper functions
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading db.json, re-initializing:', err);
    const initialData = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database:', err);
    throw new Error('Database write error');
  }
}

// Global DB in-memory cache synchronized with disk
let db = initDatabase();

// Generate Next Sheet Number (e.g. 003/10/2026)
function generateNextSheetNumber(dateStr: string): string {
  const parts = dateStr.split('-');
  const month = parts.length === 3 ? parts[1] : '10';
  const year = parts.length === 3 ? parts[0] : '2026';

  const pattern = new RegExp(`^(\\d+)/${month}/${year}$`);
  let maxNum = 0;

  for (const sheet of db.sheets) {
    const match = sheet.sheet_number.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  const numStr = String(nextNum).padStart(3, '0');
  return `${numStr}/${month}/${year}`;
}

// Simple Token-based auth helper
function getUserFromAuthHeader(req: Request): DBUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  // Simple token format: user_{id} or email
  const user = db.users.find((u) => u.id === token || u.email === token || `token_${u.id}` === token);
  return user || db.users[0]; // fallback to primary treasurer if demo
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/identifiant et mot de passe obligatoires' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase() === cleanEmail
  );

  if (!user || user.passwordHash !== String(password).trim()) {
    return res.status(401).json({ error: 'Identifiants incorrects. Veuillez réessayer.' });
  }

  const token = `token_${user.id}`;
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
  }

  const newUser: DBUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: String(password).trim(),
    role: role || 'treasurer',
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase(db);

  const token = `token_${newUser.id}`;
  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({ token, user: safeUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// 2. Settings routes
app.get('/api/settings', (req: Request, res: Response) => {
  return res.json(db.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updateData = req.body;
  db.settings = {
    ...db.settings,
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  saveDatabase(db);
  return res.json(db.settings);
});

// 3. Purchase Sheets routes (CRUD)

// GET /api/sheets
app.get('/api/sheets', (req: Request, res: Response) => {
  const { startDate, endDate, session, search } = req.query;

  let sheets = [...db.sheets];

  if (startDate) {
    sheets = sheets.filter((s) => s.date >= String(startDate));
  }
  if (endDate) {
    sheets = sheets.filter((s) => s.date <= String(endDate));
  }
  if (session && session !== 'ALL') {
    sheets = sheets.filter((s) => s.session === session);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    sheets = sheets.filter((s) => {
      const matchNum = s.sheet_number.toLowerCase().includes(q);
      const matchNotes = (s.notes || '').toLowerCase().includes(q);
      // check if any item matches designation
      const sheetItems = db.items.filter((it) => it.purchase_sheet_id === s.id);
      const matchItems = sheetItems.some((it) => it.designation.toLowerCase().includes(q));
      return matchNum || matchNotes || matchItems;
    });
  }

  // Sort by date desc, then by session (après-midi first if same date), then created_at desc
  sheets.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    if (a.session !== b.session) {
      return a.session === 'APRÈS-MIDI' ? -1 : 1;
    }
    return b.created_at.localeCompare(a.created_at);
  });

  // Attach items to each sheet
  const sheetsWithItems = sheets.map((s) => ({
    ...s,
    items: db.items.filter((it) => it.purchase_sheet_id === s.id),
  }));

  return res.json(sheetsWithItems);
});

// GET /api/sheets/:id
app.get('/api/sheets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sheet = db.sheets.find((s) => s.id === id);
  if (!sheet) {
    return res.status(404).json({ error: 'Fiche introuvable' });
  }

  const items = db.items.filter((it) => it.purchase_sheet_id === sheet.id);
  return res.json({ ...sheet, items });
});

// POST /api/sheets (Create new sheet with items and signatures)
app.post('/api/sheets', (req: Request, res: Response) => {
  const { date, session, cash_received, notes, items, signature_treasurer, signature_manager } = req.body;

  // Validation
  if (!date) {
    return res.status(400).json({ error: 'La date est obligatoire' });
  }
  if (!session || (session !== 'MATIN' && session !== 'APRÈS-MIDI')) {
    return res.status(400).json({ error: 'Veuillez sélectionner la session (MATIN ou APRÈS-MIDI)' });
  }
  if (cash_received === undefined || cash_received === null || Number(cash_received) < 0) {
    return res.status(400).json({ error: 'Le montant du vola teo am-pelatanana / vola nomena est obligatoire et doit être positif' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Veuillez ajouter au moins un article dans la liste des achats' });
  }

  // Validate each item
  const validItems: DBItem[] = [];
  const sheetId = `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  let calculatedTotalExpenses = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const designation = String(item.designation || '').trim();
    const quantity = Number(item.quantity);
    const unit = String(item.unit || '').trim();
    const unit_price = Number(item.unit_price);

    if (!designation) {
      return res.status(400).json({ error: `Article N°${i + 1} : La désignation est obligatoire` });
    }
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: `Article "${designation}" : La quantité doit être supérieure à 0` });
    }
    if (isNaN(unit_price) || unit_price < 0) {
      return res.status(400).json({ error: `Article "${designation}" : Le prix unitaire doit être positif ou égal à 0` });
    }

    const lineTotal = Math.round(quantity * unit_price);
    calculatedTotalExpenses += lineTotal;

    validItems.push({
      id: `item-${sheetId}-${i + 1}`,
      purchase_sheet_id: sheetId,
      designation,
      quantity,
      unit: unit || 'pièce',
      unit_price,
      total: lineTotal,
      created_at: new Date().toISOString(),
    });
  }

  const numCashReceived = Number(cash_received);
  const calculatedBalance = numCashReceived - calculatedTotalExpenses;
  const sheetNumber = generateNextSheetNumber(date);

  const user = getUserFromAuthHeader(req);

  const newSheet: DBSheet = {
    id: sheetId,
    sheet_number: sheetNumber,
    date,
    session,
    cash_received: numCashReceived,
    total_expenses: calculatedTotalExpenses,
    balance: calculatedBalance,
    notes: notes ? String(notes).trim() : undefined,
    signature_treasurer: signature_treasurer || undefined,
    signature_manager: signature_manager || undefined,
    signed_treasurer_at: signature_treasurer ? new Date().toISOString() : undefined,
    signed_manager_at: signature_manager ? new Date().toISOString() : undefined,
    created_by: user ? user.id : 'usr-1',
    created_by_name: user ? user.name : db.settings.treasurer_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.sheets.unshift(newSheet);
  db.items.push(...validItems);
  saveDatabase(db);

  return res.status(201).json({ ...newSheet, items: validItems });
});

// PUT /api/sheets/:id (Update existing sheet and its items)
app.put('/api/sheets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, session, cash_received, notes, items, signature_treasurer, signature_manager } = req.body;

  const sheetIndex = db.sheets.findIndex((s) => s.id === id);
  if (sheetIndex === -1) {
    return res.status(404).json({ error: 'Fiche introuvable' });
  }

  if (!date) {
    return res.status(400).json({ error: 'La date est obligatoire' });
  }
  if (!session || (session !== 'MATIN' && session !== 'APRÈS-MIDI')) {
    return res.status(400).json({ error: 'Veuillez sélectionner la session (MATIN ou APRÈS-MIDI)' });
  }
  if (cash_received === undefined || cash_received === null || Number(cash_received) < 0) {
    return res.status(400).json({ error: 'Le montant du vola nomena est obligatoire' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Veuillez ajouter au moins un article' });
  }

  // Validate items
  const validItems: DBItem[] = [];
  let calculatedTotalExpenses = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const designation = String(item.designation || '').trim();
    const quantity = Number(item.quantity);
    const unit = String(item.unit || '').trim();
    const unit_price = Number(item.unit_price);

    if (!designation) {
      return res.status(400).json({ error: `Article N°${i + 1} : La désignation est obligatoire` });
    }
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: `Article "${designation}" : La quantité doit être supérieure à 0` });
    }
    if (isNaN(unit_price) || unit_price < 0) {
      return res.status(400).json({ error: `Article "${designation}" : Le prix unitaire doit être valide` });
    }

    const lineTotal = Math.round(quantity * unit_price);
    calculatedTotalExpenses += lineTotal;

    validItems.push({
      id: item.id || `item-${id}-${i + 1}-${Date.now()}`,
      purchase_sheet_id: id,
      designation,
      quantity,
      unit: unit || 'pièce',
      unit_price,
      total: lineTotal,
      created_at: item.created_at || new Date().toISOString(),
    });
  }

  const numCashReceived = Number(cash_received);
  const calculatedBalance = numCashReceived - calculatedTotalExpenses;

  const existingSheet = db.sheets[sheetIndex];
  const updatedSheet: DBSheet = {
    ...existingSheet,
    date,
    session,
    cash_received: numCashReceived,
    total_expenses: calculatedTotalExpenses,
    balance: calculatedBalance,
    notes: notes ? String(notes).trim() : undefined,
    signature_treasurer: signature_treasurer !== undefined ? signature_treasurer : existingSheet.signature_treasurer,
    signature_manager: signature_manager !== undefined ? signature_manager : existingSheet.signature_manager,
    signed_treasurer_at: signature_treasurer ? new Date().toISOString() : existingSheet.signed_treasurer_at,
    signed_manager_at: signature_manager ? new Date().toISOString() : existingSheet.signed_manager_at,
    updated_at: new Date().toISOString(),
  };

  db.sheets[sheetIndex] = updatedSheet;

  // Replace items
  db.items = db.items.filter((it) => it.purchase_sheet_id !== id).concat(validItems);
  saveDatabase(db);

  return res.json({ ...updatedSheet, items: validItems });
});

// PATCH /api/sheets/:id/signature (Quick sign by role)
app.patch('/api/sheets/:id/signature', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, signatureDataUrl } = req.body;

  const sheetIndex = db.sheets.findIndex((s) => s.id === id);
  if (sheetIndex === -1) {
    return res.status(404).json({ error: 'Fiche introuvable' });
  }

  const existingSheet = db.sheets[sheetIndex];
  const updatedSheet: DBSheet = {
    ...existingSheet,
    updated_at: new Date().toISOString(),
  };

  if (role === 'treasurer') {
    updatedSheet.signature_treasurer = signatureDataUrl || undefined;
    updatedSheet.signed_treasurer_at = signatureDataUrl ? new Date().toISOString() : undefined;
  } else if (role === 'manager') {
    updatedSheet.signature_manager = signatureDataUrl || undefined;
    updatedSheet.signed_manager_at = signatureDataUrl ? new Date().toISOString() : undefined;
  }

  db.sheets[sheetIndex] = updatedSheet;
  saveDatabase(db);

  const items = db.items.filter((it) => it.purchase_sheet_id === id);
  return res.json({ ...updatedSheet, items });
});

// DELETE /api/sheets/:id
app.delete('/api/sheets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sheetIndex = db.sheets.findIndex((s) => s.id === id);
  if (sheetIndex === -1) {
    return res.status(404).json({ error: 'Fiche introuvable' });
  }

  const deletedSheet = db.sheets.splice(sheetIndex, 1)[0];
  db.items = db.items.filter((it) => it.purchase_sheet_id !== id);
  saveDatabase(db);

  return res.json({ success: true, message: `Fiche ${deletedSheet.sheet_number} supprimée`, id });
});

// 4. Stats & Dashboard API
app.get('/api/stats', (req: Request, res: Response) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Sheets for today (or fallback to latest active date if today has none yet)
  const sheetsToday = db.sheets.filter((s) => s.date === todayStr);

  const todayExpenses = sheetsToday.reduce((acc, s) => acc + s.total_expenses, 0);
  const todayCashReceived = sheetsToday.reduce((acc, s) => acc + s.cash_received, 0);
  const todayBalance = todayCashReceived - todayExpenses;

  // Latest overall cash on hand
  const sortedSheets = [...db.sheets].sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  const latestSheet = sortedSheets[0];
  const cashOnHand = latestSheet ? (sheetsToday.length > 0 ? todayBalance : latestSheet.balance) : 0;

  const recentSheets = sortedSheets.slice(0, 5).map((s) => ({
    ...s,
    items: db.items.filter((it) => it.purchase_sheet_id === s.id),
  }));

  return res.json({
    cashOnHand,
    todayExpenses,
    todayCashReceived,
    todayBalance,
    totalSheetsCount: db.sheets.length,
    sheetsTodayCount: sheetsToday.length,
    recentSheets,
  });
});

// 5. Reports API
app.get('/api/reports', (req: Request, res: Response) => {
  const { period = 'month', startDate, endDate } = req.query;

  const now = new Date();
  let start = '';
  let end = '';
  let periodLabel = '';

  if (period === 'today') {
    const dStr = now.toISOString().split('T')[0];
    start = dStr;
    end = dStr;
    periodLabel = "Aujourd'hui (" + dStr + ')';
  } else if (period === 'week') {
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    start = firstDay.toISOString().split('T')[0];
    end = lastDay.toISOString().split('T')[0];
    periodLabel = `Cette semaine (${start} au ${end})`;
  } else if (period === 'month') {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    start = `${year}-${month}-01`;
    const lastDate = new Date(year, now.getMonth() + 1, 0).getDate();
    end = `${year}-${month}-${String(lastDate).padStart(2, '0')}`;
    periodLabel = `Ce mois (${month}/${year})`;
  } else if (startDate && endDate) {
    start = String(startDate);
    end = String(endDate);
    periodLabel = `Du ${start} au ${end}`;
  } else {
    start = '2020-01-01';
    end = '2099-12-31';
    periodLabel = 'Toutes les périodes';
  }

  const filteredSheets = db.sheets.filter((s) => s.date >= start && s.date <= end);

  // Group by date
  const dateMap = new Map<string, DBSheet[]>();
  for (const s of filteredSheets) {
    const list = dateMap.get(s.date) || [];
    list.push(s);
    dateMap.set(s.date, list);
  }

  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

  const breakdown = sortedDates.map((dateKey) => {
    const dateSheets = dateMap.get(dateKey) || [];
    const matinSheets = dateSheets.filter((s) => s.session === 'MATIN');
    const apresMidiSheets = dateSheets.filter((s) => s.session === 'APRÈS-MIDI');

    const matinExpense = matinSheets.reduce((acc, s) => acc + s.total_expenses, 0);
    const matinCash = matinSheets.reduce((acc, s) => acc + s.cash_received, 0);

    const apresMidiExpense = apresMidiSheets.reduce((acc, s) => acc + s.total_expenses, 0);
    const apresMidiCash = apresMidiSheets.reduce((acc, s) => acc + s.cash_received, 0);

    const totalExpense = matinExpense + apresMidiExpense;
    const totalCash = matinCash + apresMidiCash;
    const balance = totalCash - totalExpense;

    return {
      date: dateKey,
      matinExpense,
      matinCash,
      apresMidiExpense,
      apresMidiCash,
      totalExpense,
      totalCash,
      balance,
      sheets: dateSheets.map((s) => ({
        ...s,
        items: db.items.filter((it) => it.purchase_sheet_id === s.id),
      })),
    };
  });

  const totalCashReceived = filteredSheets.reduce((acc, s) => acc + s.cash_received, 0);
  const totalExpenses = filteredSheets.reduce((acc, s) => acc + s.total_expenses, 0);
  const totalBalance = totalCashReceived - totalExpenses;

  return res.json({
    periodLabel,
    totalCashReceived,
    totalExpenses,
    totalBalance,
    sheetCount: filteredSheets.length,
    breakdown,
  });
});

// 6. Reset demo database
app.post('/api/reset-demo', (req: Request, res: Response) => {
  db = getInitialSeedData();
  saveDatabase(db);
  return res.json({ success: true, message: 'Base de données réinitialisée avec les données de démonstration.' });
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite in Dev / Static in Prod)
// ----------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Application running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
