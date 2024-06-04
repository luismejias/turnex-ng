import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
export interface Item {
  id: string,
  description: string,
  isSelected: boolean,
}
@Component({
  selector: 'turnex-selectable-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './selectable-card.component.html',
  styleUrl: './selectable-card.component.scss'
})
export class SelectableCardComponent {
  @Input({required: true}) item!:Item;
  @Output() itemSelected = new EventEmitter<string>();

  itemSelectedEmit(){
    this.itemSelected.emit(this.item.id)
  }
}
