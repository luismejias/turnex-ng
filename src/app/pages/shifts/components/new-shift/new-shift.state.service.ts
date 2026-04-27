import { Injectable } from '@angular/core';
import { SimpleStoreService } from 'src/app/simple-store.service';
import { NewShiftState } from '../../models/new-shift-state.interface';

/**
 * Servicio de estado local del wizard de nuevo turno.
 * Se provee a nivel de componente (`providers: [NewShiftStateService]`)
 * para que cada instancia del wizard tenga su propio estado aislado.
 */
@Injectable({
  providedIn: 'root'
})
export class NewShiftStateService extends SimpleStoreService<NewShiftState> {
  constructor() {
    super();
  }

  /**
   * Reinicia el estado del wizard al paso 1 con todos los campos en `undefined`.
   * Se llama al finalizar el flujo o al cancelar.
   */
  setInitialState() {
    this.state.set({
      step: 1,
      pack: undefined,
      specialty: undefined,
      companySpecialty: undefined,
      days: undefined,
      hours: undefined,
    });
  }

}
