import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/services/storage';
import { priorisiereSchulden, berechneStatistiken } from '@/services/algorithmen';
import { Schuld, Forderung } from '@/types';

const Optimierung = () => {
  const navigate = useNavigate();
  const [schuldnerId, setSchuldnerId] = useState('');
  const [schulden, setSchulden] = useState<Schuld[]>([]);
  const [priorisierteSchulden, setPriorisierteSchulden] = useState<Schuld[]>([]);
  const [statistiken, setStatistiken] = useState<ReturnType<typeof berechneStatistiken> | null>(null);

  const handleSuche = () => {
    if (!schuldnerId.trim()) return;

    const data = storage.loadData();
    const gefundeneSchulden = data.schulden.filter(
      s => s.schuldner_id.toLowerCase() === schuldnerId.trim().toLowerCase()
    );

    // Kooperationsscores sammeln
    const koopScores = new Map<string, number>();
    data.forderungen.forEach((f: Forderung) => {
      koopScores.set(f.glaeubiger_id, f.kooperationsscore);
    });

    setSchulden(gefundeneSchulden);
    setPriorisierteSchulden(priorisiereSchulden(gefundeneSchulden, koopScores));
    setStatistiken(berechneStatistiken(gefundeneSchulden));
  };

  useEffect(() => {
    // Auto-load wenn nur ein Schuldner existiert
    const data = storage.loadData();
    const schuldnerIds = new Set(data.schulden.map(s => s.schuldner_id));
    if (schuldnerIds.size === 1) {
      const einzigeId = Array.from(schuldnerIds)[0];
      setSchuldnerId(einzigeId);
      setTimeout(() => {
        const gefundeneSchulden = data.schulden.filter(s => s.schuldner_id === einzigeId);
        const koopScores = new Map<string, number>();
        data.forderungen.forEach((f: Forderung) => {
          koopScores.set(f.glaeubiger_id, f.kooperationsscore);
        });
        setSchulden(gefundeneSchulden);
        setPriorisierteSchulden(priorisiereSchulden(gefundeneSchulden, koopScores));
        setStatistiken(berechneStatistiken(gefundeneSchulden));
      }, 100);
    }
  }, []);

  const getPrioritaet = (index: number) => {
    if (index === 0) return { label: 'HÖCHSTE', variant: 'destructive' as const };
    if (index === 1) return { label: 'HOCH', variant: 'default' as const };
    return { label: 'MITTEL', variant: 'secondary' as const };
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          ← Zurück zur Startseite
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Optimierung der Rückzahlungsstrategie</CardTitle>
            <CardDescription>
              Sieh deine Schulden und die optimale Rückzahlungsreihenfolge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="schuldner_id">Schuldner-ID</Label>
                <Input
                  id="schuldner_id"
                  value={schuldnerId}
                  onChange={(e) => setSchuldnerId(e.target.value)}
                  placeholder="z.B. G123"
                  onKeyDown={(e) => e.key === 'Enter' && handleSuche()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSuche}>Suchen</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {statistiken && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{statistiken.gesamtSchuld.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground">Gesamtschuld</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{statistiken.gesamtRestbetrag.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground">Noch offen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{statistiken.gesamtGezahlt.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground">Bereits gezahlt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{statistiken.durchschnittlicherZins.toFixed(2)} %</div>
                <p className="text-xs text-muted-foreground">Ø Zinssatz</p>
              </CardContent>
            </Card>
          </div>
        )}

        {priorisierteSchulden.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Priorisierte Schulden ({priorisierteSchulden.length})</CardTitle>
              <CardDescription>
                Sortiert nach: 1. Zinssatz (höher zuerst), 2. Restbetrag (niedriger zuerst), 3. Kooperationsscore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Gläubiger</TableHead>
                    <TableHead className="text-right">Zinssatz</TableHead>
                    <TableHead className="text-right">Ursprung</TableHead>
                    <TableHead className="text-right">Restbetrag</TableHead>
                    <TableHead className="text-right">Gezahlt</TableHead>
                    <TableHead>Kommentar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priorisierteSchulden.map((schuld, index) => {
                    const prioritaet = getPrioritaet(index);
                    const gezahlt = schuld.zahlungen.reduce((sum, z) => sum + z.betrag, 0);
                    
                    return (
                      <TableRow key={schuld.id}>
                        <TableCell>
                          <Badge variant={prioritaet.variant}>
                            #{index + 1} {prioritaet.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{schuld.glaeubiger_id}</TableCell>
                        <TableCell className="text-right font-semibold">{schuld.zins.toFixed(2)} %</TableCell>
                        <TableCell className="text-right">{schuld.betrag.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          <span className={schuld.restbetrag === 0 ? 'text-green-600 font-semibold' : ''}>
                            {schuld.restbetrag.toFixed(2)} €
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {gezahlt.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {schuld.kommentar || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">💡 Empfehlung</h3>
                <p className="text-sm text-muted-foreground">
                  Zahle Schulden in der oben genannten Reihenfolge zurück, um deine Gesamtkosten
                  (Zinsen) zu minimieren. Schulden mit hohen Zinsen haben Vorrang, kleine Restbeträge
                  können schnell beglichen werden.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : schulden.length > 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Alle Schulden wurden bereits beglichen! 🎉
              </p>
            </CardContent>
          </Card>
        ) : schuldnerId ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Keine Schulden für "{schuldnerId}" gefunden.
              </p>
              <Button onClick={() => navigate('/schuld-erfassen')}>
                Schuld eintragen
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Optimierung;
