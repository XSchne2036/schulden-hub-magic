/**
 * Zentrale TypeScript-Typen für die Schulden-Management-App
 * Alle Datenstrukturen sind für localStorage optimiert
 */

export interface Schuld {
  id: string;
  schuldner_id: string;
  glaeubiger_id: string;
  betrag: number;
  restbetrag: number;
  zins: number; // in Prozent
  kommentar: string;
  erstellt_am: string; // ISO-Datum
  zahlungen: Zahlung[];
}

export interface Forderung {
  id: string;
  glaeubiger_id: string;
  schuldner_id: string;
  betrag: number;
  kommentar: string;
  kooperationsscore: number; // 0-10
  erstellt_am: string;
}

export interface Zahlung {
  id: string;
  zahler_name: string;
  betrag: number;
  datum: string;
  kommentar?: string;
}

export interface PoolVerteilung {
  id: string;
  datum: string;
  gesamtbetrag: number;
  verteilungen: {
    schuld_id: string;
    schuldner_id: string;
    glaeubiger_id: string;
    betrag: number;
    gewichtung: number;
  }[];
}

export interface AppData {
  schulden: Schuld[];
  forderungen: Forderung[];
  pool_historie: PoolVerteilung[];
  version: string;
}
