import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CurrentWeek } from '../../models';

@Component({
  selector: 'turnex-week-pager',
  standalone: true,
  imports: [],
  templateUrl: './week-pager.component.html',
  styleUrl: './week-pager.component.scss'
})
export class WeekPagerComponent implements OnInit {
  @Output() currentWeekData = new EventEmitter<CurrentWeek>();
  private currentDate = new Date();
  private currentWeekStart = this.getStartOfWeek(this.currentDate);
  private currentWeekEnd = this.getEndOfWeek(this.currentDate);
  week!: string
  ngOnInit(): void {
    this.week = this.getCurrentWeek();
  }

  nextWeek() {
    this.currentWeekStart = this.adjustDateByDays(this.currentWeekStart, 7);
    this.currentWeekEnd = this.getEndOfWeek(this.currentWeekStart);
    this.week = this.getCurrentWeek();
    this.currentWeekEmit();
  }

  previousWeek() {
    this.currentWeekStart = this.adjustDateByDays(this.currentWeekStart, -7);
    this.currentWeekEnd = this.getEndOfWeek(this.currentWeekStart);
    this.week = this.getCurrentWeek();
    this.currentWeekEmit();
  }

  private adjustDateByDays(date: Date, days: number): Date {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + days);
    return adjustedDate;
  }

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Ajustar si es domingo (0) para que sea el inicio de la semana (lunes)
    start.setDate(diff);
    start.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00.000
    return start;
}

  currentWeekEmit() {

    console.log({
      start: this.currentWeekStart,
      end: this.currentWeekEnd
    });

    this.currentWeekData.emit({
      start: this.currentWeekStart,
      end: this.currentWeekEnd
    });
  }

  getCurrentWeek(): string {
    return `${this.formatDate(this.currentWeekStart)} - ${this.formatDate(this.currentWeekEnd)}`;
  }

  private getEndOfWeek(date: Date): Date {
    const end = new Date(date);
    const day = end.getDay();
    const diff = end.getDate() + (7 - day); // Adjust to get the end of the week (Saturday)
    end.setDate(diff);
    return end;
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'long' });
    return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  }

}
