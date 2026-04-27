import { CommonModule, NgClass } from '@angular/common';
import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { daysOfWeek } from 'src/app/pages/constants';
import { SelectItemsComponent } from '../select-items/select-items.component';
import { SelectSpecialtyComponent } from '../select-specialty/select-specialty.component';
import { Day, Hour } from '../../models';
import { Pack, step } from 'src/app/models';
import { AdminSpecialty } from 'src/app/pages/admin/models/admin.models';
import { NewShiftStateService } from './new-shift.state.service';
import { SelectHourComponent } from '../select-hour/select-hour.component';
import { NewShiftSummaryComponent } from '../new-shift-summary/new-shift-summary.component';
import { NewShiftState } from '../../models/new-shift-state.interface';
import { Router } from '@angular/router';
import { SelectDayComponent } from '../select-day/select-day.component';
import { PacksService } from 'src/app/pages/packs';
import { AuthService } from 'src/app/shared/auth.service';
import { ShiftsService } from '../../service';
import { TypeShifts } from '../../shift.enum';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'turnex-new-shift',
  imports: [
    CommonModule,
    TitleComponent,
    ButtonComponent,
    SelectItemsComponent,
    SelectSpecialtyComponent,
    SelectDayComponent,
    SelectHourComponent,
    NewShiftSummaryComponent,
    NgClass,
  ],
  templateUrl: './new-shift.component.html',
  styleUrl: './new-shift.component.scss',
  providers: [NewShiftStateService],
})
/**
 * Componente principal del wizard de creación de nuevo turno.
 * Orquesta los pasos: 1-Especialidad, 2-Pack, 3-Día, 4-Horario, 5-Confirmación, 6-Resultado.
 * Omite el paso 2 si el usuario ya tiene un pack activo.
 */
export class NewShiftComponent implements OnInit {
  private newShiftStateService = inject(NewShiftStateService);
  private router = inject(Router);
  private packsService = inject(PacksService);
  private shiftsService = inject(ShiftsService);
  private authService = inject(AuthService);

  /** ID de la especialidad de empresa preseleccionada (pasado como ruta param). */
  @Input() idSpecialty!: string;
  /** ID del pack a preseleccionar (pasado como query param desde historial). */
  @Input() packId?: string;

  /** Título principal del paso actual. */
  title: string = '';
  /** Subtítulo descriptivo del paso actual. */
  subTitle: string = '';
  /** Etiqueta del botón de avance. */
  nextButtonText: string = 'Siguiente';
  /** Etiqueta del botón de retroceso. */
  previousButtonText: string = 'Anterior';
  /** Indica si ocurrió un error al guardar los turnos en el paso 6. */
  errorOnSave: boolean = false;
  /** Enum de pasos del wizard, expuesto al template. */
  step = step;
  /** Controla si el botón "Siguiente" está deshabilitado. */
  isNextButtonDisabled: boolean = true;
  /** Copia mutable de los días de la semana para gestionar la selección. */
  daysOfWeek: Day[] = daysOfWeek.map(d => ({ ...d }));
  selectedDays!: Day[];
  selectedDaysWithSelectedTimes!: Record<string, Hour[]>;
  hours: Hour[] = [];
  /** Estado actual del wizard, sincronizado con la señal de {@link NewShiftStateService}. */
  state!: NewShiftState;
  /** Lista de packs disponibles, cargados en `ngOnInit`. */
  packs!: Pack[];
  /** ID de empresa del usuario autenticado (null para SUPER_ADMIN). */
  userCompanyId: number | undefined;
  /** ID de la especialidad de empresa seleccionada. */
  selectedSpecialtyId: number | undefined;
  /** Pack que el usuario ya tiene activo — omite el paso de selección de pack. */
  userActivePack: Pack | undefined;

  constructor() {
    this.updateStep(1);
    effect(() => {
      this.state = this.newShiftStateService.state();
      this.setTitleSubtitle();
      this.validateNextButton();
    });
  }

  ngOnInit(): void {
    this.userCompanyId = this.authService.getStoredUser()?.companyId ?? undefined;
    if (this.idSpecialty) this.selectedSpecialtyId = Number(this.idSpecialty);

    forkJoin({
      packs: this.packsService.getAllPacks(),
      shifts: this.shiftsService.getShifts(),
    }).subscribe(({ packs, shifts }) => {
      this.packs = packs;

      // Detect active pack from NEXT shifts (packId URL param takes priority)
      if (this.packId) {
        this._preselectPack(Number(this.packId));
      } else {
        const activeShift = shifts.find(s => s.status === TypeShifts.NEXT && s.pack);
        if (activeShift?.pack) {
          this.userActivePack = packs.find(p => p.id === activeShift.pack!.id);
          if (this.userActivePack) {
            this.packs = this.packs.map(p => ({ ...p, isSelected: p.id === this.userActivePack!.id }));
            this.newShiftStateService.set(this.step.PACK, { ...this.userActivePack, isSelected: true });
            this.userActivePack.id === 4 ? this.setSelectedAllDays() : this.setDeSelectAllDays();
          }
        }
      }
    });
  }

  /**
   * Actualiza el paso actual en el estado del wizard.
   * @param step - Número de paso de destino.
   */
  updateStep(step: number): void {
    this.newShiftStateService.set('step', step);
  }

  /** Paso actualmente activo del wizard (lectura desde la señal). */
  get $step() {
    return this.newShiftStateService.state().step;
  }

  /** Navega a la pantalla de lista de turnos del usuario. */
  goToShifts() {
    this.router.navigate(['/shifts']);
  }

  /**
   * Manejador del evento de selección de especialidad desde `SelectSpecialtyComponent`.
   * Guarda la especialidad en el estado y avanza automáticamente si hay un pack activo.
   * @param sp - Especialidad de empresa seleccionada.
   */
  onSpecialtySelected(sp: AdminSpecialty): void {
    this.selectedSpecialtyId = sp.id;
    this.newShiftStateService.set('companySpecialty', sp);
    // Auto-advance when coming from a route with idSpecialty
    if (this.idSpecialty) {
      this._advanceFromSpecialty();
    }
  }

  private _advanceFromSpecialty(): void {
    if (this.userActivePack) {
      this.updateStep(this.userActivePack.id === 4 ? 4 : 3);
    } else if (!this.packId) {
      this.updateStep(2);
    }
  }

  private _preselectPack(id: number): void {
    const found = this.packs.find(p => p.id === id);
    if (!found) return;
    this.packs = this.packs.map(p => ({ ...p, isSelected: p.id === id }));
    this.newShiftStateService.set(this.step.PACK, { ...found, isSelected: true });
    id === 4 ? this.setSelectedAllDays() : this.setDeSelectAllDays();
    this.updateStep(id === 4 ? 4 : 3);
  }

  /**
   * Recalcula si el botón "Siguiente" debe estar habilitado según el paso actual
   * y el estado del wizard. Llamado desde el `effect()` del constructor.
   */
  validateNextButton(): void {
    switch (this.$step) {
      case 1: this.isNextButtonDisabled = !this._companySpecialty; break;
      case 2: this.isNextButtonDisabled = !this._pack; break;
      case 3: this.isNextButtonDisabled = !this._days; break;
      case 4: this.isNextButtonDisabled = !this._selectedDaysWithSelectedTimes; break;
      case 5:
      case 6: this.isNextButtonDisabled = false; break;
      default: this.isNextButtonDisabled = true;
    }
  }

  /** Actualiza título, subtítulo y texto del botón según el paso actual. */
  setTitleSubtitle(): void {
    switch (this.$step) {
      case 1:
        this.title = 'Agenda un nuevo turno';
        this.subTitle = 'Elige la especialidad de tu nuevo turno.';
        this.nextButtonText = 'Siguiente';
        break;
      case 2:
        this.title = 'Elige tu pack de clases';
        this.subTitle =
          'Podrás cambiar de pack siempre que lo necesites. Al solicitar el cambio de pack se verá reflejado al mes siguiente. En caso de requerir clases adicionales, siempre podrás adquirir clases sueltas.';
        break;
      case 3: {
        const n = this.packMaxDays;
        this.title = 'Elige los días de tus turnos';
        this.subTitle = `Tenés el pack "${this._pack?.description}" activo. Elegí exactamente ${n} día${n > 1 ? 's' : ''} de la semana.`;
        break;
      }
      case 4:
        this.title = 'Te mostramos los horarios disponibles para cada día seleccionado, elige los que más te convengan.';
        this.subTitle = 'Podrás cancelar, reagendar o pedir un turno nuevo siempre que lo necesites con un mínimos de 24hs de antelación.';
        break;
      case 5:
        this.title = '¡Ya casi estamos!';
        this.subTitle = 'Confirma los datos de tu solicitud y, si está todo bien, presiona el botón "Agendar".';
        this.nextButtonText = 'Agendar';
        break;
      case 6:
        this.getShiftSchedulingResult();
        break;
      default:
        this.title = 'Agenda un nuevo turno';
        this.subTitle = 'Elige la especialidad de tu nuevo turno.';
    }
  }

  setInitialState() {
    this.newShiftStateService.setInitialState();
    this.daysOfWeek.map(day => (day.isSelected = false));
  }

  onNextButton() {
    switch (this.$step) {
      case 1:
        if (this._companySpecialty) {
          if (this.userActivePack) {
            // Skip pack selection — user already has an active pack
            this.updateStep(this.userActivePack.id === 4 ? 4 : 3);
          } else {
            this.updateStep(2);
          }
        }
        break;
      case 2:
        if (this._pack && !this._days) {
          this.updateStep(3);
        } else if (this._pack && this._days) {
          this.updateStep(4);
        }
        break;
      case 3:
        if (this._days) this.updateStep(4);
        break;
      case 4:
        if (this.hours) this.updateStep(5);
        break;
      case 5:
        this.saveShifts();
        break;
      case 6:
        if (this.errorOnSave) {
          this.updateStep(1);
        } else {
          this.setInitialState();
          this.goToShifts();
        }
        break;
      default:
        this.updateStep(1);
    }
  }

  onPreviousButton() {
    let prev = this.$step - 1;
    // Skip pack step (2) if user already has one
    if (prev === 2 && this.userActivePack) prev = 1;
    // For pack 4 going back from hours, also skip day step
    if (prev === 3 && this._pack?.id === 4) prev = this.userActivePack ? 1 : 2;
    if (prev > 0) this.updateStep(prev);
  }

  toggleSelection(item: Pack): void {
    const itemId = item.id;
    this.packs = this.packs?.map(p => ({ ...p, isSelected: p.id === itemId ? !p.isSelected : false }));
    if (this._pack) {
      this._pack.id === 4 ? this.setSelectedAllDays() : this.setDeSelectAllDays();
      this.newShiftStateService.set(this.step.PACK, this._pack);
    } else {
      this.newShiftStateService.set(this.step.PACK, undefined);
    }
  }

  getShiftSchedulingResult() {
    const specialtyName = this.state.companySpecialty?.name ?? '';
    if (this.errorOnSave) {
      this.title = `¡Hubo un error al agendar tus turnos de ${specialtyName}!`;
      this.subTitle = 'Por favor intenta de nuevo más tarde.';
      this.nextButtonText = 'Volver al inicio';
    } else {
      this.title = `¡Has agendado tus turnos de ${specialtyName} con éxito!`;
      this.subTitle = 'Puedes cancelar o re-agendar tus clases siempre que lo necesites desde la sección "Turnos" con un mínimo de 24 hs de anticipación.';
      this.nextButtonText = 'Ver mis Turnos';
      this.previousButtonText = 'Volver al inicio';
    }
  }

  /**
   * Envía los turnos seleccionados al backend.
   * Si la petición falla, marca `errorOnSave = true` antes de avanzar al paso 6.
   */
  saveShifts(): void {
    this.shiftsService.saveShifts(this.state).subscribe({
      next: () => { this.errorOnSave = false; this.updateStep(6); },
      error: () => { this.errorOnSave = true; this.updateStep(6); },
    });
  }

  private get _companySpecialty(): AdminSpecialty | undefined {
    return this.newShiftStateService.state().companySpecialty;
  }

  private get _pack(): Pack | undefined {
    return this.packs?.find(pack => pack.isSelected);
  }

  /**
   * Número máximo de días que el usuario puede seleccionar para el pack activo.
   * Calculado a partir de `classCount` o del número en `description`, limitado a 7.
   */
  get packMaxDays(): number {
    const pack = this._pack;
    if (!pack) return 1;
    const count = pack.classCount ?? parseInt(pack.description.match(/^(\d+)/)?.[1] ?? '1', 10);
    return Math.min(count, 7);
  }

  /** Días de la semana configurados en el horario de la especialidad seleccionada. */
  get scheduleDays(): string[] {
    return this._companySpecialty?.schedule?.days ?? [];
  }

  /** Hora de inicio del horario de la especialidad en formato HH:MM (por defecto "08:00"). */
  get scheduleStartTime(): string {
    return this._parseTime(this._companySpecialty?.schedule?.timeFrom) ?? '08:00';
  }

  /** Intervalo en minutos entre slots del horario de la especialidad (por defecto 60). */
  get scheduleInterval(): number {
    const p = this._companySpecialty?.schedule?.periodicity;
    if (!p) return 60;
    const match = p.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 60;
  }

  /** Cantidad de horas de rango entre la hora de inicio y fin del horario (por defecto 8). */
  get scheduleHoursCount(): number {
    const sp = this._companySpecialty?.schedule;
    if (!sp) return 8;
    const from = this._parseTime(sp.timeFrom);
    const to   = this._parseTime(sp.timeTo);
    if (!from || !to) return 8;
    const [fh, fm] = from.split(':').map(Number);
    const [th, tm] = to.split(':').map(Number);
    const diff = (th * 60 + tm) - (fh * 60 + fm);
    return diff > 0 ? Math.ceil(diff / 60) : 8;
  }

  private _parseTime(raw: string | undefined): string | null {
    if (!raw) return null;
    const m = raw.match(/(\d{1,2}):(\d{2})/);
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
  }

  private get _days(): Day | undefined {
    return this.newShiftStateService.state().days?.find(d => d.isSelected);
  }

  private setSelectedAllDays() {
    this.daysOfWeek.map(day => (day.isSelected = true));
    this.newShiftStateService.set(this.step.DAYS, this.daysOfWeek);
  }

  private setDeSelectAllDays() {
    this.daysOfWeek.map(day => (day.isSelected = false));
    this.newShiftStateService.set(this.step.DAYS, this.daysOfWeek);
  }

  private get _selectedDaysWithSelectedTimes(): boolean {
    const hours = this.newShiftStateService.state().hours;
    if (!hours) return false;
    if (this._pack?.id === 4) {
      return Object.values(hours).some(dayHours => dayHours.some(h => h.isSelected));
    }
    const selectedDays = this.newShiftStateService.state().days ?? [];
    if (!selectedDays.length) return false;
    return selectedDays.every(day => hours[day.description]?.some(h => h.isSelected) ?? false);
  }
}
