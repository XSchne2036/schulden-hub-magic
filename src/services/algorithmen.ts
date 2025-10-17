/**
 * Algorithmen für Priorisierung und Pool-Verteilung
 * Alle Berechnungen sind deterministisch und nachvollziehbar
 */

import { Schuld } from '@/types';

/**
 * Priorisierungsfunktion für Schulden-Rückzahlung
 * 
 * Regeln (in dieser Reihenfolge):
 * 1. Höchster Zinssatz zuerst
 * 2. Bei gleichem Zins: niedrigster Restbetrag zuerst
 * 3. Bei gleichem Restbetrag: höchster Kooperationsscore (aus Forderung)
 * 
 * @param schulden - Array von Schulden
 * @param kooperationsscores - Map von glaeubiger_id zu Kooperationsscore
 * @returns Sortiertes Array (höchste Priorität zuerst)
 */
export function priorisiereSchulden(
  schulden: Schuld[],
  kooperationsscores: Map<string, number> = new Map()
): Schuld[] {
  return [...schulden]
    .filter(s => s.restbetrag > 0) // Nur offene Schulden
    .sort((a, b) => {
      // 1. Zinssatz (höher = höhere Priorität)
      if (a.zins !== b.zins) {
        return b.zins - a.zins;
      }

      // 2. Restbetrag (niedriger = höhere Priorität)
      if (a.restbetrag !== b.restbetrag) {
        return a.restbetrag - b.restbetrag;
      }

      // 3. Kooperationsscore (höher = höhere Priorität)
      const scoreA = kooperationsscores.get(a.glaeubiger_id) || 0;
      const scoreB = kooperationsscores.get(b.glaeubiger_id) || 0;
      return scoreB - scoreA;
    });
}

/**
 * Berechnet die Gewichtung für eine Schuld im Pool-Verteilungs-Algorithmus
 * 
 * Formel: gewicht = zins² + (1 / restbetrag) + kooperationsscore^1.5
 * 
 * Erklärung:
 * - zins²: Zinsen werden stark gewichtet (quadratisch)
 * - 1/restbetrag: Kleine Beträge werden bevorzugt (können schneller abbezahlt werden)
 * - kooperationsscore^1.5: Kooperative Gläubiger werden bevorzugt
 * 
 * @param schuld - Die zu bewertende Schuld
 * @param kooperationsscore - Score des Gläubigers (0-10)
 * @returns Gewichtung (höher = höhere Priorität)
 */
export function berechneGewichtung(schuld: Schuld, kooperationsscore: number): number {
  if (schuld.restbetrag <= 0) return 0;

  const zinsGewicht = Math.pow(schuld.zins, 2);
  const betragGewicht = 1 / schuld.restbetrag;
  const koopGewicht = Math.pow(kooperationsscore, 1.5);

  return zinsGewicht + betragGewicht + koopGewicht;
}

/**
 * Verteilt einen Pool-Betrag proportional auf offene Schulden
 * 
 * @param schulden - Alle Schulden
 * @param kooperationsscores - Map von glaeubiger_id zu Kooperationsscore
 * @param poolBetrag - Zu verteilender Gesamtbetrag
 * @returns Array von Verteilungen mit Schuld-ID, Betrag und Gewichtung
 */
export function verteilePool(
  schulden: Schuld[],
  kooperationsscores: Map<string, number>,
  poolBetrag: number
): Array<{
  schuld_id: string;
  schuldner_id: string;
  glaeubiger_id: string;
  betrag: number;
  gewichtung: number;
}> {
  // Nur offene Schulden
  const offeneSchulden = schulden.filter(s => s.restbetrag > 0);

  if (offeneSchulden.length === 0) {
    return [];
  }

  // Gewichtungen berechnen
  const gewichtungen = offeneSchulden.map(schuld => ({
    schuld,
    gewichtung: berechneGewichtung(
      schuld,
      kooperationsscores.get(schuld.glaeubiger_id) || 5 // Default: 5
    ),
  }));

  // Gesamtgewichtung
  const gesamtGewichtung = gewichtungen.reduce((sum, g) => sum + g.gewichtung, 0);

  if (gesamtGewichtung === 0) {
    return [];
  }

  // Proportionale Verteilung
  const verteilungen = gewichtungen.map(({ schuld, gewichtung }) => {
    const anteil = gewichtung / gesamtGewichtung;
    let betrag = Math.round(poolBetrag * anteil * 100) / 100; // 2 Nachkommastellen

    // Nicht mehr als Restbetrag auszahlen
    betrag = Math.min(betrag, schuld.restbetrag);

    return {
      schuld_id: schuld.id,
      schuldner_id: schuld.schuldner_id,
      glaeubiger_id: schuld.glaeubiger_id,
      betrag,
      gewichtung,
    };
  });

  // Rundungsdifferenz ausgleichen (wird dem höchsten Betrag zugeschlagen)
  const verteilterBetrag = verteilungen.reduce((sum, v) => sum + v.betrag, 0);
  const differenz = Math.round((poolBetrag - verteilterBetrag) * 100) / 100;

  if (differenz > 0 && verteilungen.length > 0) {
    // Differenz zur höchsten Verteilung hinzufügen
    const hoechste = verteilungen.reduce((max, v) =>
      v.betrag > max.betrag ? v : max
    );
    hoechste.betrag = Math.round((hoechste.betrag + differenz) * 100) / 100;
  }

  return verteilungen.filter(v => v.betrag > 0);
}

/**
 * Berechnet Statistiken für einen Schuldner
 */
export function berechneStatistiken(schulden: Schuld[]): {
  gesamtSchuld: number;
  gesamtRestbetrag: number;
  anzahlOffeneSchulden: number;
  durchschnittlicherZins: number;
  gesamtGezahlt: number;
} {
  const gesamtSchuld = schulden.reduce((sum, s) => sum + s.betrag, 0);
  const gesamtRestbetrag = schulden.reduce((sum, s) => sum + s.restbetrag, 0);
  const anzahlOffeneSchulden = schulden.filter(s => s.restbetrag > 0).length;
  
  const offeneSchulden = schulden.filter(s => s.restbetrag > 0);
  const durchschnittlicherZins = offeneSchulden.length > 0
    ? offeneSchulden.reduce((sum, s) => sum + s.zins, 0) / offeneSchulden.length
    : 0;

  const gesamtGezahlt = schulden.reduce(
    (sum, s) => sum + s.zahlungen.reduce((zSum, z) => zSum + z.betrag, 0),
    0
  );

  return {
    gesamtSchuld: Math.round(gesamtSchuld * 100) / 100,
    gesamtRestbetrag: Math.round(gesamtRestbetrag * 100) / 100,
    anzahlOffeneSchulden,
    durchschnittlicherZins: Math.round(durchschnittlicherZins * 100) / 100,
    gesamtGezahlt: Math.round(gesamtGezahlt * 100) / 100,
  };
}
