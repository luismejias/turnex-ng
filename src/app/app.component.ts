import { Component, OnInit } from '@angular/core';
import { NgSwitch, NgSwitchDefault, NgSwitchCase } from '@angular/common';
import { ShiftsComponent } from './pages/shifts/shifts.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgSwitch, NgSwitchDefault, NgSwitchCase, ShiftsComponent, RouterOutlet, RouterLink]
})
export class AppComponent implements OnInit {
  title = 'turnex';
  ngOnInit() {
  }

}
