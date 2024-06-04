import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'turnex-bottom-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss'
})
export class BottomBarComponent {

}
