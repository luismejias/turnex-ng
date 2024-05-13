import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'turnex-shift-card',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss'
})
export class ShiftCardComponent {

}
