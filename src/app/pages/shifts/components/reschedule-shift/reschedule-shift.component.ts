import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { daysOfWeek } from 'src/app/pages/constants';
import { CurrentWeek, Day, Hour } from '../../models';
import { Shift } from '../../models/shift.interface';
import { ShiftsService } from '../../service';
import { WeekPagerComponent } from '../week-pager/week-pager.component';

const HOURS_COUNT = 8;
const INTERVAL = 60;
const START_TIME = '8:00';

@Component({
  selector: 'turnex-reschedule-shift',
  imports: [TitleComponent, ButtonComponent, WeekPagerComponent, NgClass, DatePipe],
  templateUrl: './reschedule-shift.component.html',
  styleUrl: './reschedule-shift.component.scss',
})
export class RescheduleShiftComponent implements OnInit {
  @Input() shiftId!: string;

  shift: Shift | null = null;
  selectedDays: Day[] = [];
  selectedDaysWithTimes: Record<string, Hour[]> = {};
  selectedDayKey: string | null = null;
  selectedTime: string | null = null;
  selectedDate: Date | null = null;
  isLoading = false;
  isDone = false;
  hasError = false;

  private router = inject(Router);
  private shiftsService = inject(ShiftsService);

  ngOnInit(): void {
    const state = history.state as { shift?: Shift };
    this.shift = state?.shift ?? null;
  }

  get canConfirm(): boolean {
    return !!this.selectedTime && !!this.selectedDate && !this.isLoading;
  }

  setCurrentWeek(currentWeek: CurrentWeek): void {
    this.selectedDays = this._getDaysInRange(currentWeek);
    this.selectedDaysWithTimes = this._generateTimesForAllDays(this.selectedDays);
    this.selectedDayKey = null;
    this.selectedTime = null;
    this.selectedDate = null;
  }

  onHourSelect(dayKey: string, hour: Hour): void {
    const wasSelected = hour.isSelected;
    Object.values(this.selectedDaysWithTimes).forEach(hours =>
      hours.forEach(h => { h.isSelected = false; })
    );
    if (!wasSelected) {
      hour.isSelected = true;
      this.selectedDayKey = dayKey;
      this.selectedTime = hour.description;
      this.selectedDate = this.selectedDays.find(d => d.description === dayKey)?.date ?? null;
    } else {
      this.selectedDayKey = null;
      this.selectedTime = null;
      this.selectedDate = null;
    }
  }

  confirm(): void {
    if (!this.canConfirm || !this.shift || !this.selectedDate || !this.selectedTime) return;
    this.isLoading = true;

    const [h, m] = this.selectedTime.split(':').map(Number);
    const shiftDate = new Date(this.selectedDate);
    shiftDate.setHours(h, m, 0, 0);

    this.shiftsService.rescheduleShift(this.shift.id, shiftDate.toISOString(), this.selectedTime)
      .subscribe({
        next: () => { this.isLoading = false; this.isDone = true; },
        error: () => { this.isLoading = false; this.hasError = true; },
      });
  }

  goBack(): void {
    this.router.navigate(['/shifts']);
  }

  private _getDaysInRange(currentWeek: CurrentWeek): Day[] {
    const startDate = new Date(currentWeek.start);
    const endDate = new Date(currentWeek.end);
    const result: Day[] = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      result.push({
        description: daysOfWeek[d.getDay()].description,
        date: new Date(d),
        isSelected: false,
      });
    }
    return result;
  }

  private _generateTimesForAllDays(days: Day[]): Record<string, Hour[]> {
    const result: Record<string, Hour[]> = {};
    days.forEach(day => { result[day.description] = this._generateTimes(); });
    return result;
  }

  private _generateTimes(): Hour[] {
    const times: Hour[] = [];
    const [startH, startM] = START_TIME.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;
    for (let i = 0; i < HOURS_COUNT * 60; i += INTERVAL) {
      const total = startInMinutes + i;
      times.push({
        description: `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`,
        isSelected: false,
      });
    }
    return times;
  }
}
