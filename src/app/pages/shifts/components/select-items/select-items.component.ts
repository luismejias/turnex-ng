import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pack, Specialty } from 'src/app/models';
import { SelectableCardComponent } from '../selectable-card/selectable-card.component';

@Component({
  selector: 'turnex-select-items',
  imports: [SelectableCardComponent],
  templateUrl: './select-items.component.html',
  styleUrl: './select-items.component.scss',
})
export class SelectItemsComponent {
  @Input({ required: true }) items!: Pack[] | Specialty[];
  @Output() itemSelected = new EventEmitter<Pack | Specialty>();

  itemSelectedEmit(item: Pack | Specialty) {
    this.itemSelected.emit(item);
  }
}
