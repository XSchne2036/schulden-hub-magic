import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/services/storage';

const ImportExport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const handleExport = () => {
    const data = storage.exportData();
    setExportData(data);
    toast({
      title: 'Export erfolgreich',
      description: 'Daten wurden exportiert',
    });
  };

  const handleDownload = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schulden-daten-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download gestartet',
      description: 'JSON-Datei wird heruntergeladen',
    });
  };

  const handleCopyToClipboard = () => {
    const data = storage.exportData();
    navigator.clipboard.writeText(data);
    toast({
      title: 'In Zwischenablage kopiert',
      description: 'Daten wurden kopiert',
    });
  };

  const handleImportConfirm = () => {
    if (!importData.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte JSON-Daten eingeben',
        variant: 'destructive',
      });
      return;
    }

    try {
      storage.importData(importData);
      toast({
        title: 'Import erfolgreich',
        description: 'Daten wurden importiert und ersetzt',
      });
      setImportData('');
      setShowImportConfirm(false);
      setExportData(''); // Export zurücksetzen
    } catch (error) {
      toast({
        title: 'Import fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ungültige Daten',
        variant: 'destructive',
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Wirklich ALLE Daten unwiderruflich löschen?')) {
      storage.clearData();
      toast({
        title: 'Daten gelöscht',
        description: 'Alle lokalen Daten wurden gelöscht',
      });
      setExportData('');
      setImportData('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setShowImportConfirm(true);
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          ← Zurück zur Startseite
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>📤 Daten exportieren</CardTitle>
              <CardDescription>
                Sichere deine Daten als JSON-Datei
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button onClick={handleExport} className="w-full">
                  Daten anzeigen
                </Button>
                <Button onClick={handleDownload} variant="outline" className="w-full">
                  Als Datei herunterladen
                </Button>
                <Button onClick={handleCopyToClipboard} variant="outline" className="w-full">
                  In Zwischenablage kopieren
                </Button>
              </div>

              {exportData && (
                <div className="space-y-2">
                  <Textarea
                    value={exportData}
                    readOnly
                    rows={10}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(new Blob([exportData]).size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📥 Daten importieren</CardTitle>
              <CardDescription>
                Stelle Daten aus einem vorherigen Export wieder her
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  ⚠️ Import ersetzt ALLE aktuellen Daten! Vorher exportieren.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                  className="w-full"
                >
                  JSON-Datei hochladen
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  value={importData}
                  onChange={(e) => {
                    setImportData(e.target.value);
                    setShowImportConfirm(false);
                  }}
                  placeholder="Oder JSON hier einfügen..."
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              {importData && !showImportConfirm && (
                <Button
                  onClick={() => setShowImportConfirm(true)}
                  variant="outline"
                  className="w-full"
                >
                  Import vorbereiten
                </Button>
              )}

              {showImportConfirm && (
                <div className="space-y-2">
                  <Alert variant="destructive">
                    <AlertDescription>
                      Aktuelle Daten werden überschrieben!
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button onClick={handleImportConfirm} className="flex-1">
                      Jetzt importieren
                    </Button>
                    <Button
                      onClick={() => setShowImportConfirm(false)}
                      variant="outline"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>⚙️ Daten-Verwaltung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="mb-2"><strong>💾 Lokale Speicherung</strong></p>
                <p className="text-muted-foreground mb-4">
                  Alle Daten werden ausschließlich in deinem Browser gespeichert (localStorage).
                  Es findet keine Übertragung an externe Server statt.
                </p>
                
                <p className="mb-2"><strong>🔒 Datensicherheit</strong></p>
                <p className="text-muted-foreground mb-4">
                  Nutze die Export-Funktion regelmäßig für Backups. Bei Browser-Cache-Löschung
                  gehen die Daten verloren!
                </p>

                <p className="mb-2"><strong>📋 Datenformat</strong></p>
                <p className="text-muted-foreground">
                  Export erfolgt als valides JSON mit allen Schulden, Forderungen, Zahlungen
                  und Pool-Verteilungen.
                </p>
              </div>

              <Button
                onClick={handleClearData}
                variant="destructive"
                className="w-full"
              >
                ⚠️ Alle Daten löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExport;
