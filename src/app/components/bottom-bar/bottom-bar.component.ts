import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';

@Component({
  selector: 'turnex-bottom-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss',
})
export class BottomBarComponent {
  private appStateService = inject(AppStateService);
  isChildFlow = false;
  constructor() {
    effect(() => {
      this.isChildFlow = this.appStateService.state().isChildFlow;
    });
  }
}
