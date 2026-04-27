import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Servicio de notificaciones tipo toast.
 * Muestra mensajes breves en la parte inferior de la pantalla usando Angular Material SnackBar.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  /**
   * Muestra un toast con el mensaje indicado.
   * @param message - Texto a mostrar al usuario.
   * @param type - Variante visual: `'success'` (verde), `'error'` (rojo) o `'info'` (azul).
   *               Por defecto es `'success'`.
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.snackBar.open(message, '✕', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`toast--${type}`],
    });
  }
}
