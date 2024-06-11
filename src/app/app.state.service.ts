import { inject, Injectable } from '@angular/core';
import { SimpleStoreService } from './simple-store.service';
import { AppState } from './models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppStateService extends SimpleStoreService<AppState> {
  router = inject(Router);
  constructor() {
    super();
    this.setInitialState();
  }

  setInitialState() {
    this.state.set({
      isLoggedIn: false,
      isChildFlow: false
    })
  }
// Manejo temporal de login y logout
  login(){
    this.setLoggedIn();
    this.router.navigate(['/home']);
    localStorage.setItem('isLoggedIn', 'true');
  }

  setLoggedIn(){
    this.state.set({isLoggedIn: true, isChildFlow: false});
  }

  logout(){
    this.setInitialState();
    this.router.navigate(['/login']);
    localStorage.removeItem('isLoggedIn');
  }
}
