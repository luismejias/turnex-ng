import { Component, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { NewShiftState } from '../../models/new-shift-state.interface';
import { daysOfWeek } from 'src/app/pages/constants';

const DAY_NAME_TO_INDEX: Record<string, number> = Object.fromEntries(
  daysOfWeek.map((d, i) => [d.description, i])
);

@Component({
  selector: 'turnex-new-shift-summary',
  imports: [DatePipe],
  templateUrl: './new-shift-summary.component.html',
  styleUrl: './new-shift-summary.component.scss',
})
export class NewShiftSummaryComponent {
  state!: NewShiftState;

  constructor(private newShiftStateService: NewShiftStateService) {
    effect(() => {
      this.state = this.newShiftStateService.state();
    });
  }

  get daysWithHours() {
    if (!this.state?.days || !this.state.hours) return [];
    return this.state.days.filter(day =>
      this.state.hours![day.description]?.some(h => h.isSelected)
    );
  }

  selectedHoursFor(dayDescription: string): string[] {
    return (this.state.hours?.[dayDescription] ?? [])
      .filter(h => h.isSelected)
      .map(h => h.description);
  }

  get nextShiftText(): string {
    if (!this.state?.days?.length || !this.state.hours) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let earliest: { date: Date; hour: string } | null = null;

    for (const day of this.state.days) {
      const selectedHours = (this.state.hours[day.description] ?? []).filter(h => h.isSelected);
      if (!selectedHours.length) continue;

      let dayDate: Date;
      if (day.date) {
        dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
      } else {
        const targetDow = DAY_NAME_TO_INDEX[day.description] ?? -1;
        if (targetDow === -1) continue;
        const todayDow = today.getDay();
        const diff = (targetDow - todayDow + 7) % 7 || 7;
        dayDate = new Date(today);
        dayDate.setDate(today.getDate() + diff);
      }

      const firstHour = selectedHours[0].description;
      const candidate = new Date(dayDate);
      const [h, m] = firstHour.split(':').map(Number);
      candidate.setHours(h, m, 0, 0);

      if (!earliest || candidate < earliest.date) {
        earliest = { date: candidate, hour: firstHour };
      }
    }

    if (!earliest) return '';
    const formatted = earliest.date.toLocaleDateString('es-AR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });
    return `Tu próxima clase comenzará el ${formatted} a las ${earliest.hour} hs.`;
  }
}
