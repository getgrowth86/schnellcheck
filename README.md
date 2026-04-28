# Zwergengruppe Elterngeld-Schnellcheck

**Deployment-ready Projekt für Vercel + Google Sheets**

---

## 📋 Struktur

```
zwergengruppe-project/
├── pages/
│   ├── api/
│   │   └── submit-to-sheets.js    (API Function)
│   └── index.jsx                   (Main App)
├── package.json
├── vercel.json
├── next.config.js
└── .gitignore
```

---

## 🚀 Deployment zu Vercel

### Option 1: Über GitHub (empfohlen)

1. **GitHub Repo erstellen**
   - https://github.com/new
   - Name: `zwergengruppe-schnellcheck`
   - Public/Private: Deine Wahl

2. **Lokal pushen**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/zwergengruppe-schnellcheck.git
   git push -u origin main
   ```

3. **Zu Vercel deployen**
   - https://vercel.com/new
   - "Import Git Repository"
   - Dein GitHub Repo wählen
   - Deploy

### Option 2: Über Vercel CLI

```bash
npm i -g vercel
vercel login
vercel deploy
```

---

## 🔧 Environment Variables in Vercel

1. Vercel Dashboard → Projekt → Settings → Environment Variables
2. Füge diese zwei hinzu:

**GOOGLE_SHEET_ID**
```
1bSggJ7yubCzRsEQrzenFTRF8JkF6WWo6hRZcAfQto9A
```

**GOOGLE_SERVICE_ACCOUNT**
```
{komplettes JSON von Google Cloud}
```

3. **Redeploy** nach dem Hinzufügen!

---

## ✅ Testing

Nach Deployment:
1. Öffne deine Vercel URL
2. Geh durch den Schnellcheck
3. Gib Test-Daten ein
4. Prüfe deine **Google Sheet** — Daten sollten dort sein!

---

## 📊 Google Sheet Setup

Spalten in Sheet1:
- A: Timestamp
- B: Name
- C: Email
- D: Telefon
- E: Uhrzeit
- F: Arbeitsmodell
- G: Einkommen
- H: Geschwister
- I: EG_Ohne
- J: EG_Mit
- K: Unterschied
- L: Preis

---

## 🐛 Troubleshooting

**API Error 500?**
- Prüfe deine Environment Variables
- Google Sheet ist mit Service Account geteilt? ✓

**Daten erscheinen nicht in Sheet?**
- Vercel Logs prüfen: `vercel logs`
- Service Account Email hat Zugriff auf Sheet?

---

## 📝 Nächste Schritte

- [ ] Email-Versand einrichten (optional)
- [ ] Domain anpassen (CNAME)
- [ ] Analytics einbauen

---

**Ready to go! 🚀**
