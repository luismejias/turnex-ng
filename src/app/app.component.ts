import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BottomBarComponent, NavbarComponent } from './components';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
import { AppStateService } from './app.state.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IdleService } from './shared/services/idle.service';
import { MatDialog } from '@angular/material/dialog';
import { IdleModalComponent } from './shared/components/idle-modal/idle-modal.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'turnex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NavbarComponent, BottomBarComponent, LoadingOverlayComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'turnex';
  private appStateService = inject(AppStateService);
  private breakpointObserver = inject(BreakpointObserver);
  private idleService = inject(IdleService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  isLoggedIn = false;
  isChildFlow = false;
  isMobile = false;
  isAdminRoute = false;

  private _idleSub: Subscription | null = null;
  private _routerSub: Subscription | null = null;
  private _modalOpen = false;

  constructor() {
    effect(() => {
      const state = this.appStateService.state();
      this.isLoggedIn = state.isLoggedIn;
      this.isChildFlow = state.isChildFlow;
      this._onLoginStateChange(state.isLoggedIn);
    });
  }

  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      this.appStateService.setLoggedIn();
    }

    this.isAdminRoute = this.router.url.startsWith('/admin');
    this._routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute = e.urlAfterRedirects.startsWith('/admin');
      });

    this.breakpointObserver.observe('(max-width: 500px)').subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  private _onLoginStateChange(loggedIn: boolean): void {
    if (loggedIn) {
      this._startIdle();
    } else {
      this._stopIdle();
    }
  }

  private _startIdle(): void {
    this.idleService.start();
    this._idleSub?.unsubscribe();
    this._idleSub = this.idleService.idle$.subscribe(() => this._onIdle());
  }

  private _stopIdle(): void {
    this.idleService.stop();
    this._idleSub?.unsubscribe();
    this._idleSub = null;
  }

  private _onIdle(): void {
    if (this._modalOpen) return;
    this._modalOpen = true;

    const ref = this.dialog.open(IdleModalComponent, {
      disableClose: true,
      width: '320px',
    });

    ref.afterClosed().subscribe((result: 'stay' | 'logout') => {
      this._modalOpen = false;
      if (result === 'logout') {
        this._doLogout();
      } else {
        this.idleService.reset();
      }
    });
  }

  private _doLogout(): void {
    this._stopIdle();
    this.appStateService.logout();
  }

  ngOnDestroy(): void {
    this._stopIdle();
    this._routerSub?.unsubscribe();
  }
}
