import { Component } from '@angular/core';
import { NgSwitch, NgSwitchDefault, NgSwitchCase } from '@angular/common';
import { ShiftsComponent } from './pages/shifts/shifts.component';
import { RouterOutlet } from '@angular/router';
import { BottomBarComponent, NavbarComponent } from './components';

@Component({
  selector: 'turnex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgSwitch, NgSwitchDefault, NgSwitchCase, ShiftsComponent, RouterOutlet, NavbarComponent, BottomBarComponent]
})
export class AppComponent {
  title = 'turnex';

}
