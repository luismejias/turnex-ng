import { Component, Input } from '@angular/core';

@Component({
  selector: 'turnex-title',
  standalone: true,
  imports: [],
  templateUrl: './title.component.html',
  styleUrl: './title.component.scss'
})
export class TitleComponent {

  @Input({required: true}) text = '';

}
