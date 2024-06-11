import { Component, effect, inject, OnInit } from '@angular/core';
import { NgSwitch, NgSwitchDefault, NgSwitchCase, NgIf } from '@angular/common';
import { ShiftsComponent } from './pages/shifts/shifts.component';
import { RouterOutlet } from '@angular/router';
import { BottomBarComponent, NavbarComponent } from './components';
import { AppStateService } from './app.state.service';

@Component({
  selector: 'turnex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgSwitch, NgSwitchDefault, NgSwitchCase, NgIf, ShiftsComponent, RouterOutlet, NavbarComponent, BottomBarComponent]
})
export class AppComponent implements OnInit {
  title = 'turnex';
  appStateService = inject(AppStateService);
  isLoggedIn = false;
  isChildFlow = false;

  constructor(){
    effect(()=>{
      const state = this.appStateService.state();
      this.isLoggedIn = state.isLoggedIn;
      this.isChildFlow = state.isChildFlow;
    })
  }

  ngOnInit(): void {
    //TODO Temporal solo para test corregir al implementar backend
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if(isLoggedIn){
      this.appStateService.setLoggedIn();
    }
  }
}
