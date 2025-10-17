import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/services/storage';

const ForderungErfassen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    glaeubiger_id: '',
    schuldner_id: '',
    betrag: '',
    kommentar: '',
    kooperationsscore: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    if (!formData.glaeubiger_id || !formData.schuldner_id) {
      toast({
        title: 'Fehler',
        description: 'Bitte Gläubiger-ID und Schuldner-ID eingeben',
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

    try {
      storage.addForderung({
        glaeubiger_id: formData.glaeubiger_id.trim(),
        schuldner_id: formData.schuldner_id.trim(),
        betrag: Math.round(betrag * 100) / 100,
        kommentar: formData.kommentar.trim(),
        kooperationsscore: formData.kooperationsscore,
      });

      toast({
        title: 'Erfolg',
        description: 'Forderung wurde erfolgreich eingetragen',
      });

      // Formular zurücksetzen
      setFormData({
        glaeubiger_id: '',
        schuldner_id: '',
        betrag: '',
        kommentar: '',
        kooperationsscore: 5,
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Forderung konnte nicht gespeichert werden',
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
            <CardTitle>Forderung erfassen (Gläubiger S)</CardTitle>
            <CardDescription>
              Trage eine Forderung gegenüber einem Schuldner ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="glaeubiger_id">Gläubiger-ID (S) *</Label>
                <Input
                  id="glaeubiger_id"
                  value={formData.glaeubiger_id}
                  onChange={(e) => setFormData({ ...formData, glaeubiger_id: e.target.value })}
                  placeholder="z.B. S202"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Deine eindeutige Kennung als Gläubiger
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schuldner_id">Schuldner-ID (G) *</Label>
                <Input
                  id="schuldner_id"
                  value={formData.schuldner_id}
                  onChange={(e) => setFormData({ ...formData, schuldner_id: e.target.value })}
                  placeholder="z.B. G123"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Die Kennung der Person, die dir Geld schuldet
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="betrag">Forderungsbetrag (€) *</Label>
                <Input
                  id="betrag"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.betrag}
                  onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                  placeholder="z.B. 120.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kommentar">Kommentar</Label>
                <Textarea
                  id="kommentar"
                  value={formData.kommentar}
                  onChange={(e) => setFormData({ ...formData, kommentar: e.target.value })}
                  placeholder="z.B. Rechnung #1002, Darlehen vom..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Kooperationsscore: {formData.kooperationsscore} / 10</Label>
                <Slider
                  value={[formData.kooperationsscore]}
                  onValueChange={([value]) => setFormData({ ...formData, kooperationsscore: value })}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Wie kooperativ ist der Schuldner? (0 = unkooperativ, 10 = sehr kooperativ)
                  <br />
                  <strong>Wichtig:</strong> Höhere Werte werden bei der Pool-Verteilung bevorzugt
                </p>
              </div>

              <Button type="submit" className="w-full">
                Forderung eintragen
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForderungErfassen;
