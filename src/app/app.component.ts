import { Component, effect, inject, OnInit } from '@angular/core';
import { NgSwitch, NgSwitchDefault, NgSwitchCase, NgIf } from '@angular/common';
import { ShiftsComponent } from './pages/shifts/shifts.component';
import { RouterOutlet } from '@angular/router';
import { BottomBarComponent, NavbarComponent } from './components';
import { AppStateService } from './app.state.service';
import { BreakpointObserver } from '@angular/cdk/layout';
@Component({
  selector: 'turnex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgSwitch, NgSwitchDefault, NgSwitchCase, NgIf, ShiftsComponent, RouterOutlet, NavbarComponent, BottomBarComponent]
})
export class AppComponent implements OnInit {
  title = 'turnex';
  private appStateService = inject(AppStateService);
  private breakpointObserver = inject(BreakpointObserver)
  isLoggedIn = false;
  isChildFlow = false;
  isMobile= false;

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

    this.breakpointObserver.observe('(max-width: 500px)').subscribe(result => {
      if(result.matches){
        this.isMobile = true;
      } else{
        this.isMobile = false;
      }

  });

  }
}
