import { CommonModule, NgClass } from '@angular/common';
import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { daysOfWeek } from 'src/app/pages/constants';
import { SelectItemsComponent } from '../select-items/select-items.component';
import { Day, Hour } from '../../models';
import { Pack, Specialty, step } from 'src/app/models';
import { NewShiftStateService } from './new-shift.state.service';
import { SelectHourComponent } from '../select-hour/select-hour.component';
import { NewShiftSummaryComponent } from '../new-shift-summary/new-shift-summary.component';
import { NewShiftState } from '../../models/new-shift-state.interface';
import { Router } from '@angular/router';
import { SelectDayComponent } from '../select-day/select-day.component';
import { PacksService } from 'src/app/pages/packs';
import { SpecialtyService } from 'src/app/pages/specialty';
import { ShiftsService } from '../../service';

@Component({
  selector: 'turnex-new-shift',
  imports: [
    CommonModule,
    TitleComponent,
    ButtonComponent,
    SelectItemsComponent,
    SelectDayComponent,
    SelectHourComponent,
    NewShiftSummaryComponent,
    NgClass,
  ],
  templateUrl: './new-shift.component.html',
  styleUrl: './new-shift.component.scss',
  providers: [NewShiftStateService],
})
export class NewShiftComponent implements OnInit {
  private newShiftStateService = inject(NewShiftStateService);
  private router = inject(Router);
  private packsService = inject(PacksService);
  private shiftsService = inject(ShiftsService);
  private specialtyService = inject(SpecialtyService);
  @Input() idSpecialty!: string;
  @Input() packId?: string;
  title: string = '';
  subTitle: string = '';
  nextButtonText: string = 'Siguiente';
  previousButtonText: string = 'Anterior';
  errorOnSave: boolean = false;
  step = step;
  isNextButtonDisabled: boolean = true;
  daysOfWeek: Day[] = daysOfWeek.map(d => ({ ...d }));
  selectedDays!: Day[];
  selectedDaysWithSelectedTimes!: Record<string, Hour[]>;
  hours: Hour[] = [];
  state!: NewShiftState;
  specialties!: Specialty[];
  packs!: Pack[];

  constructor() {
    this.updateStep(1);
    effect(() => {
      this.state = this.newShiftStateService.state();
      this.setTitleSubtitle();
      this.validateNextButton();
    });
  }

  ngOnInit(): void {
    this.getAllPacks();
    this.getAllSpecialties();
  }

  updateStep(step: number): void {
    this.newShiftStateService.set('step', step);
  }

  get $step() {
    return this.newShiftStateService.state().step;
  }

  goToShifts() {
    this.router.navigate(['/shifts']);
  }

  getAllPacks(): void {
    this.packsService.getAllPacks().subscribe((packs: Pack[]) => {
      this.packs = packs;
      if (this.packId) {
        this._preselectPack(Number(this.packId));
      }
    });
  }

  getAllSpecialties(): void {
    this.specialtyService.getAllSpecialties().subscribe((specialties: Specialty[]) => {
      this.specialties = specialties;
      if (this.idSpecialty) {
        this._preselectSpecialty(Number(this.idSpecialty));
        if (!this.packId) {
          this.updateStep(2);
        }
      }
    });
  }

  private _preselectSpecialty(id: number): void {
    const found = this.specialties.find(s => s.id === id);
    if (!found) return;
    this.specialties = this.specialties.map(s => ({ ...s, isSelected: s.id === id }));
    this.newShiftStateService.set(this.step.SPECIALTY, { ...found, isSelected: true });
  }

  private _preselectPack(id: number): void {
    const found = this.packs.find(p => p.id === id);
    if (!found) return;
    this.packs = this.packs.map(p => ({ ...p, isSelected: p.id === id }));
    this.newShiftStateService.set(this.step.PACK, { ...found, isSelected: true });
    id === 4 ? this.setSelectedAllDays() : this.setDeSelectAllDays();
    this.updateStep(id === 4 ? 4 : 3);
  }

  validateNextButton(): void {
    switch (this.$step) {
      case 1:
        this.isNextButtonDisabled = !this._specialty;
        break;
      case 2:
        this.isNextButtonDisabled = !this._pack;
        break;
      case 3:
        this.isNextButtonDisabled = !this._days;
        break;
      case 4:
        this.isNextButtonDisabled = !this._selectedDaysWithSelectedTimes;
        break;
      case 5:
        this.isNextButtonDisabled = false;
        break;
      case 6:
        this.isNextButtonDisabled = false;
        break;
      default:
        this.isNextButtonDisabled = true;
    }
  }

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
        this.title =
          'Te mostramos los horarios disponibles para cada día seleccionado, elige los que más te convengan.';
        this.subTitle =
          'Podrás cancelar, reagendar o pedir un turno nuevo siempre que lo necesites con un mínimos de 24hs de antelación.';
        break;
      case 5:
        this.title = '¡Ya casi estamos!';
        this.subTitle =
          'Confirma los datos de tu solicitud y, si está todo bien, presiona el botón “Agendar”.';
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
        if (this._specialty) {
          this.updateStep(2);
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
        if (this._days) {
          this.updateStep(4);
        }
        break;
      case 4:
        if (this.hours) {
          this.updateStep(5);
        }
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
        break;
    }
  }

  onPreviousButton() {
    const previousState =
      this._pack?.id === 4 ? this.$step - 2 : this.$step - 1;
    if (previousState > 0) {
      this.updateStep(previousState);
    }
  }

  toggleSelection(
    itemType: 'pack' | 'specialty',
    item: Pack | Specialty
  ): void {
    const itemId = item.id;
    const items = itemType === 'pack' ? this.packs : this.specialties;
    const updatedItems = items?.map(item => {
      if (item.id === itemId) {
        return { ...item, isSelected: !item.isSelected };
      } else {
        return { ...item, isSelected: false };
      }
    });
    if (itemType === 'pack') {
      this.packs = updatedItems as Pack[];
      if (this._pack) {
        //Si el pack es turno suelto selecciono todos los dias por defecto si no desSelecciono todos los dias
        this._pack.id === 4
          ? this.setSelectedAllDays()
          : this.setDeSelectAllDays();
        this.newShiftStateService.set(this.step.PACK, this._pack);
      } else {
        this.newShiftStateService.set(this.step.PACK, undefined);
      }
    } else {
      this.specialties = updatedItems as Specialty[];
      if (this._specialty) {
        this.newShiftStateService.set(this.step.SPECIALTY, this._specialty);
      } else {
        this.newShiftStateService.set(this.step.SPECIALTY, undefined);
      }
    }
  }

  getShiftSchedulingResult() {
    const specialty = this.state.specialty?.description ?? '';
    if (this.errorOnSave) {
      this.title = `¡Hubo un error al agendar tus turnos de ${specialty}!`;
      this.subTitle = 'Por favor intenta de nuevo más tarde.';
      this.nextButtonText = 'Volver al inicio';
    } else {
      this.title = `¡Has agendado tus turnos de ${specialty} con éxito!`;
      this.subTitle =
        'Puedes cancelar o re-agendar tus clases siempre que lo necesites desde la sección “Turnos” con un mínimo de 24 hs de anticipación.';
      this.nextButtonText = 'Ver mis Turnos';
      this.previousButtonText = 'Volver al inicio';
    }
  }

  saveShifts(): void {
    this.shiftsService.saveShifts(this.state).subscribe({
      next: () => {
        this.errorOnSave = false;
        this.updateStep(6);
      },
      error: () => {
        this.errorOnSave = true;
        this.updateStep(6);
      },
    });
  }

  private get _specialty(): Specialty | undefined {
    return this.specialties ? this.specialties.find(specialty => specialty.isSelected) : undefined;
  }

  private get _pack(): Pack | undefined {
    return this.packs?.find(pack => pack.isSelected);
  }

  get packMaxDays(): number {
    const pack = this._pack;
    if (!pack) return 1;
    // Use classCount from API; fall back to parsing the description ("4 clases al mes" → 4)
    const count = pack.classCount
      ?? parseInt(pack.description.match(/^(\d+)/)?.[1] ?? '1', 10);
    return Math.min(count, 7);
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

    // Clase suelta: at least 1 hour selected anywhere
    if (this._pack?.id === 4) {
      return Object.values(hours).some(dayHours => dayHours.some(h => h.isSelected));
    }

    // Regular pack: every selected day must have exactly 1 hour selected
    const selectedDays = this.newShiftStateService.state().days ?? [];
    if (selectedDays.length !== this.packMaxDays) return false;
    return selectedDays.every(day => hours[day.description]?.some(h => h.isSelected) ?? false);
  }
}
