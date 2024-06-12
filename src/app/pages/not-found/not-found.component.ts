import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';
import { ButtonComponent, TitleComponent } from 'src/app/components';

@Component({
  selector: 'turnex-not-found',
  standalone: true,
  imports: [TitleComponent, ButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit{
  private router = inject(Router);
  private appStateService = inject(AppStateService);

ngOnInit(): void {
    this.appStateService.set('isChildFlow', true);
}

  goToHome(){
    this.appStateService.set('isChildFlow', false);
    this.router.navigate(['/home']);
  }

}
