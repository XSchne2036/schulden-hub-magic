/**
 * LocalStorage Service für Datenpersistenz
 * Keine externen Dependencies, rein Browser-basiert
 */

import { AppData, Schuld, Forderung, PoolVerteilung, Zahlung } from '@/types';

const STORAGE_KEY = 'schulden_app_data';
const VERSION = '1.0.0';

const DEFAULT_DATA: AppData = {
  schulden: [],
  forderungen: [],
  pool_historie: [],
  version: VERSION,
};

export const storage = {
  /**
   * Lädt alle Daten aus localStorage
   */
  loadData(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_DATA;
      return JSON.parse(data) as AppData;
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      return DEFAULT_DATA;
    }
  },

  /**
   * Speichert alle Daten in localStorage
   */
  saveData(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Fehler beim Speichern der Daten:', error);
      throw new Error('Daten konnten nicht gespeichert werden');
    }
  },

  /**
   * Fügt eine neue Schuld hinzu
   */
  addSchuld(schuld: Omit<Schuld, 'id' | 'erstellt_am' | 'zahlungen'>): void {
    const data = this.loadData();
    const neueSchuld: Schuld = {
      ...schuld,
      id: generateId(),
      erstellt_am: new Date().toISOString(),
      zahlungen: [],
    };
    data.schulden.push(neueSchuld);
    this.saveData(data);
  },

  /**
   * Fügt eine neue Forderung hinzu
   */
  addForderung(forderung: Omit<Forderung, 'id' | 'erstellt_am'>): void {
    const data = this.loadData();
    const neueForderung: Forderung = {
      ...forderung,
      id: generateId(),
      erstellt_am: new Date().toISOString(),
    };
    data.forderungen.push(neueForderung);
    this.saveData(data);
  },

  /**
   * Fügt eine Zahlung zu einer Schuld hinzu
   */
  addZahlung(schuld_id: string, zahlung: Omit<Zahlung, 'id' | 'datum'>): void {
    const data = this.loadData();
    const schuld = data.schulden.find(s => s.id === schuld_id);
    
    if (!schuld) {
      throw new Error('Schuld nicht gefunden');
    }

    const neueZahlung: Zahlung = {
      ...zahlung,
      id: generateId(),
      datum: new Date().toISOString(),
    };

    schuld.zahlungen.push(neueZahlung);
    schuld.restbetrag = Math.max(0, schuld.restbetrag - zahlung.betrag);
    
    this.saveData(data);
  },

  /**
   * Speichert eine Pool-Verteilung
   */
  addPoolVerteilung(verteilung: Omit<PoolVerteilung, 'id' | 'datum'>): void {
    const data = this.loadData();
    
    const neueVerteilung: PoolVerteilung = {
      ...verteilung,
      id: generateId(),
      datum: new Date().toISOString(),
    };

    // Schulden aktualisieren
    verteilung.verteilungen.forEach(v => {
      const schuld = data.schulden.find(s => s.id === v.schuld_id);
      if (schuld) {
        schuld.restbetrag = Math.max(0, schuld.restbetrag - v.betrag);
        schuld.zahlungen.push({
          id: generateId(),
          zahler_name: 'Pool-Verteilung',
          betrag: v.betrag,
          datum: new Date().toISOString(),
          kommentar: `Automatische Pool-Verteilung (Gewichtung: ${v.gewichtung.toFixed(2)})`,
        });
      }
    });

    data.pool_historie.push(neueVerteilung);
    this.saveData(data);
  },

  /**
   * Exportiert alle Daten als JSON
   */
  exportData(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  },

  /**
   * Importiert Daten aus JSON
   */
  importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString) as AppData;
      
      // Einfache Validierung
      if (!data.schulden || !data.forderungen || !data.pool_historie) {
        throw new Error('Ungültiges Datenformat');
      }

      data.version = VERSION;
      this.saveData(data);
    } catch (error) {
      console.error('Fehler beim Import:', error);
      throw new Error('Daten konnten nicht importiert werden. Bitte überprüfen Sie das Format.');
    }
  },

  /**
   * Löscht alle Daten
   */
  clearData(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

/**
 * Generiert eine einfache eindeutige ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
