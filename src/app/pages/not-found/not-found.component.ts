import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';
import { AuthService } from 'src/app/shared/auth.service';
import { ButtonComponent, TitleComponent } from 'src/app/components';

@Component({
    selector: 'turnex-not-found',
    imports: [TitleComponent, ButtonComponent],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {
  private router = inject(Router);
  private appStateService = inject(AppStateService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.appStateService.set('isChildFlow', true);
  }

  goToHome(): void {
    this.appStateService.set('isChildFlow', false);
    const user = this.authService.getStoredUser();
    const destination = user?.role === 'SUPER_ADMIN' ? '/admin' : '/home';
    this.router.navigate([destination]);
  }
}
