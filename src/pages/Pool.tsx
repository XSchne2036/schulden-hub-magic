import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/services/storage';
import { verteilePool } from '@/services/algorithmen';
import { Schuld, Forderung, PoolVerteilung } from '@/types';

const Pool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [poolBetrag, setPoolBetrag] = useState('');
  const [vorschau, setVorschau] = useState<ReturnType<typeof verteilePool>>([]);
  const [historie, setHistorie] = useState<PoolVerteilung[]>([]);
  const [offeneSchulden, setOffeneSchulden] = useState<Schuld[]>([]);

  useEffect(() => {
    ladeHistorie();
  }, []);

  const ladeHistorie = () => {
    const data = storage.loadData();
    setHistorie(data.pool_historie.sort((a, b) => 
      new Date(b.datum).getTime() - new Date(a.datum).getTime()
    ));
    setOffeneSchulden(data.schulden.filter(s => s.restbetrag > 0));
  };

  const berechneVorschau = () => {
    const betrag = parseFloat(poolBetrag);

    if (isNaN(betrag) || betrag <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte einen gültigen Betrag eingeben',
        variant: 'destructive',
      });
      return;
    }

    const data = storage.loadData();
    const koopScores = new Map<string, number>();
    data.forderungen.forEach((f: Forderung) => {
      koopScores.set(f.glaeubiger_id, f.kooperationsscore);
    });

    const verteilung = verteilePool(data.schulden, koopScores, betrag);
    setVorschau(verteilung);
  };

  const verteilungDurchfuehren = () => {
    const betrag = parseFloat(poolBetrag);

    if (vorschau.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte erst eine Vorschau berechnen',
        variant: 'destructive',
      });
      return;
    }

    try {
      storage.addPoolVerteilung({
        gesamtbetrag: betrag,
        verteilungen: vorschau,
      });

      toast({
        title: 'Erfolg',
        description: `${betrag.toFixed(2)} € wurden verteilt`,
      });

      setPoolBetrag('');
      setVorschau([]);
      ladeHistorie();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Verteilung konnte nicht gespeichert werden',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          ← Zurück zur Startseite
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pool-Verwaltung</CardTitle>
            <CardDescription>
              Verteile verfügbare Mittel automatisch auf offene Schulden basierend auf
              Zinssätzen, Restbeträgen und Kooperationsscores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="poolBetrag">Verfügbarer Betrag (€)</Label>
                <Input
                  id="poolBetrag"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={poolBetrag}
                  onChange={(e) => setPoolBetrag(e.target.value)}
                  placeholder="z.B. 100.00"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={berechneVorschau} variant="outline">
                  Vorschau berechnen
                </Button>
                {vorschau.length > 0 && (
                  <Button onClick={verteilungDurchfuehren}>
                    Verteilung durchführen
                  </Button>
                )}
              </div>

              {offeneSchulden.length === 0 && (
                <div className="p-4 bg-muted rounded-lg text-sm">
                  ℹ️ Keine offenen Schulden vorhanden.
                </div>
              )}

              <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
                <strong>Verteilungs-Algorithmus:</strong>
                <br />
                Gewichtung = zins² + (1/restbetrag) + kooperationsscore^1.5
                <br />
                Höhere Gewichtung = höherer Anteil am Pool
              </div>
            </div>
          </CardContent>
        </Card>

        {vorschau.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vorschau: Verteilung von {parseFloat(poolBetrag).toFixed(2)} €</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schuldner</TableHead>
                    <TableHead>Gläubiger</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead className="text-right">Gewichtung</TableHead>
                    <TableHead className="text-right">Anteil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vorschau.map((v, index) => {
                    const gesamtGewicht = vorschau.reduce((sum, x) => sum + x.gewichtung, 0);
                    const anteil = (v.gewichtung / gesamtGewicht) * 100;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{v.schuldner_id}</TableCell>
                        <TableCell>{v.glaeubiger_id}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {v.betrag.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {v.gewichtung.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {anteil.toFixed(1)} %
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-semibold">
                    <TableCell colSpan={2}>Gesamt</TableCell>
                    <TableCell className="text-right">
                      {vorschau.reduce((sum, v) => sum + v.betrag, 0).toFixed(2)} €
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Historie ({historie.length})</CardTitle>
            <CardDescription>Vergangene Pool-Verteilungen</CardDescription>
          </CardHeader>
          <CardContent>
            {historie.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Verteilungen durchgeführt.
              </p>
            ) : (
              <div className="space-y-6">
                {historie.map((h) => (
                  <div key={h.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold">
                          {h.gesamtbetrag.toFixed(2)} € verteilt
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(h.datum).toLocaleString('de-DE')}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {h.verteilungen.length} Empfänger
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Schuldner → Gläubiger</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {h.verteilungen.map((v, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-sm">
                              {v.schuldner_id} → {v.glaeubiger_id}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {v.betrag.toFixed(2)} €
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pool;
