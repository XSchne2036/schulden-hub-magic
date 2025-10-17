import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/services/storage';
import { Schuld } from '@/types';

const ZahlungMelden = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [offeneSchulden, setOffeneSchulden] = useState<Schuld[]>([]);
  const [formData, setFormData] = useState({
    zahler_name: '',
    schuld_id: '',
    betrag: '',
    kommentar: '',
  });

  useEffect(() => {
    const data = storage.loadData();
    const offen = data.schulden.filter(s => s.restbetrag > 0);
    setOffeneSchulden(offen);
  }, []);

  const selectedSchuld = offeneSchulden.find(s => s.id === formData.schuld_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zahler_name || !formData.schuld_id) {
      toast({
        title: 'Fehler',
        description: 'Bitte Zahler-Name und Schuld auswählen',
        variant: 'destructive',
      });
      return;
    }

    const betrag = parseFloat(formData.betrag);

    if (isNaN(betrag) || betrag <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte einen gültigen Betrag eingeben',
        variant: 'destructive',
      });
      return;
    }

    if (selectedSchuld && betrag > selectedSchuld.restbetrag) {
      toast({
        title: 'Fehler',
        description: `Betrag darf nicht höher sein als Restbetrag (${selectedSchuld.restbetrag.toFixed(2)} €)`,
        variant: 'destructive',
      });
      return;
    }

    try {
      storage.addZahlung(formData.schuld_id, {
        zahler_name: formData.zahler_name.trim(),
        betrag: Math.round(betrag * 100) / 100,
        kommentar: formData.kommentar.trim(),
      });

      toast({
        title: 'Erfolg',
        description: `Zahlung von ${betrag.toFixed(2)} € wurde erfolgreich gemeldet`,
      });

      // Formular zurücksetzen und Liste aktualisieren
      setFormData({
        zahler_name: '',
        schuld_id: '',
        betrag: '',
        kommentar: '',
      });

      const data = storage.loadData();
      const offen = data.schulden.filter(s => s.restbetrag > 0);
      setOffeneSchulden(offen);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Zahlung konnte nicht gespeichert werden',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          ← Zurück zur Startseite
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Zahlung melden (Zahler K)</CardTitle>
            <CardDescription>
              Melde eine Zahlung, die du stellvertretend für einen Schuldner geleistet hast.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {offeneSchulden.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Keine offenen Schulden vorhanden.
                </p>
                <Button onClick={() => navigate('/schuld-erfassen')}>
                  Schuld eintragen
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="zahler_name">Dein Name (Zahler K) *</Label>
                  <Input
                    id="zahler_name"
                    value={formData.zahler_name}
                    onChange={(e) => setFormData({ ...formData, zahler_name: e.target.value })}
                    placeholder="z.B. K345, Max Mustermann"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schuld_id">Schuld auswählen *</Label>
                  <Select
                    value={formData.schuld_id}
                    onValueChange={(value) => setFormData({ ...formData, schuld_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Schuld auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {offeneSchulden.map((schuld) => (
                        <SelectItem key={schuld.id} value={schuld.id}>
                          {schuld.schuldner_id} → {schuld.glaeubiger_id}: {schuld.restbetrag.toFixed(2)} €
                          {schuld.kommentar && ` (${schuld.kommentar})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSchuld && (
                  <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
                    <p><strong>Schuldner:</strong> {selectedSchuld.schuldner_id}</p>
                    <p><strong>Gläubiger:</strong> {selectedSchuld.glaeubiger_id}</p>
                    <p><strong>Ursprünglicher Betrag:</strong> {selectedSchuld.betrag.toFixed(2)} €</p>
                    <p><strong>Restbetrag:</strong> {selectedSchuld.restbetrag.toFixed(2)} €</p>
                    <p><strong>Zinssatz:</strong> {selectedSchuld.zins.toFixed(2)} %</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="betrag">Gezahlter Betrag (€) *</Label>
                  <Input
                    id="betrag"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedSchuld?.restbetrag}
                    value={formData.betrag}
                    onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                    placeholder="z.B. 50.00"
                    required
                  />
                  {selectedSchuld && (
                    <p className="text-sm text-muted-foreground">
                      Maximal: {selectedSchuld.restbetrag.toFixed(2)} €
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kommentar">Kommentar</Label>
                  <Textarea
                    id="kommentar"
                    value={formData.kommentar}
                    onChange={(e) => setFormData({ ...formData, kommentar: e.target.value })}
                    placeholder="z.B. Überweisung vom 17.10.2025"
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Zahlung melden
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZahlungMelden;
