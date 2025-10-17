import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Startseite mit Übersicht und Navigation
 */
const Home = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Schulden-Management MVP</h1>
          <p className="text-lg text-muted-foreground">
            Einfache Verwaltung und Optimierung von Schulden zwischen Schuldnern (G),
            Gläubigern (S) und Zahlern (K)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>👤 Für Schuldner (G)</CardTitle>
              <CardDescription>Verwalte deine Schulden und finde die optimale Rückzahlungsstrategie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/schuld-erfassen">
                <Button variant="outline" className="w-full">Schuld eintragen</Button>
              </Link>
              <Link to="/optimierung">
                <Button variant="outline" className="w-full">Optimierung anzeigen</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧾 Für Gläubiger (S)</CardTitle>
              <CardDescription>Erfasse deine Forderungen und verwalte offene Beträge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/forderung-erfassen">
                <Button variant="outline" className="w-full">Forderung eintragen</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 Für Zahler (K)</CardTitle>
              <CardDescription>Melde Zahlungen, die du für einen Schuldner geleistet hast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/zahlung-melden">
                <Button variant="outline" className="w-full">Zahlung melden</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Pool-Verwaltung</CardTitle>
              <CardDescription>Verteile verfügbare Mittel optimal auf offene Schulden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/pool">
                <Button variant="outline" className="w-full">Pool verwalten</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>💾 Daten-Verwaltung</CardTitle>
            <CardDescription>Exportiere oder importiere deine Daten als JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/import-export">
              <Button variant="outline" className="w-full">Import / Export</Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">ℹ️ So funktioniert's</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Schuldner (G)</strong> tragen ihre Schulden ein und sehen eine optimierte
              Rückzahlungsstrategie basierend auf Zinssätzen und Restbeträgen.
            </p>
            <p>
              <strong>Gläubiger (S)</strong> erfassen ihre Forderungen und können einen
              Kooperationsscore vergeben (wichtig für Pool-Verteilung).
            </p>
            <p>
              <strong>Zahler (K)</strong> melden Zahlungen, die sie stellvertretend für einen
              Schuldner geleistet haben.
            </p>
            <p>
              <strong>Pool-Funktion:</strong> Automatische Verteilung verfügbarer Mittel auf
              Basis von Zinssätzen, Restbeträgen und Kooperationsscores.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Alle Daten werden lokal im Browser gespeichert (localStorage). Nutze die
              Import/Export-Funktion für Backups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
