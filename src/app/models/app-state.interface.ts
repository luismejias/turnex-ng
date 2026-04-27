/** Estado global de la aplicación gestionado por {@link AppStateService}. */
export interface AppState {
  /** Indica si el usuario tiene una sesión activa. */
  isLoggedIn: boolean;
  /**
   * Indica si la vista actual es un flujo hijo (sub-pantalla).
   * Cuando es `true`, el navbar y el bottom-bar se ocultan.
   */
  isChildFlow: boolean;
}
