import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { daysOfWeek } from 'src/app/pages/constants';
import { SelectableCardComponent } from '../selectable-card/selectable-card.component';
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


@Component({
  selector: 'turnex-new-shift',
  standalone: true,
  imports: [
    CommonModule, TitleComponent, ButtonComponent, SelectableCardComponent,
    SelectItemsComponent, SelectDayComponent, SelectHourComponent, NewShiftSummaryComponent, NgFor, NgClass, NgIf
  ],
  templateUrl: './new-shift.component.html',
  styleUrl: './new-shift.component.scss',
  providers: [NewShiftStateService]
})
export class NewShiftComponent implements OnInit {
  private newShiftStateService = inject(NewShiftStateService);
  private router= inject(Router);
  private packsService = inject(PacksService);
  private specialtyService = inject(SpecialtyService);
  @Input() idSpecialty!: string;
  title: string = '';
  subTitle: string = '';
  nextButtonText: string = 'Siguiente';
  previousButtonText: string = 'Anterior';
  errorOnSave: boolean = false;
  step = step;
  isNextButtonDisabled: boolean = true;
  daysOfWeek: Day[] = daysOfWeek;
  selectedDays!: Day[];
  selectedDaysWithSelectedTimes!: Record<string, Hour[]>;
  hours: Hour[] = [];
  state!: NewShiftState;
  specialties!: Specialty[];
  packs!: Pack[];

  constructor() {
    this.updateStep(1);
    effect(() => {
      console.log('CAMBIO EL ESTADO => ', this.newShiftStateService.state());
      this.state = this.newShiftStateService.state();
      this.setTitleSubtitle();
      this.validateNextButton();
    })
  }

  ngOnInit(): void {
      this.getAllPacks();
      this.getAllSpecialties();
      if(this.idSpecialty){
        this.toggleSelection('specialty', {id: this.idSpecialty, description:'', isSelected: true});
        this.updateStep(2);
      }
  }

  updateStep(step: number): void {
    this.newShiftStateService.set('step', step);
  }

  get $step() {
    return this.newShiftStateService.state().step;
  }

  goToShifts() {
    this.router.navigate(["/shifts"]);
  }

  getAllPacks(): void {
    this.packsService.getAllPacks().subscribe((packs: Pack[]) => {
      this.packs = packs;
    })
  }

  getAllSpecialties(): void {
    this.specialtyService.getAllSpecialties().subscribe((specialties: Specialty[]) => {
      this.specialties = specialties;
    })
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
        this.isNextButtonDisabled = !this._day;
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
        this.subTitle = 'Podrás cambiar de pack siempre que lo necesites. Al solicitar el cambio de pack se verá reflejado al mes siguiente. En caso de requerir clases adicionales, siempre podrás adquirir clases sueltas.';
        break;
      case 3:
        this.title = 'Elige los días de tus turnos';
        this.subTitle = 'Tienes el Pack de 4 clases activo, elige los días de la semana que más te convengan.';
        break;
      case 4:
        this.title = 'Te mostramos los horarios disponibles para cada día seleccionado, elige los que más te convengan.';
        this.subTitle = 'Podrás cancelar, reagendar o pedir un turno nuevo siempre que lo necesites con un mínimos de 24hs de antelación.';
        break;
      case 5:
        this.title = '¡Ya casi estamos!';
        this.subTitle = 'Confirma los datos de tu solicitud y, si está todo bien, presiona el botón “Agendar”.';
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
    this.daysOfWeek.map(day => day.isSelected = false);
  }

  onNextButton() {
    switch (this.$step) {
      case 1:
        if (this._specialty) {
          this.updateStep(2);
        }
        break;
      case 2:
        if (this._pack) {
          this.updateStep(3);
        }
        break;
      case 3:
        if (this._day) {
          this.updateStep(4);
        }
        break;
      case 4:
        if (this.hours) {
          this.updateStep(5);
        }
        break;
      case 5:
        this.updateStep(6);
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
        this.updateStep(1)
        break;
    }
  }

  onPreviousButton() {
    const previousState = this.$step - 1;
    if (previousState > 0) {
      this.updateStep(previousState);
    }
  }

  toggleSelection(itemType: 'pack' | 'specialty', item: Pack | Specialty): void {
    console.log({itemType}, {item});

    const itemId = item.id;
    const items = itemType === 'pack' ? this.packs : this.specialties;
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, isSelected: !item.isSelected };
      } else {
        return { ...item, isSelected: false };
      }
    });
    if (itemType === 'pack') {
      this.packs = updatedItems as Pack[];
      if (this._pack) {
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
    if (this.errorOnSave) {
      this.title = '¡Hubo un error al agendar tus turnos de Pilates!';
      this.subTitle = 'Por favor intenta de nuevo más tarde.';
      this.nextButtonText = 'Volver al inicio'
    } else {
      this.title = '¡Has agendado tus turnos de Pilates con éxito!';
      this.subTitle = 'Puedes cancelar o re-agendar tus clases siempre que lo necesites desde la sección “Turnos” con un mínimo de 24 hs de anticipación.';
      this.nextButtonText = 'Ver mis Turnos';
      this.previousButtonText = 'Volver al inicio';
    }
  }

  private get _specialty(): Specialty | undefined {
    return this.specialties.find(specialty => specialty.isSelected);
  }

  private get _pack(): Pack | undefined {
    return this.packs.find(pack => pack.isSelected);
  }

  private get _day(): Day | undefined {
    return this.daysOfWeek.find(day => day.isSelected);
  }


  private get _selectedDaysWithSelectedTimes(): boolean {
    const days = this.newShiftStateService.state().hours;
    for (const day in days) {
      if (days[day].some(hour => hour.isSelected)) {
        return true;
      }
    }
    return false;
  }
}

