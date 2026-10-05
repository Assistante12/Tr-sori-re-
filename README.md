# Trésorière ONG F4 — Application de Gestion des Achats & Caisse

Application web full-stack professionnelle conçue pour la gestion quotidienne des achats, des approvisionnements et de la trésorerie de l'**ONG F4**.

---

## 🚀 Fomba Fametrahana azy amin'ny RENDER (Guide de Déploiement Render)

Ity tetikasa ity dia efa namboarina tanteraka mba hahafahana mametraka azy mivantana amin'ny **[Render.com](https://render.com)** amin'ny fomba tsotra sy haingana.

### Safidy 1 : Déploiement Automatique amin'ny alalan'ny Blueprint (`render.yaml`)

1. Ampidiro ao amin'ny **GitHub** na **GitLab** ity tetikasa ity (Push repository).
2. Midira ao amin'ny kaontinao ao amin'ny **[Render Dashboard](https://dashboard.render.com/)**.
3. Tsindrio ny **New +** avy eo safidio ny **Blueprint**.
4. Safidio ny repository misy ity tetikasa ity.
5. Render dia hamaky avy hatrany ny fisie `render.yaml` ka hametraka ny configurations rehetra ho azy :
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Environment** : `Node`
6. Tsindrio ny **Apply** mba hanombohana ny fametrahana azy (Deploy).

---

### Safidy 2 : Déploiement Manual (Web Service)

Raha hamorona **Web Service** vaovao amin'ny tanana ianao ao amin'ny Render :

1. Ao amin'ny Render Dashboard, tsindrio ny **New +** > **Web Service**.
2. Ampifandraiso ny **GitHub repository** misy ny kaodinao.
3. Fenoy ireto masontsivana (paramètres) ireto :
   - **Name** : `tresoriere-ong-f4`
   - **Region** : `Frankfurt (EU Central)` na `Oregon (US West)`
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Instance Type** : `Free`
4. Ao amin'ny fizarana **Environment Variables** (Advanced) :
   - Ampio : `NODE_ENV` = `production`
5. *(Safidy fanampiny)* Raha mampiasa **Render Persistent Disk** ianao mba hitahirizana ny tahiry mandrakizay na dia misy restart aza ny server :
   - Ampidiro ny Disk amin'ny Mount Path `/data`
   - Ampio ny Environment Variable : `DATA_DIR` = `/data`
6. Tsindrio ny **Create Web Service**.

Afaka 1 hatramin'ny 2 minitra dia hisy rohy (URL) mivantana ohatra : `https://tresoriere-ong-f4.onrender.com` azon'ny rehetra ampiasaina amin'ny solosaina sy telefaonina.

---

## 🔑 Kaonty Fidirana Voalohany (Comptes de Démonstration)

- **Trésorière** : `tresoriere@ongf4.mg` | Teny miafina : `admin123`
- **Responsable** : `admin@tresorerie.mg` | Teny miafina : `admin123`

---

## 🛠️ Fampandehanana eo an-toerana (Développement Local)

```bash
# 1. Fametrahana ny dependances
npm install

# 2. Fampandehanana ny server dev (Fullstack Express + Vite)
npm run dev

# 3. Fanamboarana ny build ho an'ny production
npm run build

# 4. Fandefasana ny production server
npm start
```
