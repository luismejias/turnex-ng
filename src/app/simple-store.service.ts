import { computed, Injectable, Signal, signal } from '@angular/core';

/**
 * Servicio base de gestión de estado reactivo mediante señales de Angular.
 * Extiéndelo con `extends SimpleStoreService<MiInterfaz>` para obtener
 * un store tipado con lectura y escritura de propiedades individuales o en bloque.
 *
 * @template T - Interfaz que describe la forma del estado.
 */
@Injectable({
  providedIn: 'root'
})
export class SimpleStoreService<T> {
  /** Señal que contiene el estado completo. */
  readonly state = signal({} as T);

  /**
   * Crea una señal derivada (computed) que emite solo la propiedad indicada del estado.
   * @param key - Nombre de la propiedad a observar.
   * @returns Señal reactiva con el valor actual de la propiedad.
   */
  public select<K extends keyof T>(key: K): Signal<T[K]> {
    return computed(() => this.state()[key]);
  }

  /**
   * Actualiza una única propiedad del estado sin modificar el resto.
   * @param key - Nombre de la propiedad a actualizar.
   * @param data - Nuevo valor para la propiedad.
   */
  public set<K extends keyof T>(key: K, data: T[K]) {
    this.state.update((currentValue) => ({ ...currentValue, [key]: data }));
  }

  /**
   * Actualiza múltiples propiedades del estado en una sola operación.
   * @param partialState - Objeto con las propiedades y valores a actualizar.
   */
  public setState(partialState: Partial<T>): void {
    this.state.update((currentValue) => ({ ...currentValue, ...partialState }));
  }
}
