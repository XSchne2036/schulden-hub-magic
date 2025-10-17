# Schulden-Management MVP

Eine vollständig eigenständige React-Webapp zur Verwaltung und Optimierung von Schulden zwischen drei Parteien: **Schuldner (G)**, **Gläubiger (S)** und **Zahler (K)**.

## ✨ Features

- 📊 **Schulden erfassen** (Schuldner-Sicht)
- 🧾 **Forderungen verwalten** (Gläubiger-Sicht)  
- 💰 **Zahlungen melden** (Zahler-Sicht)
- 🎯 **Optimierte Rückzahlungsstrategie** mit Priorisierungs-Algorithmus
- 🔄 **Automatische Pool-Verteilung** basierend auf Zinsen, Restbeträgen und Kooperationsscores
- 💾 **Import/Export als JSON** für Datensicherung
- 🔒 **100% lokale Datenhaltung** im Browser (localStorage)

## 🚀 Schnellstart

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18 oder höher)
- npm (wird mit Node.js installiert)

### Installation

```bash
# Repository klonen
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist nun unter `http://localhost:8080` erreichbar.

### Produktions-Build erstellen

```bash
# Statische Dateien erstellen
npm run build
```

Die fertigen Dateien befinden sich im Ordner `dist/` und können auf jeden Webserver hochgeladen werden.

## 📦 Deployment (Statisches Hosting)

Die App ist eine reine Single-Page-Application ohne Backend-Abhängigkeiten.

### Deployment per FTP

1. Führe `npm run build` aus
2. Lade den kompletten Inhalt des `dist/` Ordners auf deinen Webspace hoch
3. Stelle sicher, dass alle Anfragen auf `index.html` umgeleitet werden (SPA-Routing)

### Empfohlene Hosting-Anbieter (kostenlos)

- [Netlify](https://netlify.com) - Drag & Drop des `dist/` Ordners
- [Vercel](https://vercel.com) - Automatisches Deployment via Git
- [GitHub Pages](https://pages.github.com) - Kostenlos für öffentliche Repos
- [Cloudflare Pages](https://pages.cloudflare.com) - Schnelles CDN inklusive

### Apache .htaccess (für SPA-Routing)

Falls du Apache verwendest, lege eine `.htaccess` im `dist/` Ordner an:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🏗️ Architektur

### Technologie-Stack

- **React 18** - UI-Framework
- **TypeScript** - Typsicherheit
- **Vite** - Build-Tool & Dev-Server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI-Komponenten (Open Source)
- **React Router** - Client-seitiges Routing
- **localStorage** - Persistierung (keine Datenbank nötig)

### Projektstruktur

```
├── src/
│   ├── components/        # Wiederverwendbare UI-Komponenten
│   ├── pages/             # Haupt-Seiten der App
│   │   ├── Home.tsx           # Startseite
│   │   ├── SchuldErfassen.tsx # Schulden eintragen (G)
│   │   ├── ForderungErfassen.tsx # Forderungen eintragen (S)
│   │   ├── ZahlungMelden.tsx  # Zahlungen melden (K)
│   │   ├── Optimierung.tsx    # Rückzahlungs-Optimierung
│   │   ├── Pool.tsx           # Pool-Verwaltung
│   │   └── ImportExport.tsx   # Daten sichern/wiederherstellen
│   ├── services/          # Business-Logik
│   │   ├── storage.ts         # localStorage-Verwaltung
│   │   └── algorithmen.ts     # Priorisierung & Pool-Verteilung
│   ├── types/             # TypeScript-Typen
│   │   └── index.ts
│   ├── App.tsx            # Hauptkomponente
│   └── main.tsx           # Einstiegspunkt
├── dist/                  # Build-Output (nach npm run build)
├── index.html             # HTML-Template
├── package.json           # Dependencies
└── README.md              # Diese Datei
```

## 🧮 Algorithmen

### Priorisierungs-Algorithmus (Optimierung)

Schulden werden nach folgenden Regeln sortiert:

1. **Zinssatz** (höher = höhere Priorität)
2. **Restbetrag** (niedriger = höhere Priorität)  
3. **Kooperationsscore** des Gläubigers (höher = höhere Priorität)

**Code:** `src/services/algorithmen.ts` → `priorisiereSchulden()`

### Pool-Verteilungs-Algorithmus

Verfügbare Mittel werden gewichtet verteilt:

```
Gewichtung = zins² + (1 / restbetrag) + kooperationsscore^1.5
```

**Erklärung:**
- **zins²**: Hohe Zinsen werden stark gewichtet (exponentiell)
- **1/restbetrag**: Kleine Beträge können schneller abbezahlt werden
- **kooperationsscore^1.5**: Kooperative Gläubiger werden bevorzugt

**Code:** `src/services/algorithmen.ts` → `verteilePool()`

## 💾 Datenstruktur (localStorage)

Alle Daten werden als JSON im Browser gespeichert:

```json
{
  "schulden": [
    {
      "id": "...",
      "schuldner_id": "G123",
      "glaeubiger_id": "S202",
      "betrag": 120.0,
      "restbetrag": 70.0,
      "zins": 5.0,
      "kommentar": "Autoreparatur",
      "erstellt_am": "2025-10-17T10:30:00.000Z",
      "zahlungen": [
        {
          "id": "...",
          "zahler_name": "K345",
          "betrag": 50.0,
          "datum": "2025-10-17T12:00:00.000Z"
        }
      ]
    }
  ],
  "forderungen": [...],
  "pool_historie": [...],
  "version": "1.0.0"
}
```

## 🔐 Sicherheit & Datenschutz

- ✅ **Keine externen APIs** - App läuft komplett offline-fähig
- ✅ **Keine Lovable Cloud Dependencies** - vollständig eigenständig
- ✅ **Keine Telemetrie** - kein Tracking, keine Analytics
- ✅ **Keine Credentials** - keine API-Keys notwendig
- ✅ **Lokale Datenhaltung** - Daten verlassen niemals den Browser
- ⚠️ **Backup empfohlen** - Bei Cache-Löschung gehen Daten verloren (nutze Import/Export)

## 📝 Nutzung

### Als Schuldner (G)

1. Gehe zu **"Schuld erfassen"**
2. Trage deine Schulden mit Zinssatz ein
3. Nutze **"Optimierung"**, um die beste Rückzahlungsreihenfolge zu sehen

### Als Gläubiger (S)

1. Gehe zu **"Forderung erfassen"**
2. Trage offene Forderungen ein
3. Vergebe einen Kooperationsscore (wichtig für Pool-Verteilung)

### Als Zahler (K)

1. Gehe zu **"Zahlung melden"**
2. Wähle die Schuld aus, für die du gezahlt hast
3. Betrag wird automatisch vom Restbetrag abgezogen

### Pool-Verwaltung

1. Gehe zu **"Pool"**
2. Gib verfügbaren Betrag ein
3. Klicke auf **"Vorschau berechnen"**
4. Überprüfe die Verteilung und führe sie durch

### Daten sichern

1. Gehe zu **"Import / Export"**
2. Klicke auf **"Als Datei herunterladen"**
3. Bewahre die JSON-Datei sicher auf

## 🧪 Entwicklung

### Verfügbare Scripts

```bash
npm run dev        # Entwicklungsserver (Port 8080)
npm run build      # Produktions-Build
npm run preview    # Build lokal testen
npm run lint       # Code-Linting
```

### Code-Qualität

- TypeScript für Typsicherheit
- ESLint für Code-Qualität
- Klare Kommentare in kritischen Bereichen
- Funktionstrennung (UI ↔ Logik)

## 📄 Lizenz

**MIT License**

Du darfst den Code frei verwenden, modifizieren und verteilen - auch kommerziell.

```
Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🆘 Support & FAQ

### Die App lädt nicht

- Lösche Browser-Cache und lade neu
- Stelle sicher, dass JavaScript aktiviert ist
- Teste in einem anderen Browser

### Daten sind weg

- Prüfe, ob du im gleichen Browser/Gerät bist
- Wurde der Browser-Cache gelöscht?
- Nutze regelmäßig die Export-Funktion für Backups

### Kann ich die App auf mehreren Geräten nutzen?

Ja, über die Import/Export-Funktion:
1. Exportiere Daten auf Gerät A
2. Übertrage JSON-Datei (z.B. per E-Mail)
3. Importiere auf Gerät B

## 🎯 Roadmap (Optional)

Mögliche Erweiterungen:

- [ ] Cloud-Sync via selbst-gehosteter API
- [ ] PDF-Export für Berichte
- [ ] Erinnerungen für Zahlungen
- [ ] Multi-Währungs-Support
- [ ] Erweiterte Statistiken & Charts

## 🤝 Beitragen

Du kannst den Code frei modifizieren. Bei Fragen oder Verbesserungsvorschlägen:
- Öffne ein Issue im Git-Repository
- Erstelle einen Pull Request

---

**Entwickelt mit Lovable.dev** - Ein Lovable-Projekt kann exportiert und vollständig selbst gehostet werden. Keine Vendor-Lock-Ins! 🚀
