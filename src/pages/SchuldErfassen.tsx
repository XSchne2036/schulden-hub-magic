import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/services/storage';

const SchuldErfassen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    schuldner_id: '',
    glaeubiger_id: '',
    betrag: '',
    zins: '',
    kommentar: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    if (!formData.schuldner_id || !formData.glaeubiger_id) {
      toast({
        title: 'Fehler',
        description: 'Bitte Schuldner-ID und Gläubiger-ID eingeben',
        variant: 'destructive',
      });
      return;
    }

    const betrag = parseFloat(formData.betrag);
    const zins = parseFloat(formData.zins);

    if (isNaN(betrag) || betrag <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte einen gültigen Betrag eingeben',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(zins) || zins < 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte einen gültigen Zinssatz eingeben',
        variant: 'destructive',
      });
      return;
    }

    try {
      storage.addSchuld({
        schuldner_id: formData.schuldner_id.trim(),
        glaeubiger_id: formData.glaeubiger_id.trim(),
        betrag: Math.round(betrag * 100) / 100,
        restbetrag: Math.round(betrag * 100) / 100,
        zins: Math.round(zins * 100) / 100,
        kommentar: formData.kommentar.trim(),
      });

      toast({
        title: 'Erfolg',
        description: 'Schuld wurde erfolgreich eingetragen',
      });

      // Formular zurücksetzen
      setFormData({
        schuldner_id: '',
        glaeubiger_id: '',
        betrag: '',
        zins: '',
        kommentar: '',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Schuld konnte nicht gespeichert werden',
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
            <CardTitle>Schuld erfassen (Schuldner G)</CardTitle>
            <CardDescription>
              Trage eine neue Schuld ein. Diese wird in deinem Browser gespeichert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  Deine eindeutige Kennung als Schuldner
                </p>
              </div>

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
                  Die Kennung der Person/Firma, bei der du Schulden hast
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="betrag">Betrag (€) *</Label>
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
                <Label htmlFor="zins">Zinssatz (% p.a.) *</Label>
                <Input
                  id="zins"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.zins}
                  onChange={(e) => setFormData({ ...formData, zins: e.target.value })}
                  placeholder="z.B. 5.0"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Jahreszinssatz in Prozent (wichtig für Priorisierung)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kommentar">Kommentar</Label>
                <Textarea
                  id="kommentar"
                  value={formData.kommentar}
                  onChange={(e) => setFormData({ ...formData, kommentar: e.target.value })}
                  placeholder="z.B. Autoreparatur, Kredit XY..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Schuld eintragen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/optimierung')}
                >
                  Zur Optimierung
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchuldErfassen;
