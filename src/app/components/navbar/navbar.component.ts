import { NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';

@Component({
  selector: 'turnex-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() isChildFlow!: boolean;
  appStateService = inject(AppStateService);
  logout(){
    this.appStateService.logout();
  }
}
