import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { AdminSpecialty } from 'src/app/pages/admin/models/admin.models';

@Component({
  selector: 'turnex-select-specialty',
  imports: [NgClass],
  templateUrl: './select-specialty.component.html',
  styleUrl: './select-specialty.component.scss',
})
export class SelectSpecialtyComponent implements OnInit {
  @Input({ required: true }) companyId!: number;
  @Input() selectedId?: number;
  @Output() specialtySelected = new EventEmitter<AdminSpecialty>();

  private availabilityService = inject(AvailabilityService);

  specialties: AdminSpecialty[] = [];
  loading = true;

  ngOnInit(): void {
    this.availabilityService.getSpecialties(this.companyId).subscribe({
      next: (list) => {
        this.specialties = list;
        this.loading = false;
        if (this.selectedId) {
          const match = list.find(s => s.id === this.selectedId);
          if (match) this.specialtySelected.emit(match);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  select(sp: AdminSpecialty): void {
    this.specialties = this.specialties.map(s => ({ ...s, _selected: s.id === sp.id }));
    this.specialtySelected.emit(sp);
  }

  isSelected(sp: AdminSpecialty): boolean {
    return sp.id === this.selectedId;
  }
}
