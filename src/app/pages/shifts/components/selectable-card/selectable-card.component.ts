import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Item {
  id: number;
  description: string;
  isSelected?: boolean;
}

@Component({
  selector: 'turnex-selectable-card',
  imports: [NgClass],
  templateUrl: './selectable-card.component.html',
  styleUrl: './selectable-card.component.scss',
})
export class SelectableCardComponent {
  @Input({ required: true }) item!: Item;
  @Output() itemSelected = new EventEmitter<number>();

  itemSelectedEmit() {
    this.itemSelected.emit(this.item.id);
  }
}
