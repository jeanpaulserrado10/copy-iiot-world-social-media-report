export class PersistenceService {
  private static STORAGE_KEY = 'iiot_report_gen_db_state';

  /**
   * Saves the current application state to the "database".
   */
  static saveState(state: any) {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (e) {
      // QuotaExceededError is expected if files are large. 
      // We catch it here so the app doesn't crash.
      console.warn("Local storage quota exceeded. State was not saved.", e);
    }
  }

  /**
   * Loads the saved application state from the "database".
   */
  static loadState() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) return null;
      return JSON.parse(serialized);
    } catch (e) {
      console.error("Database Load Error:", e);
      return null;
    }
  }

  /**
   * Clears the "database".
   */
  static clearState() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}