import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, output } from '@angular/core';

@Component({
  selector: 'turnex-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() disabled = false;
  @Input({required: true}) text = '';
  @Input() type: 'submit' | 'reset' = 'submit';
  @Output() buttonClicked: EventEmitter<void> = new EventEmitter();

  onButtonClicked(): void {
    this.buttonClicked.emit();
  }

}
